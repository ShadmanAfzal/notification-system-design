import {Router} from 'express';
import controller from '../controllers/user';

const userRouter = Router();

userRouter.get('/:id', controller.getUser);

userRouter.put('/', controller.updateUser);

userRouter.delete('/:id', controller.deleteUser);

export default userRouter;
