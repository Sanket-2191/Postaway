import { Router } from "express";


import {
    getLikedPosts,
    likesOnComment,
    likesOnPost,
    toggleCommentLike,
    togglePostLike,
} from "../controllers/like.controller.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";


export const likeRouter = Router();


likeRouter.route('/post/:postId').post(VerifyJWT, togglePostLike);

likeRouter.route('/comment/:commentId').post(VerifyJWT, toggleCommentLike);

likeRouter.route('/liked-posts').get(VerifyJWT, getLikedPosts);

likeRouter.route('/:postId').get(likesOnPost);

likeRouter.route('/:commentId').get(likesOnComment)