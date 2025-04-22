import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const friendSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true
        },
        friend: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }

)


friendSchema.plugin(mongooseAggregatePaginate);
export const FriendModel = mongoose.model('Friend', friendSchema);