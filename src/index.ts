import express from 'express';
import userRouter from './routers/user';
import authRouter from './routers/auth';
import postRouter from './routers/post';

const PORT = process.env.PORT ?? 5000;

const app = express();

app.use(express.json());

app.get('/health', (req, res) => res.status(200).send());

app.use('/api/user', userRouter);

app.use('/api/auth', authRouter);

app.use('/api/post', postRouter);

app.get('*', (req, res) =>
  res.status(404).send({success: true, message: 'resource not found'})
);

app.listen(PORT, () => console.log('Server started at PORT %s', PORT));
