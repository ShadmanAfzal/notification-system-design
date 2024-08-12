import {Request, Response} from 'express';
import PostService from '../services/post';
import {createPostValidator} from '../validators/post';
import {createCommentValidator} from '../validators/comment';

const postService = new PostService();

const createPost = async (req: Request, res: Response) => {
  try {
    const validationErrors = await createPostValidator(req.body);

    if (validationErrors)
      return res.status(400).send({success: false, message: validationErrors});

    const createdPost = await postService.createPost(req.body, req.user.id);

    return res.send({
      success: true,
      message: 'post created successfully',
      post: createdPost,
    });
  } catch (error) {
    console.log('Error occured while creating a new post', error);
    res.status(500).send({
      success: false,
      message: (error as Error)?.message ?? 'internal server errror',
    });
  }
};

const getPosts = async (req: Request, res: Response) => {
  const posts = await postService.getPosts();
  return res.send({success: true, count: posts.length, posts});
};

const getPostById = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;

    const post = await postService.getPostById(postId);

    if (!post) {
      return res
        .status(404)
        .send({success: false, message: `post not found with id ${postId}`});
    }

    if (post.private && post.user.id !== req.user.id) {
      return res.status(404).send({success: false, message: 'unauthorized'});
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
    console.log('Error occured while fetching post details', error);
    return res.status(500).send({
      success: false,
      message: (error as Error)?.message ?? 'interval server error',
    });
  }
};

const updatePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;

    const validationErrors = await createPostValidator(req.body);

    if (validationErrors)
      return res.status(400).send({success: false, message: validationErrors});

    const post = await postService.getPostById(postId);

    if (post?.userId !== req.user.id) {
      return res.status(401).send({success: false, message: 'unauthorized'});
    }

    const updatedPost = await postService.updatePost(req.body, postId);

    return res.send({
      success: true,
      message: 'post created successfully',
      post: updatedPost,
    });
  } catch (error) {
    console.log('Error occured while creating a new post', error);
    res.status(500).send({
      success: false,
      message: (error as Error)?.message ?? 'internal server errror',
    });
  }
};

const deletePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;

    const post = await postService.getPostById(postId);

    if (post?.userId !== req.user.id) {
      return res.status(401).send({success: false, message: 'unauthorized'});
    }

    await postService.deletePost(postId);

    return res.send({success: true});
  } catch (error) {
    console.log('Error occured while deleting a new post', error);
    res.status(500).send({
      success: false,
      message: (error as Error)?.message ?? 'internal server errror',
    });
  }
};

const toggleLike = async (req: Request, res: Response) => {
  try {
    const postId = req.body.postId;

    if (!postId) {
      return res
        .status(404)
        .send({success: false, message: 'postId is required'});
    }

    const post = await postService.getPostById(postId);

    if (post?.userId !== req.user.id) {
      return res.status(401).send({success: false, message: 'unauthorized'});
    }

    await postService.toggleLike(postId, req.user.id);

    return res.send({success: true});
  } catch (error) {
    console.log('Error occured while liking a new post', error);
    res.status(500).send({
      success: false,
      message: (error as Error)?.message ?? 'internal server errror',
    });
  }
};

const getCommentsById = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.id;

    const comments = await postService.getCommentById(+commentId);

    return res.send({success: true, comments});
  } catch (error) {
    console.log('Error occured while fetching comment', error);
    res.status(500).send({
      success: false,
      message: (error as Error)?.message ?? 'internal server errror',
    });
  }
};

const postComment = async (req: Request, res: Response) => {
  try {
    const validationErrors = await createCommentValidator(req.body);

    if (validationErrors) {
      return res.status(404).send({success: false, error: validationErrors});
    }

    const comment = await postService.postComment(req.body, req.user.id);

    return res.send({success: true, comment});
  } catch (error) {
    console.log('Error occured while add comment on the post', error);
    res.status(500).send({
      success: false,
      message: (error as Error)?.message ?? 'internal server errror',
    });
  }
};

const deleteComments = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.id;

    const comment = await postService.getCommentById(+commentId);

    if (comment?.userId !== req.user.id) {
      return res.status(401).send({success: false, message: 'unauthorized'});
    }

    await postService.deleteCommentById(+commentId);
  } catch (error) {
    console.log('Error occured while deleting comment %s', error);
  }
  return res.send({success: true});
};

const getCommentsByPostId = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const comments = await postService.getComments(postId);
    return res.send({success: true, count: comments.length, comments});
  } catch (error) {
    console.log('Error occured while deleting comment %s', error);
    res.status(500).send({
      success: false,
      message: (error as Error)?.message ?? 'internal server errror',
    });
  }
};

const getLikesByPostId = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const likes = await postService.getLikes(postId);
    return res.send({success: true, count: likes.length, comments: likes});
  } catch (error) {
    console.log('Error occured while deleting comment %s', error);
    res.status(500).send({
      success: false,
      message: (error as Error)?.message ?? 'internal server errror',
    });
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
