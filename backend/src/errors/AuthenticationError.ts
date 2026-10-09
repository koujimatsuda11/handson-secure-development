export class AuthenticationError extends Error {
  constructor(message = 'Unauthenticated') {
    super(message);
    this.name = 'AuthenticationError';
  }
}
