import {Router} from 'express';
import controller from '../controllers/post';
import authMiddleware from '../middlewares/auth';

const postRouter = Router();

postRouter.get('/:id', authMiddleware, controller.getPosts);

postRouter.get('/', authMiddleware, controller.getPosts);

export default postRouter;
