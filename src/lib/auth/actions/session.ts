"use server";

import { cookies } from "next/headers";
import { COOKIE_NAME, createSessionToken } from "@/lib/auth/jwt";

export async function createAndSetSession(
  userId: string,
  email: string,
  name: string
): Promise<void> {
  const token = await createSessionToken(userId, email, name);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
