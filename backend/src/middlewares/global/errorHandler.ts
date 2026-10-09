import { Request, Response, NextFunction } from 'express';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { AuthenticationError } from '../../errors/AuthenticationError';
import { AuthorizationError } from '../../errors/AuthorizationError';
import { ValidationError } from '../../errors/ValidationError';
import { logNotFoundResource, logAuthorizationFail, logSysCrash, logValidationFail, logAuthFail } from '../../helpers/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next:NextFunction):void => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode: number;
  let message: string;

  if (err instanceof EntityNotFoundError) {
    statusCode = 404;
    message = 'Not Found';
    logNotFoundResource(req, err.message);
  } else if (err instanceof AuthorizationError) {
    statusCode = 403;
    message = 'Forbidden';
    logAuthorizationFail(req, err.message, err);
  } else if (err instanceof ValidationError) {
    statusCode = 422;
    message = 'Unprocessable Entity';
    logValidationFail(req, err.message, err);
  } else if (err instanceof AuthenticationError) {
    statusCode = 401;
    message = 'Unauthorized';
    logAuthFail(req, err.message, err);
  } else {
    statusCode = 500;
    message = 'Internal Server Error';
    logSysCrash(req, err.message, err);
  }

  res.status(statusCode).json({ message });
};
