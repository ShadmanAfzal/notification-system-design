import {Request, Response} from 'express';
import AuthService from '../services/auth';
import UserService from '../services/user';
import {CreateUserType} from '../types/createUser';

const authService = new AuthService();
const userService = new UserService();

const loginUser = async (req: Request, res: Response) => {
  const {email, password} = req.body;

  if (!email || !password)
    return res.status(400).json({
      success: false,
      message: 'email and password are required fields',
    });

  const user = await userService.getUserByEmail(email);

  if (!user)
    return res.status(404).json({
      success: false,
      message: `No user found with email Id ${email} and password ${password}`,
    });

  const checkPassword = await authService.validatePassword(
    user.password,
    password
  );

  if (!checkPassword)
    return res.status(404).json({
      success: false,
      message: `No user found with email Id ${email} and password ${password}`,
    });

  const token = authService.generateToken({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    userName: user.userName,
  });

  return res.send({
    success: true,
    message: 'User logged in successfully',
    token,
  });
};

const registerUser = async (req: Request, res: Response) => {
  const user = req.body as CreateUserType;

  user.password = await authService.hashPassword(user.password);

  await userService.createUser(user);

  return res.send({success: true, message: 'User registered sucessfully'});
};

export default {
  loginUser,
  registerUser,
};
