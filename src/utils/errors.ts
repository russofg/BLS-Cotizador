/**
 * Shared error types for service layer
 */

export class InvalidCursorError extends Error {
  readonly name = 'InvalidCursorError' as const;
  constructor(message = 'Invalid or expired cursor') {
    super(message);
  }
}
