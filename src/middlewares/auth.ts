import {Request, Response, NextFunction} from 'express';
import AuthService from '../services/auth';
import {User} from '@prisma/client';
import UserService from '../services/user';

const authService = new AuthService();
const userService = new UserService();

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res
        .status(401)
        .send({success: false, message: 'auth token is required'});
    }

    const token = authHeader.split('Bearer ').at(1);

    if (!token) {
      return res.status(401).send({success: false, message: 'invalid token'});
    }

    const decodedToken = authService.verifyToken(token);

    if (!decodedToken) {
      return res.status(401).send({success: false, message: 'invalid token'});
    }

    const userId = (decodedToken as User).id;

    if (!userId) {
      return res.status(401).send({success: false, message: 'invalid token'});
    }

    const user = await userService.getUser(userId);

    req.user = user!;

    next();
  } catch (error) {
    console.log('Error occured while authenticating user', error);
    res.status(500).send({
      success: false,
      message: (error as Error)?.message ?? 'internal server errror',
    });
  }
};

export default authMiddleware;
