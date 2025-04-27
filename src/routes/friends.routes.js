import { Router } from "express";


import { getFollowers, getUserWeFollow, getPendingRequests, respondToFriendRequest, toggleFriendship } from "../controllers/friend.controller.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

export const friendRouter = Router();

// Get a user's friends
friendRouter.route('/get-following/:userId').get(VerifyJWT, getUserWeFollow);

// Get a user's followers
friendRouter.route('/get-followers/:userId').get(VerifyJWT, getFollowers);

// Get pending friend requests
friendRouter.route('/get-pending-requests').get(VerifyJWT, getPendingRequests);

// Toggle friendship (send or cancel request / unfriend)
friendRouter.route('/toggle-friendship/:friendId').post(VerifyJWT, toggleFriendship);

// Accept or reject a friend request
friendRouter.route('/response-to-request/:friendId').patch(VerifyJWT, upload.none(), respondToFriendRequest);