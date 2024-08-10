import {Router} from 'express';
import controller from '../controllers/auth';

const authRouter = Router();

authRouter.post('/login', controller.loginUser);

authRouter.post('/register', controller.registerUser);

export default authRouter;
