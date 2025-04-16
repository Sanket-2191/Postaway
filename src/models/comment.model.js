import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true
        },
        postId: {
            type: mongoose.Schema.ObjectId,
            ref: "Post"
        },
        commentedBy: {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

commentSchema.plugin(mongooseAggregatePaginate)

export const CommentModel = mongoose.model('Comment', commentSchema);