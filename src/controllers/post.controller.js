import { PostModel } from "../models/post.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { uploadToCloudinary } from "../utils/cloudinaryUploads.util.js";
import { sendAPIResp } from "../utils/sendApiResp.js";
import { sendError } from "../utils/sendError.js";

export const getAllPosts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc" } = req.query;
    const sortOrder = sortType === "asc" ? 1 : -1;

    const filterStage = query ? {
        $search: {
            index: "caption-search", // Your Atlas Search index name
            text: {
                query: query.trim(),
                path: ["caption"]
            }
        }
    } : { $match: { _id: { $exists: true } } };

    const sortStage = {
        $sort: {
            [sortBy]: sortOrder
        }
    };

    const pipeline = [
        filterStage,
        sortStage,
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        { $unwind: "$ownerDetails" },
        {
            $project: {
                caption: 1,
                post: 1,
                createdAt: 1,
                owner: "$ownerDetails.username",
                avatar: "$ownerDetails.avatar"
            }
        }
    ];

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const posts = await PostModel.aggregatePaginate(PostModel.aggregate(pipeline), options);

    return sendAPIResp(res, 200, "Posts fetched successfully✅✅", posts);
},
    { statusCode: 500, message: "Something went wrong while fetching posts" });


export const createPost = asyncHandler(async (req, res) => {
    const { caption } = req.body;
    const ownerId = req.user?._id; // Assumes auth middleware populates req.user

    if (!caption && !req.file?.path) {
        return sendError(res, 400, "Caption and file are required");
    }

    const cloudUpload = await uploadToCloudinary(res, req.file.path);
    if (!cloudUpload?.secure_url) return; // Error already sent from utility

    const newPost = await PostModel.create({
        caption,
        owner: ownerId,
        post: cloudUpload.secure_url
    });

    return sendAPIResp(res, 201, "Post created successfully✅✅", newPost);
},
    { statusCode: 500, message: "Something went wrong while creating post" });


export const getPostById = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    if (!mongoose.isValidObjectId(postId)) {
        return sendError(res, 400, "Invalid post ID");
    }

    const post = await PostModel.findById(postId).populate("owner", "username avatar");
    if (!post) return sendError(res, 404, "Post not found");

    return sendAPIResp(res, 200, "Post fetched successfully✅✅", post);
},
    { statusCode: 500, message: "Something went wrong while fetching the post" });


export const getPostsByUser = asyncHandler(async (req, res) => {
    const { userId } = req.query;

    if (!mongoose.isValidObjectId(userId)) {
        return sendError(res, 400, "Invalid user ID");
    }

    const posts = await PostModel.find({ owner: userId })
        .populate("owner", "username avatar")
        .sort({ createdAt: -1 });

    return sendAPIResp(res, 200, "User posts fetched successfully✅✅", posts);
},
    { statusCode: 500, message: "Something went wrong while fetching user's posts" });

export const deletePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    if (!mongoose.isValidObjectId(postId)) {
        return sendError(res, 400, "Invalid post ID");
    }

    const post = await PostModel.findById(postId);
    if (!post) return sendError(res, 404, "Post not found");

    if (post.owner.toString() !== req.user._id.toString()) {
        return sendError(res, 403, "You are not authorized to delete this post");
    }

    await post.deleteOne();

    return sendAPIResp(res, 200, "Post deleted successfully✅✅", null);
},
    { statusCode: 500, message: "Something went wrong while deleting the post" });


export const updatePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { caption } = req.body;

    if (!mongoose.isValidObjectId(postId)) {
        return sendError(res, 400, "Invalid post ID");
    }

    if (!caption) {
        return sendError(res, 400, "Caption is required");
    }

    const post = await PostModel.findById(postId);
    if (!post) return sendError(res, 404, "Post not found");

    // Only allow owner to update
    if (post.owner.toString() !== req.user._id.toString()) {
        return sendError(res, 403, "You are not authorized to update this post");
    }

    post.caption = caption;

    post.save({
        validateBeforeSave: false // Skip validation to allow for partial updates
    });

    return sendAPIResp(res, 200, "Post updated successfully✅✅", post);
},
    { statusCode: 500, message: "Something went wrong while updating the post" });