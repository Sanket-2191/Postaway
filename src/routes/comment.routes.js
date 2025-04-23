import { Router } from "express";


import { VerifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { addComment, deleteComment, getPostComments, updateComment } from "../controllers/comment.controller.js";



export const commentRouter = Router();


commentRouter.route('/:postId')
    .get(getPostComments)
    .post(VerifyJWT, upload.none(), addComment);

commentRouter.route('/:commentId')
    .patch(VerifyJWT, upload.none(), updateComment)
    .delete(VerifyJWT, upload.none(), deleteComment);