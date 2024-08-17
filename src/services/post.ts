import {PrismaClient} from '@prisma/client';
import {createPostSchema} from '../validators/post';
import {z} from 'zod';
import {createCommentSchema} from '../validators/comment';

type GetPostsOption = {
  includeLikes?: boolean;
  includeComments?: boolean;
  includeUser?: boolean;
};

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

  async getPostById(id: string, options?: GetPostsOption) {
    return await this.client.post.findFirst({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            comments: true,
            Likes: true,
          },
        },
        Likes: options?.includeLikes ?? false,
        comments: options?.includeComments ?? false,
        user: options?.includeUser ?? false,
      },
    });
  }

  async getPosts(currentPage: number, item_per_page = 5) {
    return await this.client.$transaction([
      this.client.post.count({
        where: {
          private: false,
        },
      }),
      this.client.post.findMany({
        include: {
          _count: true,
        },
        where: {
          private: false,
        },
        skip: currentPage * item_per_page,
        take: item_per_page,
        orderBy: {
          updatedAt: 'desc',
        },
      }),
    ]);
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
    const post = await this.getPostById(postId, {includeLikes: true});

    if (!post) throw new Error('Post not found');

    const isLiked = post.Likes.some(like => like.userId === userId);

    if (isLiked) {
      await this.client.likes.deleteMany({
        where: {
          postId: postId,
          userId: userId,
        },
      });
      return false;
    }

    await this.client.likes.create({
      data: {
        postId: postId,
        userId: userId,
      },
    });
    return true;
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
