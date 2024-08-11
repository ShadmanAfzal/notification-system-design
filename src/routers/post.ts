import {Router} from 'express';
import controller from '../controllers/post';
import authMiddleware from '../middlewares/auth';

const postRouter = Router();

postRouter.get('/:id', authMiddleware, controller.getPostById);

postRouter.get('/', authMiddleware, controller.getPosts);

postRouter.post('/', authMiddleware, controller.createPost);

postRouter.put('/:id', authMiddleware, controller.updatePost);

export default postRouter;
