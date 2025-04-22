import { isValidObjectId } from "mongoose"


import { sendError } from "../utils/sendErrorResp.js"
import { sendAPIResp } from "../utils/sendApiResp.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { LikeModel } from "../models/like.model.js"
import { CommentModel } from "../models/comment.model.js"
import { PostModel } from "../models/post.model.js"

const toggleLike = async (res, {
    modelKey,
    parentModel,
    parentId,
    userId,
}) => {
    const query = { [modelKey]: parentId, likedBy: userId };
    const existing = await LikeModel.findOne(query);

    if (existing) {
        await existing.deleteOne();
        if (parentModel)
            await parentModel.findByIdAndUpdate(parentId, {
                $inc: { likes: -1 },
            });
        return { status: "unliked", data: existing };
    }

    const created = await LikeModel.create({ [modelKey]: parentId, likedBy: userId });
    if (!created) return sendError(res, 500, `Unable to save the like for ${modelKey}.`);

    if (parentModel)
        await parentModel.findByIdAndUpdate(parentId, {
            $inc: { likes: 1 },
        });

    return { status: "liked", data: created };
};

export const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!isValidObjectId(commentId)) return sendError(res, 400, "Invalid commentId received.");

    const result = await toggleLike(res, {
        modelKey: "comment",
        parentModel: CommentModel,
        parentId: commentId,
        userId: req.user._id,
    });

    return sendAPIResp(
        res,
        result.status === "liked" ? 201 : 200,
        result.status === "liked" ? "Comment liked✅✅" : "Unliked the comment !!",
        result.data,
    );
},
    { statusCode: 500, message: "Something went wrong while liking/unliking the Comment." });

export const togglePostLike = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    if (!isValidObjectId(postId)) return sendError(res, 400, "Invalid postId received.");

    const result = await toggleLike(res, {
        modelKey: "post",
        parentModel: PostModel,
        parentId: postId,
        userId: req.user._id,
    });

    return sendAPIResp(
        res,
        result.status === "liked" ? 201 : 200,
        result.status === "liked" ? "Tweet liked✅✅" : "Unliked the tweet !!",
        result.data
    );
},
    { statusCode: 500, message: "Something went wrong while liking/unliking the Tweet." });

export const getLikedPosts = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const likedPosts = await LikeModel.aggregate([
        {
            $match: {
                likedBy: userId,
                post: { $exists: true },
            },
        },
        {
            $lookup: {
                from: "posts",
                localField: "post",
                foreignField: "_id",
                as: "postDetails",
                pipeline: [
                    { $match: { isPublished: true } },
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails",
                        },
                    },
                    {
                        $addFields: {
                            ownerDetails: { $arrayElemAt: ["$ownerDetails", 0] },
                        },
                    },
                    {
                        $project: {
                            post: 1,
                            caption: 1,
                            title: 1,
                            description: 1,
                            views: 1,
                            ownerDetails: {
                                _id: 1,
                                avatar: 1,
                                fullName: 1,
                            },
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                postDetails: { $ifNull: [{ $arrayElemAt: ["$VideoDetails", 0] }, {}] },
            },
        },
        {
            $project: {
                likedBy: 1,
                postDetails: 1,
            },
        },
    ]);

    return sendAPIResp(
        res,
        200,
        likedPosts.length ? "Liked videos fetched successfully✅✅" : "No liked videos found.",
        likedPosts
    );
},
    { statusCode: 500, message: "Something went wrong while fetching liked-Videos." });

