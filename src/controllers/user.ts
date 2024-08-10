import {Request, Response} from 'express';
import UserService from '../services/user';

const userService = new UserService();

const getUser = async (req: Request, res: Response) => {
  const id = req.params.id;

  const user = await userService.getUser(id);

  if (!user) {
    return res
      .status(404)
      .send({success: false, message: `No user found with id ${id}`});
  }

  return res.send(user);
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    await userService.deleteUserBy(req.params.id);
  } catch (error) {
    console.log(
      'Error occured while deleting user with id %s',
      req.params.id,
      error
    );
  }
  return res.send({success: true, message: 'User deleted successfully'});
};

const updateUser = (req: Request, res: Response) => {};

export default {
  getUser,
  updateUser,
  deleteUser,
};
