import {NextFunction, Request, Response} from 'express';
import AuthService from '../services/auth';
import UserService from '../services/user';
import {createUserValidator} from '../validators/user';
import {BadRequestError, ConflictError, NotFoundError} from '../utils/errors';

const authService = new AuthService();
const userService = new UserService();

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {email, password} = req.body;

    if (!email || !password) {
      throw new BadRequestError('email and password are required fields');
    }

    const user = await userService.getUserByEmail(email);

    if (!user) {
      throw new NotFoundError(
        `no user found with email Id ${email} and password ${password}`
      );
    }

    const checkPassword = await authService.validatePassword(
      user.password,
      password
    );

    if (!checkPassword) {
      throw new NotFoundError(
        `no user found with email Id ${email} and password ${password}`
      );
    }

    const token = authService.generateToken({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
    });

    return res.send({
      success: true,
      message: 'user logged in successfully',
      token,
    });
  } catch (error) {
    next(error);
  }
};

const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.body;

    const validationErrors = await createUserValidator(user);

    if (validationErrors) throw new BadRequestError(validationErrors);

    const exists = await userService.userAlreadyExists(
      user.email,
      user.userName
    );

    if (exists) {
      throw new ConflictError(
        'user already exists with same email or userName'
      );
    }

    user.password = await authService.hashPassword(user.password);

    await userService.createUser(user);

    return res.send({success: true, message: 'user registered sucessfully'});
  } catch (error) {
    next(error);
  }
};

export default {
  loginUser,
  registerUser,
};
