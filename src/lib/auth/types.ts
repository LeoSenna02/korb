export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string; // ISO date string
}

export interface StoredUser extends User {
  passwordHash: string;
  salt: string;
}

export interface Session {
  userId: string;
  token: string;
  createdAt: string; // ISO date string
  expiresAt: string; // ISO date string
  refreshToken: string;
}

export interface AuthResult {
  success: true;
  user: Omit<StoredUser, "passwordHash" | "salt">;
  session: Session;
}

export interface AuthError {
  code:
    | "USER_NOT_FOUND"
    | "INVALID_PASSWORD"
    | "EMAIL_ALREADY_EXISTS"
    | "WEAK_PASSWORD"
    | "INVALID_EMAIL"
    | "SESSION_EXPIRED"
    | "SESSION_NOT_FOUND"
    | "INVALID_TOKEN"
    | "NETWORK_ERROR"
    | "UNKNOWN_ERROR";
  message: string;
}

export type AuthOutcome = AuthResult | AuthError;

export interface AuthState {
  user: Omit<StoredUser, "passwordHash" | "salt"> | null;
  session: Session | null;
  isLoading: boolean;
  isHydrated: boolean;
}
