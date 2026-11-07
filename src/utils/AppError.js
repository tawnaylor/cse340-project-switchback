// An error we throw on purpose. Its message is safe to show to the user.
export class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.isOperational = true;
  }
}
