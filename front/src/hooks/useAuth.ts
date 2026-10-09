export const useAuth = () => ({
  user: null,
  tokens: null,
  isLoading: false,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  handleAuthCallback: async () => {},
  getAuthHeaders: () => ({}),
  refresh: async () => {},
});
