import {NextFunction, Request, Response} from 'express';
import UserService from '../services/user';
import logger from '../utils/logger';
import {BadRequestError} from '../utils/errors';

const userService = new UserService();

const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    const user = await userService.getUser(id);

    if (!user) throw new BadRequestError(`no user found with id ${id}`);

    return res.send({user});
  } catch (error) {
    next(error);
  }
};

const getLoginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userService.getUser(req.user.id);
    return res.send(user);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    await userService.deleteUserBy(req.params.id);
  } catch (error) {
    logger.error('Error occured while deleting user', error);
  }
  return res.send({message: 'user deleted successfully'});
};

export default {
  getUser,
  getLoginUser,
  deleteUser,
};
