import {Request, Response, NextFunction} from 'express';
import AuthService from '../services/auth';
import {User} from '@prisma/client';
import UserService from '../services/user';
import {BadRequestError, UnAuthorizedError} from '../utils/errors';

const authService = new AuthService();
const userService = new UserService();

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) throw new UnAuthorizedError('auth token is required');

    const token = authHeader.split('Bearer ').at(1);

    if (!token) throw new BadRequestError('invalid token');

    const decodedToken = authService.verifyToken(token);

    if (!decodedToken) throw new BadRequestError('invalid token');

    const userId = (decodedToken as User).id;

    if (!userId) throw new BadRequestError('invalid token');

    const user = await userService.getUser(userId);

    req.user = user!;

    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
