import {User} from '@prisma/client';

export type LoggedInUser = Omit<User, 'password'>;

declare global {
  namespace Express {
    interface Request {
      user: LoggedInUser;
    }
  }
}
