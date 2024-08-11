import {PrismaClient} from '@prisma/client';
import {createUserSchema} from '../validators/user';
import {z} from 'zod';

class UserService {
  client: PrismaClient;
  constructor() {
    this.client = new PrismaClient();
  }

  async getUser(userId: string) {
    const user = await this.client.user.findFirst({
      where: {
        id: userId,
      },
    });
    return user;
  }

  async createUser(user: z.infer<typeof createUserSchema>) {
    const result = await this.client.user.create({
      data: user,
    });

    return result;
  }

  async deleteUserBy(userId: string) {
    await this.client.user.delete({
      where: {
        id: userId,
      },
    });
  }

  async getUserByEmail(emailId: string) {
    const user = await this.client.user.findFirst({
      where: {
        email: emailId,
      },
    });

    return user;
  }

  async userAlreadyExists(email: string, userName: string) {
    const count = await this.client.user.count({
      where: {
        OR: [
          {
            email,
          },
          {
            userName,
          },
        ],
      },
    });
    return count > 0;
  }
}

export default UserService;
