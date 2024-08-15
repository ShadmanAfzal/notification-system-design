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

const postService = new PostService();

const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationErrors = await createPostValidator(req.body);

    if (validationErrors) throw new BadRequestError(validationErrors);

    const createdPost = await postService.createPost(req.body, req.user.id);

    return res.send({
      success: true,
      message: 'post created successfully',
      post: createdPost,
    });
  } catch (error) {
    next(error);
  }
};

const getPosts = async (req: Request, res: Response) => {
  const posts = await postService.getPosts();
  return res.send({success: true, count: posts.length, posts});
};

const getPostById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = req.params.id;

    const post = await postService.getPostById(postId);

    if (!post) throw new NotFoundError(`post not found with id ${postId}`);

    if (post.private && post.user.id !== req.user.id) {
      throw new UnAuthorizedError('unauthorized');
    }

    const commentsCount = await postService.getCommentsCount(postId);
    const likesCount = await postService.getLikesCount(postId);

    return res.send({
      success: true,
      post,
      likes: likesCount,
      comments: commentsCount,
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
      success: true,
      message: 'post created successfully',
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

    return res.send({success: true});
  } catch (error) {
    next(error);
  }
};

const toggleLike = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = req.body.postId;

    if (!postId) {
      return res
        .status(404)
        .send({success: false, message: 'postId is required'});
    }

    const post = await postService.getPostById(postId);

    if (post?.userId !== req.user.id) {
      throw new UnAuthorizedError('unauthorized');
    }

    await postService.toggleLike(postId, req.user.id);

    return res.send({success: true});
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

    const comments = await postService.getCommentById(+commentId);

    return res.send({success: true, comments});
  } catch (error) {
    next(error);
  }
};

const postComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationErrors = await createCommentValidator(req.body);

    if (validationErrors) throw new BadRequestError(validationErrors);

    const comment = await postService.postComment(req.body, req.user.id);

    return res.send({success: true, comment});
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
    return res.send({success: true});
  } catch (error) {
    logger.error(error);
    return res.send({success: true});
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
    return res.send({success: true, count: comments.length, comments});
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
    return res.send({success: true, count: likes.length, comments: likes});
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
