import {Request, Response} from 'express';
import UserService from '../services/user';

const userService = new UserService();

const getUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const user = await userService.getUser(id);

    if (!user) {
      return res
        .status(404)
        .send({success: false, message: `no user found with id ${id}`});
    }

    return res.send({success: true, message: user});
  } catch (error) {
    console.log('Error occured while getting user details', error);
    res.status(500).send({
      success: false,
      message: (error as Error)?.message ?? 'internal server errror',
    });
  }
};

const getLoginUser = async (req: Request, res: Response) => {
  try {
    const id = req.user.id;

    const user = await userService.getUser(id);

    return res.send({success: true, message: user});
  } catch (error) {
    console.log('Error occured while getting user details', error);
    res.status(500).send({
      success: false,
      message: (error as Error)?.message ?? 'internal server errror',
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    await userService.deleteUserBy(req.params.id);
  } catch (error) {
    console.log('Error occured while deleting user', error);
  }
  return res.send({success: true, message: 'user deleted successfully'});
};

const updateUser = (req: Request, res: Response) => {};

export default {
  getUser,
  getLoginUser,
  updateUser,
  deleteUser,
};
