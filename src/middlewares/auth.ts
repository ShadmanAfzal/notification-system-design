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
  const authHeader = req.headers['authorization'];

  if (!authHeader)
    return res
      .status(401)
      .send({success: false, message: 'auth token is missing'});

  const token = authHeader.split('Bearer ').at(1);

  if (!token)
    return res.status(401).send({success: false, message: 'invalid token'});

  const decodedToken = authService.verifyToken(token);

  if (!decodedToken)
    return res.status(401).send({success: false, message: 'invalid token'});

  const email = (decodedToken as User).email;

  const user = await userService.getUserByEmail(email);

  req.user = user!;

  next();
};

export default authMiddleware;
