export interface User {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  preferred_username?: string;
}

export interface AuthTokens {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}