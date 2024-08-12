import {Router} from 'express';
import controller from '../controllers/post';
import authMiddleware from '../middlewares/auth';

const postRouter = Router();

postRouter.get('/:id', authMiddleware, controller.getPostById);

postRouter.get('/', authMiddleware, controller.getPosts);

postRouter.post('/', authMiddleware, controller.createPost);

postRouter.put('/:id', authMiddleware, controller.updatePost);

postRouter.delete('/:id', authMiddleware, controller.deletePost);

postRouter.get('/:id/likes', authMiddleware, controller.getLikesByPostId);

postRouter.get('/:id/comments', authMiddleware, controller.getCommentsByPostId);

postRouter.post('/like', authMiddleware, controller.toggleLike);

postRouter.post('/comment', authMiddleware, controller.postComment);

postRouter.get('/comment/:id', authMiddleware, controller.getCommentsById);

postRouter.delete('/comment/:id', authMiddleware, controller.deleteComments);

export default postRouter;
