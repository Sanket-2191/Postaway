import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const postSchema = new mongoose.Schema(
    {
        caption: {
            type: String,
            required: true
        },
        owner: {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        },
        post: {
            type: String,
            required: true
        },
        likes: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
)

postSchema.plugin(mongooseAggregatePaginate);


export const PostModel = mongoose.model('Post', postSchema);