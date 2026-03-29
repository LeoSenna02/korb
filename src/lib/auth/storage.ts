/**
 * Auth Storage — LocalStorage abstraction layer
 * Requires browser environment (check with typeof window !== 'undefined')
 *
 * Note: Auth session is now handled via JWT in httpOnly cookies (see jwt.ts).
 * This module handles user persistence and LocalStorage-backed baby data.
 */

import type { StoredUser, Session } from "./types";
import { generateToken, generateSalt, hashPassword } from "./crypto";

const STORAGE_KEYS = {
  USER_INDEX: "korb:user_index",        // string[] of user IDs
  EMAIL_INDEX: "korb:email_index",      // JSON: { [email]: userId }
  USER_PREFIX: "korb:user:",            // "korb:user:{id}" → StoredUser JSON (plain, has hash)
  AUTH_VERSION: "korb:auth_version",    // "2" — version for migrations
  // Client-side hydration data (public user fields only — JWT is the real auth)
  SESSION_USER_DATA: "korb:session_user",
  // Legacy keys (kept for migration cleanup)
  SESSION: "korb:session",
  SESSION_DATA: "korb:session_data",
} as const;

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const REFRESH_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ─── Generic helpers ─────────────────────────────────────────────

function getItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function setItem(key: string, value: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
}

function removeItem(key: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}

// ─── User index (ID list) ────────────────────────────────────────

function getUserIndex(): string[] {
  const raw = getItem(STORAGE_KEYS.USER_INDEX);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function setUserIndex(ids: string[]): void {
  setItem(STORAGE_KEYS.USER_INDEX, JSON.stringify(ids));
}

// ─── Email index (email → userId, for O(1) lookups) ─────────────

function getEmailIndex(): Record<string, string> {
  const raw = getItem(STORAGE_KEYS.EMAIL_INDEX);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

function setEmailIndex(index: Record<string, string>): void {
  setItem(STORAGE_KEYS.EMAIL_INDEX, JSON.stringify(index));
}

function addToEmailIndex(email: string, userId: string): void {
  const index = getEmailIndex();
  index[email.toLowerCase()] = userId;
  setEmailIndex(index);
}

function removeFromEmailIndex(email: string): void {
  const index = getEmailIndex();
  delete index[email.toLowerCase()];
  setEmailIndex(index);
}

// ─── User CRUD ───────────────────────────────────────────────────

export async function getStoredUserById(id: string): Promise<StoredUser | null> {
  const raw = getItem(STORAGE_KEYS.USER_PREFIX + id);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

async function saveStoredUser(user: StoredUser): Promise<void> {
  setItem(STORAGE_KEYS.USER_PREFIX + user.id, JSON.stringify(user));
}

export async function deleteUserById(id: string): Promise<void> {
  const user = await getStoredUserById(id);
  if (user) {
    removeFromEmailIndex(user.email);
  }
  removeItem(STORAGE_KEYS.USER_PREFIX + id);
  setUserIndex(getUserIndex().filter((uid) => uid !== id));
}

// ─── Email lookup (O(1) via index) ──────────────────────────────

export async function isEmailTaken(email: string): Promise<boolean> {
  const index = getEmailIndex();
  const normalized = email.toLowerCase().trim();
  const userId = index[normalized];
  if (!userId) return false;
  // Also verify the user still exists (handles edge case of deleted user)
  const user = await getStoredUserById(userId);
  return user !== null;
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const normalized = email.toLowerCase().trim();
  const index = getEmailIndex();
  const userId = index[normalized];
  if (!userId) return null;
  return getStoredUserById(userId);
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  return getStoredUserById(id);
}

// ─── Create user (with email index) ─────────────────────────────

export async function createUser(
  name: string,
  email: string,
  password: string
): Promise<StoredUser> {
  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);

  const user: StoredUser = {
    id: generateToken(),
    email: email.toLowerCase().trim(),
    name: name.trim(),
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  };

  await saveStoredUser(user);

  // Add to both indexes
  const index = getUserIndex();
  index.push(user.id);
  setUserIndex(index);
  addToEmailIndex(user.email, user.id);

  return user;
}

// ─── Password change ───────────────────────────────────────────────

export async function updateUserPassword(
  userId: string,
  newPassword: string
): Promise<void> {
  const user = await getStoredUserById(userId);
  if (!user) throw new Error("User not found");

  const newSalt = generateSalt();
  const newHash = await hashPassword(newPassword, newSalt);

  const updated: StoredUser = {
    ...user,
    passwordHash: newHash,
    salt: newSalt,
  };

  await saveStoredUser(updated);
}

// ─── Session management (legacy — kept for migration cleanup) ────

export function getCurrentSession(): Session | null {
  const raw = getItem(STORAGE_KEYS.SESSION);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as Session;
    if (new Date(session.expiresAt) < new Date()) {
      clearLegacySession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function saveSession(session: Session): void {
  setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
}

export function clearLegacySession(): void {
  // Legacy session cleanup — called on migration from old auth system
  removeItem(STORAGE_KEYS.SESSION);
  removeItem(STORAGE_KEYS.SESSION_DATA);
  removeItem(STORAGE_KEYS.SESSION_USER_DATA);
}

// ─── Client-side hydration (public user fields only) ───────────────

export type PublicUserData = Omit<StoredUser, "passwordHash" | "salt">;

export function getSessionUserData(): PublicUserData | null {
  const raw = getItem(STORAGE_KEYS.SESSION_USER_DATA);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PublicUserData;
  } catch {
    return null;
  }
}

export function saveSessionUserData(user: PublicUserData): void {
  setItem(STORAGE_KEYS.SESSION_USER_DATA, JSON.stringify(user));
}

export function clearSessionUserData(): void {
  removeItem(STORAGE_KEYS.SESSION_USER_DATA);
}

export function createSession(userId: string): Session {
  const now = new Date();
  const session: Session = {
    userId,
    token: generateToken(),
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_DURATION_MS).toISOString(),
    refreshToken: generateToken(),
  };
  saveSession(session);
  return session;
}

export function refreshSession(session: Session): Session {
  const now = new Date();
  return {
    ...session,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_DURATION_MS).toISOString(),
    refreshToken: generateToken(),
  };
}

export function isSessionExpiringSoon(session: Session): boolean {
  const expiresAt = new Date(session.expiresAt);
  const threshold = new Date(Date.now() + REFRESH_THRESHOLD_MS);
  return expiresAt < threshold;
}

// ─── Storage integrity ────────────────────────────────────────────

export function isHydrated(): boolean {
  return getItem(STORAGE_KEYS.USER_INDEX) !== null;
}

export function clearAllAuthData(): void {
  clearLegacySession();
  const index = getUserIndex();
  for (const id of index) {
    removeItem(STORAGE_KEYS.USER_PREFIX + id);
  }
  setUserIndex([]);
  setEmailIndex({});
}
