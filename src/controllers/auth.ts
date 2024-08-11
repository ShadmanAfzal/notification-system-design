import {Request, Response} from 'express';
import AuthService from '../services/auth';
import UserService from '../services/user';
import {createUserValidator} from '../validators/user';

const authService = new AuthService();
const userService = new UserService();

const loginUser = async (req: Request, res: Response) => {
  try {
    const {email, password} = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'email and password are required fields',
      });
    }

    const user = await userService.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `no user found with email Id ${email} and password ${password}`,
      });
    }

    const checkPassword = await authService.validatePassword(
      user.password,
      password
    );

    if (!checkPassword) {
      return res.status(404).json({
        success: false,
        message: `no user found with email Id ${email} and password ${password}`,
      });
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
    console.log('Error occured while login user', error);
    res.status(500).send({
      success: false,
      message: (error as Error)?.message ?? 'internal server errror',
    });
  }
};

const registerUser = async (req: Request, res: Response) => {
  try {
    const user = req.body;

    const validationErrors = await createUserValidator(user);

    if (validationErrors)
      return res.status(400).send({success: false, message: validationErrors});

    const exists = await userService.userAlreadyExists(
      user.email,
      user.userName
    );

    if (exists) {
      return res.status(409).send({
        success: false,
        message: 'user already exists with same email or userName',
      });
    }

    user.password = await authService.hashPassword(user.password);

    await userService.createUser(user);

    return res.send({success: true, message: 'user registered sucessfully'});
  } catch (error) {
    console.log('Error occured while registering user', error);
    res.status(500).send({
      success: false,
      message: (error as Error)?.message ?? 'internal server errror',
    });
  }
};

export default {
  loginUser,
  registerUser,
};
