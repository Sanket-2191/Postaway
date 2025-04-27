import { Router } from "express";



import { upload } from "../middlewares/multer.middleware.js";
import {
    changeUserPassword, getCurrentUser, getUserChannelProfile, login,
    logoutFromAllDevices, logoutUser, refreshAccessToken,
    signup, updateCurrentUserDetail, updateUserAvatar
} from "../controllers/user.controllers.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";


export const userRouter = Router();


// route for registration
userRouter.route('/signup')
    .post(
        upload.single("avatar"),
        signup
    )

// route for login
userRouter.route('/login').post(upload.none(), login)
// upload.none() only needed when form-data is received


// route for newAccessToken
userRouter.route('/newAuthenticationTokens').get(refreshAccessToken)

// get channelDetails
userRouter.route('/userDetails/:username').get(getUserChannelProfile)



/*------------------------ SECURED ROUTES ------------------------------------------- */

// route for logout
userRouter.route('/logout').get(VerifyJWT, logoutUser)
userRouter.route('/logoutAllDevices').get(VerifyJWT, logoutFromAllDevices)

// // get CurrentUser
userRouter.route('/currentUserProfile').get(VerifyJWT, getCurrentUser);

// // change password
userRouter.route('/changePassword')
    .patch(VerifyJWT, upload.none(), changeUserPassword)

// // change fullname and email 
userRouter.route('/update-details')
    .patch(VerifyJWT, upload.none(), updateCurrentUserDetail);

// // change user avatar
userRouter.route('/change-avatar')
    .patch(VerifyJWT, upload.single("avatar"), updateUserAvatar);

// // change user coverImage
// // BUG-FIXED: always make sure '/' before route for proper concatination of routes
// userRouter.route('/change-coverImage')
//     .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);


