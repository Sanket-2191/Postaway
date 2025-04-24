import { Router } from "express";

import { VerifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import {
    createPost,
    getAllPosts,
    getPostById,
    getPostsByUser,
    updatePost,
    deletePost
} from "../controllers/post.controller.js";

export const postRouter = Router();

// Fetch all posts for news feed with pagination and search
postRouter.route('/all')
    .get(getAllPosts);

// Create new post or get posts for a specific user (based on userId query param)
postRouter.route('/')
    .get(getPostsByUser)
    .post(VerifyJWT, upload.single('post'), createPost);

// Retrieve, update or delete a specific post by ID
postRouter.route('/:postId')
    .get(getPostById)
    .patch(VerifyJWT, upload.none(), updatePost)
    .delete(VerifyJWT, deletePost);

