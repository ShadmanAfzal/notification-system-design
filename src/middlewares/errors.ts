import {Request, Response, NextFunction} from 'express';
import HttpError from '../utils/errors';
import logger from '../utils/logger';

const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let message = 'Internal Server Error';
  let statusCode = 500;

  if (error instanceof HttpError) {
    message = error.message;
    statusCode = error.statusCode;
  }
  logger.error(error);
  res.status(statusCode).send({error: message});
};

export default errorHandler;
