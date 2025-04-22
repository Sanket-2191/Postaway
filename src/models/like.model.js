import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
    {
        post: {
            type: mongoose.Schema.ObjectId,
            ref: "Post"
        },
        comment: {
            type: mongoose.Schema.ObjectId,
            ref: "Comment"
        },
        likedBy: {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);


export const LikeModel = mongoose.model('Like', likeSchema);