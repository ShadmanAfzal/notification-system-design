import {NextFunction, Request, Response} from 'express';
import PostService from '../services/post';
import {createPostValidator} from '../validators/post';
import {createCommentValidator} from '../validators/comment';
import logger from '../utils/logger';
import {
  BadRequestError,
  NotFoundError,
  UnAuthorizedError,
} from '../utils/errors';
import env from '../utils/env';
import NotificationService from '../services/notification';

const postService = new PostService();
const notificationService = new NotificationService();

const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationErrors = await createPostValidator(req.body);

    if (validationErrors) throw new BadRequestError(validationErrors);

    const createdPost = await postService.createPost(req.body, req.user.id);

    return res.send({
      message: 'post created successfully',
      post: createdPost,
    });
  } catch (error) {
    next(error);
  }
};

const getPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item_per_page = Number(env.POST_ITEM_PER_PAGE);

    const currentPage = Number(req.query['page'] ?? 1);

    if (Number.isNaN(currentPage))
      throw new BadRequestError('page query parameter is invalid');

    if (currentPage < 1)
      throw new BadRequestError('page query parameter is invalid');

    const [totalPosts, posts] = await postService.getPosts(
      currentPage - 1,
      item_per_page
    );

    return res.send({
      totalPage: Math.ceil(totalPosts / item_per_page),
      currentPage,
      count: posts.length,
      posts: posts.map(post => {
        return {
          id: post.id,
          title: post.title,
          description: post.description,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          image: post.image,
          userId: post.userId,
          stats: {
            likes: post._count.Likes,
            comments: post._count.comments,
          },
        };
      }),
    });
  } catch (error) {
    next(error);
  }
};

const getPostById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = req.params.id;

    const post = await postService.getPostById(postId);

    if (!post) throw new NotFoundError(`post not found with id ${postId}`);

    if (post.private && post.user.id !== req.user.id) {
      throw new UnAuthorizedError('unauthorized');
    }

    return res.send({
      id: post.id,
      title: post.title,
      description: post.description,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      image: post.image,
      userId: post.userId,
      private: post.private,
      stats: {
        likes: post._count.Likes,
        comments: post._count.comments,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = req.params.id;

    const validationErrors = await createPostValidator(req.body);

    if (validationErrors) throw new BadRequestError(validationErrors);

    const post = await postService.getPostById(postId);

    if (post?.userId !== req.user.id) {
      throw new UnAuthorizedError('unauthorized');
    }

    const updatedPost = await postService.updatePost(req.body, postId);

    return res.send({
      message: 'post updated successfully',
      post: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = req.params.id;

    const post = await postService.getPostById(postId);

    if (post?.userId !== req.user.id) {
      throw new UnAuthorizedError('unauthorized');
    }

    await postService.deletePost(postId);

    return res.send({message: 'post deleted successfully'});
  } catch (error) {
    next(error);
  }
};

const toggleLike = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = req.body.postId;

    if (!postId) throw new BadRequestError('postId is required');

    const post = await postService.getPostById(postId);

    if (!post) throw new NotFoundError('post does not exist');

    if (post?.private && post?.userId !== req.user.id) {
      throw new UnAuthorizedError('unauthorized');
    }

    const isLiked = await postService.toggleLike(postId, req.user.id);

    notificationService.sendNotification({
      senderId: req.user.id,
      receiverId: post.userId,
      type: isLiked ? 'LIKE' : 'UNLIKE',
    });

    return res.send({isLiked});
  } catch (error) {
    next(error);
  }
};

const getCommentsById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const commentId = req.params.id;

    const comment = await postService.getCommentById(+commentId);

    return res.send(comment);
  } catch (error) {
    next(error);
  }
};

const postComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationErrors = await createCommentValidator(req.body);

    if (validationErrors) throw new BadRequestError(validationErrors);

    const post = await postService.getPostById(req.body.postId);

    if (!post) throw new NotFoundError('post does not exist');

    const comment = await postService.postComment(req.body, req.user.id);

    notificationService.sendNotification({
      senderId: req.user.id,
      receiverId: post?.userId,
      type: 'COMMENT',
    });

    return res.send({message: 'comment posted successfully', comment});
  } catch (error) {
    next(error);
  }
};

const deleteComments = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.id;

    const comment = await postService.getCommentById(+commentId);

    if (comment?.userId !== req.user.id) {
      throw new UnAuthorizedError('unauthorized');
    }

    await postService.deleteCommentById(+commentId);
    return res.send({message: 'comment deleted successfully'});
  } catch (error) {
    logger.error(error);
    return res.send({message: 'comment deleted successfully'});
  }
};

const getCommentsByPostId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const postId = req.params.id;
    const comments = await postService.getComments(postId);
    return res.send({count: comments.length, comments});
  } catch (error) {
    next(error);
  }
};

const getLikesByPostId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const postId = req.params.id;
    const likes = await postService.getLikes(postId);
    return res.send({count: likes.length, likes});
  } catch (error) {
    next(error);
  }
};

export default {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  getCommentsById,
  postComment,
  deleteComments,
  getCommentsByPostId,
  getLikesByPostId,
};
