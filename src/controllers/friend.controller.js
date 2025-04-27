import mongoose from "mongoose";

import { FriendModel } from "../models/friend.model.js";
import { sendAPIResp } from "../utils/sendApiResp.js";
import { sendError } from "../utils/sendError.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";



// GET /api/friends/get-friends/:userId
// functionStart:
export const getUserWeFollow = asyncHandler(async (req, res) => {
    let { userId } = req.params;
    let noFollowings = "User with provided userId has no followings yet...";
    let msg = "Followings fetched successfully ✅";
    if (!mongoose.isValidObjectId(userId)) {
        msg = "Fetched followings for logged-in user ✅ as provided userId is not valid...";
        noFollowings = "Logged-in user has no followings yet... the provided userId was invalid.";
        userId = req.user._id;
    } else {
        userId = new mongoose.Types.ObjectId(userId);
    }

    const following = await FriendModel.aggregate([
        {
            $match: {
                sender: userId,
                status: "accepted"
            }
        },
        {
            $lookup: {
                from: "users",
                let: { sentToId: "$sentTo", senderId: "$sender" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $eq: ["$_id", "$$sentToId"] },
                                    { $eq: ["$_id", "$$senderId"] }
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            email: 1,
                            avatar: 1
                        }
                    }
                ],
                as: "userDetails"
            }
        },
        {
            $addFields: {
                followingUser: {
                    $first: {
                        $filter: {
                            input: "$userDetails",
                            as: "user",
                            cond: { $eq: ["$$user._id", "$sentTo"] }
                        }
                    }
                },
                senderUser: {
                    $first: {
                        $filter: {
                            input: "$userDetails",
                            as: "user",
                            cond: { $eq: ["$$user._id", "$sender"] }
                        }
                    }
                }
            }
        },
        {
            $group: {
                _id: "$sender",
                following: { $push: "$followingUser" },
                senderUsername: { $first: "$senderUser.username" }
            }
        },
        {
            $project: {
                _id: 0,
                sender: "$_id",
                senderUsername: 1,
                following: 1,
                followingCount: { $size: "$following" }
            }
        }
    ]);

    return sendAPIResp(res, 200, following.length ? msg : noFollowings, following.length ? following[0] : {});
}, { statusCode: 500, message: "Error fetching followings" });


// functionStart:
export const getFollowers = asyncHandler(async (req, res) => {
    let { userId } = req.params;
    let noFollowers = "User with provided userId has no followers yet...";
    let msg = "Followers fetched successfully ✅";

    if (!mongoose.isValidObjectId(userId)) {
        msg = "Fetched followers for logged-in user ✅ as provided userId is not valid...";
        noFollowers = "Logged-in user has no followers yet... the provided userId was invalid.";
        userId = req.user._id;
    } else {
        userId = new mongoose.Types.ObjectId(userId);
    }

    const followers = await FriendModel.aggregate([
        {
            $match: {
                sentTo: userId,
                status: "accepted"
            }
        },
        {
            $lookup: {
                from: "users",
                let: { senderId: "$sender", sentToId: "$sentTo" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $eq: ["$_id", "$$senderId"] },
                                    { $eq: ["$_id", "$$sentToId"] }
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            email: 1,
                            avatar: 1
                        }
                    }
                ],
                as: "userDetails"
            }
        },
        {
            $addFields: {
                followerUser: {
                    $first: {
                        $filter: {
                            input: "$userDetails",
                            as: "user",
                            cond: { $eq: ["$$user._id", "$sender"] }
                        }
                    }
                },
                receiverUser: {
                    $first: {
                        $filter: {
                            input: "$userDetails",
                            as: "user",
                            cond: { $eq: ["$$user._id", "$sentTo"] }
                        }
                    }
                }
            }
        },
        {
            $group: {
                _id: "$sentTo",
                followers: { $push: "$followerUser" },
                receiverUsername: { $first: "$receiverUser.username" }
            }
        },
        {
            $project: {
                _id: 0,
                sentTo: "$_id",
                receiverUsername: 1,
                followers: 1,
                followersCount: { $size: "$followers" }
            }
        }
    ]);

    return sendAPIResp(res, 200, followers.length ? msg : noFollowers, followers.length ? followers[0] : {});
}, { statusCode: 500, message: "Error fetching followers" });


// GET /api/friends/get-pending-requests
// functionStart:
export const getPendingRequests = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const pendingRequests = await FriendModel.aggregate([
        {
            $match: {
                sentTo: userId,
                status: "pending"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "sender",
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

    return sendAPIResp(res, 200, pendingRequests.length ? "Pending requests fetched ✅" : "No pending requests..", pendingRequests);
},
    { statusCode: 500, message: "Error fetching pending requests" });

// POST /api/friends/toggle-friendship/:friendId
// functionStart:
export const toggleFriendship = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { friendId } = req.params;

    if (!mongoose.isValidObjectId(friendId)) return sendError(res, 400, "Invalid friendId");

    let friendship = await FriendModel.findOne({
        sender: userId, sentTo: friendId
    });

    if (friendship) {
        const friendShip = await friendship.deleteOne();
        return sendAPIResp(res, 200, "Friendship removed successfully ✅", friendShip);
    }

    const friendShip = await FriendModel.create({ sender: userId, sentTo: friendId });
    return sendAPIResp(res, 201, "Friend request sent ✅", friendShip);
},
    { statusCode: 500, message: "Error toggling friendship" });

// PATCH /api/friends/response-to-request/:friendId
export const respondToFriendRequest = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { friendId } = req.params;
    const { action } = req.body;
    console.log("respondToFriendRequest", { action, friendId, userId });


    if (!["accept", "reject"].includes(action)) return sendError(res, 400, "Invalid action");

    const request = await FriendModel.findOne({
        sender: friendId,
        sentTo: userId,
        status: "pending"
    });

    console.log("request found?", request);


    if (!request) return sendError(res, 404, "Friend request not found");

    request.status = (action == "accept") ? "accepted" : "rejected";
    await request.save();

    return sendAPIResp(res, 200, `Friend request ${action}ed ✅`, request);
},
    { statusCode: 500, message: "Error responding to friend request" });
