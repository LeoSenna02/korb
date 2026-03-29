/**
 * Auth JWT Module — Jose-based JWT for httpOnly cookie sessions
 * Works in edge runtime (Next.js middleware)
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const ALGORITHM = "HS256";
const COOKIE_NAME = "korb_session";
const SESSION_DURATION_SECONDS = 30 * 24 * 60 * 60; // 30 days

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

export interface SessionPayload extends JWTPayload {
  sub: string;      // userId
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

/**
 * Create a signed JWT for the given user.
 * Returns the signed token string.
 */
export async function createSessionToken(
  userId: string,
  email: string,
  name: string
): Promise<string> {
  const secret = getSecret();
  const token = await new SignJWT({ email, name })
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secret);

  return token;
}

/**
 * Verify and decode a JWT token.
 * Returns the payload if valid, or null if invalid/expired.
 */
export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: [ALGORITHM],
    });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
