import { Router } from "express";


import { getFriends, getPendingRequests, respondToFriendRequest, toggleFriendship } from "../controllers/friend.controller.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";

export const friendRouter = Router();

// Get a user's friends
friendRouter.get('/get-friends/:userId', VerifyJWT, getFriends);

// Get pending friend requests
friendRouter.get('/get-pending-requests', VerifyJWT, getPendingRequests);

// Toggle friendship (send or cancel request / unfriend)
friendRouter.post('/toggle-friendship/:friendId', VerifyJWT, toggleFriendship);

// Accept or reject a friend request
friendRouter.post('/response-to-request/:friendId', VerifyJWT, respondToFriendRequest);