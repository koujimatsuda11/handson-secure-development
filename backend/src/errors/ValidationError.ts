export class ValidationError extends Error {
  constructor(message = 'Invalid input format.') {
    super(message);
    this.name = 'ValidationError';
  }
}
