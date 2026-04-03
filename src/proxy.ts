import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth/jwt";

const PROTECTED_PREFIXES = ["/dashboard", "/baby", "/milestones", "/sleep"];
const AUTH_PATHS = ["/login", "/registro", "/"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ——— 1. Collect session tokens —————————————————————
  // New JWT cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // Legacy cookie cleanup (can be removed after migration)
  const hasLegacyCookie = request.cookies.has("korb_auth");

  // ——— 2. Auth page logic —————————————————————————————
  const isAuthPage = AUTH_PATHS.some((path) => pathname === path);
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // ——— 3. Authenticated → redirect away from auth pages ———
  if (token && isAuthPage) {
    // Verify the token is actually valid (not just present)
    const payload = await verifySessionToken(token);
    if (payload) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // Invalid/expired token — clear it and let them log in
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  // ——— 4. Not authenticated → redirect to login —————————
  if (!token && isProtected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ——— 5. Token present but potentially invalid ———————————
  if (token && isProtected) {
    const payload = await verifySessionToken(token);
    if (!payload) {
      // Token invalid/expired
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
    // Valid token — inject user info in headers for server components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.sub);
    requestHeaders.set("x-user-email", payload.email as string);
    requestHeaders.set("x-user-name", payload.name as string);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // ——— 6. Clean legacy cookies if present ————————————————
  if (hasLegacyCookie) {
    const response = NextResponse.next();
    response.cookies.delete("korb_auth");
    response.cookies.delete("korb_session");
    response.cookies.delete("korb_session_token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)).*)",
  ],
};
