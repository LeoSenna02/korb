/**
 * Auth Service — High-level auth operations
 * Auth session is now handled via JWT in httpOnly cookies (jwt.ts).
 * This service handles user CRUD and returns data needed for cookie setting.
 */

import type { AuthResult, AuthError, StoredUser } from "./types";
import { hashPassword, secureCompare } from "./crypto";
import {
  isEmailTaken,
  createUser,
  findUserByEmail,
  findUserById,
  updateUserPassword,
  createSession,
  getCurrentSession,
  isSessionExpiringSoon,
  clearLegacySession,
  saveSessionUserData,
  clearSessionUserData,
} from "./storage";

// ─── Register ─────────────────────────────────────────────────────

export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthResult | AuthError> {
  try {
    const taken = await isEmailTaken(email);
    if (taken) {
      return {
        code: "EMAIL_ALREADY_EXISTS",
        message: "Este e-mail já está cadastrado",
      };
    }

    const storedUser = await createUser(name, email, password);

    const session = createSession(storedUser.id);

    const { passwordHash: _, salt: __, ...userPublic } = storedUser;

    saveSessionUserData(userPublic);

    return {
      success: true,
      user: userPublic,
      session,
    };
  } catch (err) {
    console.error("[AuthService] Register error:", err);
    return {
      code: "UNKNOWN_ERROR",
      message: "Erro ao criar conta. Tente novamente.",
    };
  }
}

// ─── Login ───────────────────────────────────────────────────────

export async function login(
  email: string,
  password: string
): Promise<AuthResult | AuthError> {
  try {
    const storedUser = await findUserByEmail(email);
    if (!storedUser) {
      return {
        code: "USER_NOT_FOUND",
        message: "E-mail ou senha incorretos",
      };
    }

    const inputHash = await hashPassword(password, storedUser.salt);
    const passwordMatch = secureCompare(inputHash, storedUser.passwordHash);

    if (!passwordMatch) {
      return {
        code: "INVALID_PASSWORD",
        message: "E-mail ou senha incorretos",
      };
    }

    const existingSession = getCurrentSession();
    let session: ReturnType<typeof createSession>;

    if (
      existingSession &&
      existingSession.userId === storedUser.id &&
      !isSessionExpiringSoon(existingSession)
    ) {
      session = existingSession;
    } else {
      // Clean up old session if exists
      if (existingSession) {
        clearLegacySession();
      }
      session = createSession(storedUser.id);
    }

    const { passwordHash: _, salt: __, ...userPublic } = storedUser;

    saveSessionUserData(userPublic);

    return {
      success: true,
      user: userPublic,
      session,
    };
  } catch (err) {
    console.error("[AuthService] Login error:", err);
    return {
      code: "UNKNOWN_ERROR",
      message: "Erro ao fazer login. Tente novamente.",
    };
  }
}

// ─── Logout ────────────────────────────────────────────────────────

export function logout(): void {
  // Clear LocalStorage session data
  clearLegacySession();
  clearSessionUserData();
  // Note: cookie clearing is done via Server Action (set-cookie header with max-age=0)
}

// ─── Session restoration ───────────────────────────────────────────

export async function restoreSession(): Promise<{
  user: Omit<StoredUser, "passwordHash" | "salt"> | null;
  session: ReturnType<typeof getCurrentSession>;
}> {
  const session = getCurrentSession();

  if (!session) {
    return { user: null, session: null };
  }

  // Find user by ID stored in session
  const storedUser = await findUserById(session.userId);
  if (!storedUser) {
    return { user: null, session: null };
  }

  const { passwordHash: _, salt: __, ...userPublic } = storedUser;
  return { user: userPublic, session };
}

// ─── Password change ───────────────────────────────────────────────

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<AuthError | { success: true }> {
  try {
    const storedUser = await findUserById(userId);
    if (!storedUser) {
      return {
        code: "UNKNOWN_ERROR",
        message: "Usuário não encontrado",
      };
    }

    // Verify current password
    const inputHash = await hashPassword(currentPassword, storedUser.salt);
    const passwordMatch = secureCompare(inputHash, storedUser.passwordHash);

    if (!passwordMatch) {
      return {
        code: "INVALID_PASSWORD",
        message: "Senha atual incorreta",
      };
    }

    // Update with new password
    await updateUserPassword(userId, newPassword);

    return { success: true };
  } catch (err) {
    console.error("[AuthService] changePassword error:", err);
    return {
      code: "UNKNOWN_ERROR",
      message: "Erro ao alterar senha",
    };
  }
}
