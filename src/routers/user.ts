import {Router} from 'express';
import controller from '../controllers/user';
import authMiddleware from '../middlewares/auth';

const userRouter = Router();

userRouter.get('/me', authMiddleware, controller.getLoginUser);

userRouter.get('/:id', authMiddleware, controller.getUser);

userRouter.delete('/:id', authMiddleware, controller.deleteUser);

export default userRouter;
