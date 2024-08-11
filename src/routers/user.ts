import {Router} from 'express';
import controller from '../controllers/user';
import authMiddleware from '../middlewares/auth';

const userRouter = Router();

userRouter.get('/me', authMiddleware, controller.getLoginUser);

userRouter.get('/:id', controller.getUser);

userRouter.put('/', controller.updateUser);

userRouter.delete('/:id', controller.deleteUser);

export default userRouter;
