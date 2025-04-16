import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
    {
        postId: {
            type: mongoose.Schema.ObjectId,
            ref: "Post"
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