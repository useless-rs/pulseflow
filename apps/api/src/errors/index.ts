export class AppError extends Error {
  statusCode: number;
  code: string;
  constructor(code: string, message: string, statusCode = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}
export class BadRequestError extends AppError {
  constructor(msg = 'Bad request') { super('BAD_REQUEST', msg, 400); }
}
export class UnauthorizedError extends AppError {
  constructor(msg = 'Unauthorized') { super('UNAUTHORIZED', msg, 401); }
}
export class ForbiddenError extends AppError {
  constructor(msg = 'Forbidden') { super('FORBIDDEN', msg, 403); }
}
export class NotFoundError extends AppError {
  constructor(msg = 'Not found') { super('NOT_FOUND', msg, 404); }
}
