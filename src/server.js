import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

export const app = express();

// Load environment variables
// dotenv.config(
//     {
//         path: '../env'
//     }
// )

// Middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.static('./public'));
app.use(express.urlencoded({
    extended: true,
    limit: '20kb'
}))



import { userRouter } from './routes/user.routes.js';

app.use('/api/v1/users', userRouter)