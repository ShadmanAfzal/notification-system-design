import {PrismaClient} from '@prisma/client';
import {createPostSchema} from '../validators/post';
import {z} from 'zod';

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

  async getPostById(id: string) {
    return await this.client.post.findFirst({
      where: {
        id,
      },
      include: {
        Likes: true,
        comments: true,
        user: true,
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

  async toggleLike(postId: string, userId: string) {
    const post = await this.getPostById(postId);

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

  async getLikesByPost(postId: string) {
    return this.client.likes.count({
      where: {
        postId: postId,
      },
    });
  }
}

export default PostService;
