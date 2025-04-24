import mongoose from "mongoose";

import { FriendModel } from "../models/friend.model.js";
import { UserModel } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendAPIResp } from "../utils/sendApiResp.js";
import { sendError } from "../utils/sendError.js";

// GET /api/friends/get-friends/:userId
export const getFriends = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) return sendError(res, 400, "Invalid user ID");

    const friends = await FriendModel.aggregate([
        {
            $match: {
                $and: [
                    { user: new mongoose.ObjectId(userId) },
                    { status: "accepted" }
                ]
            }
        },
        {          /// DONOT COMBINE FRIENDS AS WHOLE SEPERATE FOLLOWERS and FOLLOWINGS....
            $lookup: {
                from: "users",
                localField: "friend",
                foreignField: "_id",
                as: "friendDetails"
            }
        },
        { $unwind: "$friendDetails" },
        {
            $project: {
                _id: 0,
                friendId: "$friendDetails._id",
                username: "$friendDetails.username",
                fullname: "$friendDetails.fullname",
                avatar: "$friendDetails.avatar"
            }
        }
    ]);

    return sendAPIResp(res, 200, "Friends fetched successfully ✅", friends);
},
    { statusCode: 500, message: "Error fetching friends" });

// GET /api/friends/get-pending-requests
export const getPendingRequests = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const pendingRequests = await FriendModel.aggregate([
        {
            $match: {
                friend: userId,
                status: "pending"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "senderDetails"
            }
        },
        { $unwind: "$senderDetails" },
        {
            $project: {
                senderId: "$senderDetails._id",
                username: "$senderDetails.username",
                fullname: "$senderDetails.fullname",
                avatar: "$senderDetails.avatar"
            }
        }
    ]);

    return sendAPIResp(res, 200, "Pending requests fetched ✅", pendingRequests);
},
    { statusCode: 500, message: "Error fetching pending requests" });

// POST /api/friends/toggle-friendship/:friendId
export const toggleFriendship = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { friendId } = req.params;

    if (!mongoose.isValidObjectId(friendId)) return sendError(res, 400, "Invalid friendId");

    let friendship = await FriendModel.findOne({
        user: userId, friend: friendId
    });

    if (friendship) {
        await friendship.deleteOne();
        return sendAPIResp(res, 200, "Friendship removed successfully ✅", {});
    }

    await FriendModel.create({ user: userId, friend: friendId });
    return sendAPIResp(res, 201, "Friend request sent ✅", {});
},
    { statusCode: 500, message: "Error toggling friendship" });

// PATCH /api/friends/response-to-request/:friendId
export const respondToFriendRequest = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { friendId } = req.params;
    const { action } = req.body;

    if (!["accept", "reject"].includes(action)) return sendError(res, 400, "Invalid action");

    const request = await FriendModel.findOne({
        user: friendId,
        friend: userId,
        status: "pending"
    });

    if (!request) return sendError(res, 404, "Friend request not found");

    request.status = action === "accept" ? "accepted" : "rejected";
    await request.save();

    return sendAPIResp(res, 200, `Friend request ${action}ed ✅`, {});
},
    { statusCode: 500, message: "Error responding to friend request" });
