import express from 'express';
import userRouter from './routers/user';
import authRouter from './routers/auth';
import postRouter from './routers/post';
import morgan from 'morgan';
import env from './utils/env';
import logger from './utils/logger';
import errorHandler from './middlewares/errors';

const PORT = env.PORT;

const app = express();

app.use(express.json());

app.use(morgan('common'));

app.get('/health', (req, res) => res.status(200).send());

app.use('/api/user', userRouter);

app.use('/api/auth', authRouter);

app.use('/api/post', postRouter);

app.use(errorHandler);

app.use((req, res) =>
  res.status(404).send({success: false, message: 'resource not found'})
);

app.listen(PORT, () => logger.info(`Server started at PORT ${PORT}`));
