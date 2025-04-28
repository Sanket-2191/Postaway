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


likeRouter.route('/post/:postId')
    .get(likesOnPost)
    .post(VerifyJWT, togglePostLike);

likeRouter.route('/comment/:commentId')
    .get(likesOnComment)
    .post(VerifyJWT, toggleCommentLike);

likeRouter.route('/liked-posts').get(VerifyJWT, getLikedPosts);
