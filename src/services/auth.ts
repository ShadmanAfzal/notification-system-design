import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {z} from 'zod';
import {createUserSchema} from '../validators/user';

const JWT_SIGN_KEY = process.env.JWT_SIGN_KEY!;
const PASSWORD_SALT = 10;

class AuthService {
  generateToken(
    user: Omit<z.infer<typeof createUserSchema> & {id: string}, 'password'>
  ) {
    const token = jwt.sign(user, JWT_SIGN_KEY, {
      expiresIn: '1h',
    });
    return token;
  }

  verifyToken(token: string) {
    try {
      const decodedToken = jwt.verify(token, JWT_SIGN_KEY);
      return decodedToken;
    } catch (error) {
      return null;
    }
  }

  validatePassword(passwordHash: string, passwordToVerify: string) {
    return bcrypt.compare(passwordToVerify, passwordHash);
  }

  hashPassword(password: string) {
    return bcrypt.hash(password, PASSWORD_SALT);
  }
}

export default AuthService;
