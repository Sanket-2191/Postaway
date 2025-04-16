import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from 'dotenv';

export const app = express();

// Load environment variables
config({ path: './.env' });

// Middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.static());
app.use(express.urlencoded({
    extended: true,
    limit: '20kb'
}))

