import {PrismaClient} from '@prisma/client';
import {createPostSchema} from '../validators/post';
import {z} from 'zod';
import {createCommentSchema} from '../validators/comment';

class PostService {
  client: PrismaClient;
  constructor() {
    this.client = new PrismaClient();
  }

  async createPost(post: z.infer<typeof createPostSchema>, userId: string) {
    const result = await this.client.post.create({
      data: {
        description: post.description,
        title: post.title,
        image: post.image,
        private: post.private,
        userId: userId,
      },
    });

    return result;
  }

  async getPostById(
    id: string,
    includeLikes = false,
    includeComments = false,
    includeUser = false
  ) {
    return await this.client.post.findFirst({
      where: {
        id,
      },
      include: {
        Likes: includeLikes,
        comments: includeComments,
        user: includeUser,
      },
    });
  }

  async getPosts() {
    return await this.client.post.findMany({
      where: {
        private: false,
      },
    });
  }

  async getPostsByUser(userId: string) {
    return await this.client.post.findMany({
      where: {
        userId,
      },
    });
  }

  async getPrivatePostsByUser(userId: string) {
    return await this.client.post.findMany({
      where: {
        userId,
        private: true,
      },
    });
  }

  async updatePost(post: z.infer<typeof createPostSchema>, postId: string) {
    const result = await this.client.post.update({
      where: {
        id: postId,
      },
      data: {
        image: post.image,
        description: post.description,
        title: post.title,
        private: post.private,
      },
    });

    return result;
  }

  async deletePost(postId: string) {
    await this.client.post.delete({
      where: {
        id: postId,
      },
    });
  }

  async isPostPrivate(postId: string) {
    const count = await this.client.post.count({
      where: {
        id: postId,
        private: true,
      },
    });

    return count === 1;
  }

  async toggleLike(postId: string, userId: string) {
    const post = await this.getPostById(postId, true);

    if (!post) throw new Error('Post not found');

    const isLiked = post.Likes.some(like => like.userId === userId);

    if (isLiked) {
      return await this.client.likes.deleteMany({
        where: {
          postId: postId,
          userId: userId,
        },
      });
    }

    return await this.client.likes.create({
      data: {
        postId: postId,
        userId: userId,
      },
    });
  }

  async getLikesCount(postId: string) {
    return this.client.likes.count({
      where: {
        postId: postId,
      },
    });
  }

  async postComment(
    commentBody: z.infer<typeof createCommentSchema>,
    userId: string
  ) {
    return this.client.comments.create({
      data: {
        ...commentBody,
        userId,
      },
    });
  }

  async getCommentsCount(postId: string) {
    return this.client.comments.count({
      where: {
        postId: postId,
      },
    });
  }

  async getComments(postId: string) {
    return this.client.comments.findMany({
      where: {
        postId,
        post: {
          private: false,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getLikes(postId: string) {
    return this.client.likes.findMany({
      where: {
        postId,
        post: {
          private: false,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getCommentById(commentId: number) {
    return this.client.comments.findFirst({
      where: {
        id: commentId,
        post: {
          private: false,
        },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async deleteCommentById(commentId: number) {
    return this.client.comments.delete({
      where: {
        id: commentId,
      },
    });
  }
}

export default PostService;
