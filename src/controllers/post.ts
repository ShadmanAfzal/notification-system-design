import {Request, Response} from 'express';
import PostService from '../services/post';
import {createPostValidator} from '../validators/post';

const postService = new PostService();

const createPost = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    const validationErrors = await createPostValidator(req.body);

    if (validationErrors)
      return res.status(400).send({success: false, message: validationErrors});

    const createdPost = await postService.createPost(req.body, user.id);

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
  return res.send(posts);
};

const getPostById = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const postId = req.params.id;
    const post = await postService.getPostById(postId);

    if (!post)
      return res
        .status(404)
        .send({success: false, message: `post not found with id ${postId}`});

    if (post.private && post.user.id !== user.id)
      return res
        .status(404)
        .send({success: false, message: `post not found with id ${postId}`});

    return res.send(post);
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

    const user = req.user;

    const validationErrors = await createPostValidator(req.body);

    if (validationErrors)
      return res.status(400).send({success: false, message: validationErrors});

    const post = await postService.getPostById(postId);

    if (post?.userId !== user.id) {
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

export default {getPosts, getPostById, createPost, updatePost};
