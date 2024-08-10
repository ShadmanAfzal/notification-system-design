import {Request, Response} from 'express';
import AuthService from '../services/auth';
import UserService from '../services/user';

const authService = new AuthService();
const userService = new UserService();

const getPosts = (req: Request, res: Response) => {
  res.send({user: req.user});
};

export default {getPosts};
