import status_code from 'http-status-codes';

class HttpError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = 500;
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = status_code.NOT_FOUND;
  }
}

export class UnAuthorizedError extends HttpError {
  constructor(message: string) {
    super(message);
    this.name = 'UnAuthorizedError';
    this.statusCode = status_code.UNAUTHORIZED;
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = status_code.BAD_REQUEST;
  }
}

export class InternalServerError extends HttpError {
  constructor(message: string) {
    super(message);
    this.name = 'InternalServerError';
    this.statusCode = status_code.INTERNAL_SERVER_ERROR;
  }
}

export class ConflictError extends HttpError {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = status_code.CONFLICT;
  }
}

export default HttpError;
