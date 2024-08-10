import {PrismaClient} from '@prisma/client';
import {CreateUserType} from '../types/createUser';

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

  async createUser(user: CreateUserType) {
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
}

export default UserService;
