import {PrismaClient} from '@prisma/client';
import {createUserSchema} from '../validators/user';
import {z} from 'zod';
import AuthService from './auth';

class UserService {
  client: PrismaClient;
  authService: AuthService;
  constructor() {
    this.client = new PrismaClient();
    this.authService = new AuthService();
  }

  async getUser(userId: string) {
    const user = await this.client.user.findFirst({
      select: {
        email: true,
        id: true,
        lastName: true,
        firstName: true,
        userName: true,
        createdAt: true,
        updatedAt: true,
      },
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
      select: {
        email: true,
        id: true,
        lastName: true,
        firstName: true,
        userName: true,
      },
    });

    return user;
  }

  async validateUser(email: string, password: string) {
    const user = await this.client.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) return null;

    const passwordVerified = await this.authService.validatePassword(
      user.password,
      password
    );

    if (!passwordVerified) return null;

    return this.authService.generateToken({
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      email: user.email,
      id: user.id,
      updatedAt: user.updatedAt,
    });
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
