/**
 * Auth Crypto Module — Web Crypto API only
 * All functions require a browser environment
 */

const PBKDF2_ITERATIONS = 120_000;
const SALT_LENGTH = 16;
const KEY_LENGTH = 256;
const TOKEN_LENGTH = 32;
const IV_LENGTH = 12;

// ─── Helpers ──────────────────────────────────────────────────────

/** Create a Uint8Array backed by a plain ArrayBuffer */
function createBuffer(length: number): Uint8Array<ArrayBuffer> {
  return new Uint8Array(new ArrayBuffer(length));
}

// ─── Salt generation ──────────────────────────────────────────────

export function generateSalt(): string {
  const salt = createBuffer(SALT_LENGTH);
  crypto.getRandomValues(salt);
  return uint8ArrayToBase64(salt);
}

// ─── Password hashing (PBKDF2) ────────────────────────────────────

export async function hashPassword(
  password: string,
  salt: string
): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const saltBytes = base64ToUint8Array(salt);
  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBytes.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_LENGTH
  );

  return uint8ArrayToBase64(new Uint8Array(hash));
}

// ─── Token generation ─────────────────────────────────────────────

export function generateToken(): string {
  const bytes = createBuffer(TOKEN_LENGTH);
  crypto.getRandomValues(bytes);
  return uint8ArrayToBase64url(bytes);
}

// ─── IV generation ────────────────────────────────────────────────

function generateIV(): Uint8Array<ArrayBuffer> {
  const iv = createBuffer(IV_LENGTH);
  crypto.getRandomValues(iv);
  return iv;
}

// ─── Symmetric encryption (AES-GCM) ─────────────────────────────

export async function encrypt(
  plaintext: string,
  password: string,
  salt: string
): Promise<string> {
  const encoder = new TextEncoder();
  const iv = generateIV();
  const key = await deriveAESKey(password, salt, "encrypt");

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    encoder.encode(plaintext)
  );

  const combined = createBuffer(iv.length + new Uint8Array(ciphertext).length);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return uint8ArrayToBase64(combined);
}

export async function decrypt(
  ciphertext: string,
  password: string,
  salt: string
): Promise<string> {
  const decoder = new TextDecoder();
  const combined = base64ToUint8Array(ciphertext);
  const iv = combined.slice(0, IV_LENGTH);
  const data = combined.slice(IV_LENGTH);

  const key = await deriveAESKey(password, salt, "decrypt");

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    data
  );

  return decoder.decode(plaintext);
}

// ─── Key derivation for AES ─────────────────────────────────────

async function deriveAESKey(
  password: string,
  salt: string,
  usage: "encrypt" | "decrypt"
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const saltBytes = base64ToUint8Array(salt);
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBytes.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    [usage]
  );
}

// ─── Constant-time comparison ────────────────────────────────────

export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ─── Base64 utilities ────────────────────────────────────────────

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function uint8ArrayToBase64url(bytes: Uint8Array): string {
  return uint8ArrayToBase64(bytes)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function base64ToUint8Array(base64: string): Uint8Array {
  let normalized = base64.replace(/-/g, "+").replace(/_/g, "/");
  while (normalized.length % 4 !== 0) {
    normalized += "=";
  }
  const binary = atob(normalized);
  const bytes = createBuffer(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
