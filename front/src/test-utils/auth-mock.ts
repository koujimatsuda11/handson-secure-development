import type { AuthTokens, User } from "../types/user";

export const createTestUser = (overrides: Partial<User> = {}): User => ({
  sub: "test-user-sub-123",
  email: "testuser@example.com",
  preferred_username: "testuser",
  ...overrides,
});

export const createTestTokens = (
  overrides: Partial<AuthTokens> = {},
): AuthTokens => ({
  access_token: "test-access-token",
  id_token: "test-id-token",
  refresh_token: "test-refresh-token",
  token_type: "Bearer",
  expires_in: 3600,
  ...overrides,
});

export const createMockAuthReturn = (overrides = {}) => ({
  user: null,
  tokens: null,
  isLoading: false,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  handleAuthCallback: async () => {},
  getAuthHeaders: () => ({}),
  refresh: async () => {},
  ...overrides,
});
