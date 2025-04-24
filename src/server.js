import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

export const app = express();

// Load environment variables
// dotenv.config(
//     {
//         path: '../env'
//     }
// )

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(cookieParser());
app.use(express.static('./public'));
app.use(express.urlencoded({
    extended: true,
    limit: '20kb'
}))



import { userRouter } from './routes/user.routes.js';
import { postRouter } from './routes/post.routes.js';
import { friendRouter } from './routes/friends.routes.js';
import { likeRouter } from './routes/like.routes.js';
import { commentRouter } from './routes/comment.routes.js';


const PREFIX = '/api/v1/';

app.use(`${PREFIX}users`, userRouter);
app.use(`${PREFIX}posts`, postRouter);
app.use(`${PREFIX}friends`, friendRouter);
app.use(`${PREFIX}likes`, likeRouter);
app.use(`${PREFIX}comments`, commentRouter);