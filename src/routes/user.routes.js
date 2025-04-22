import { Router } from "express";



import { upload } from "../middlewares/multer.middleware.js";
// import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    changeUserPassword, getCurrentUser, login,
    logoutFromAllDevices, logoutUser, refreshAccessToken,
    resetPasswordOTP, resetPasswordWithOTP, signup,
    updateCurrentUserDetail
} from "../controllers/user.controllers.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";


const userRouter = Router();


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
// userRouter.route('/channelDetails/:username').get(getUserChannelProfile)

/*------------------------ SECURED ROUTES ------------------------------------------- */

// route for logout
userRouter.route('/logout').get(VerifyJWT, logoutUser)
userRouter.route('/logoutAllDevices').get(VerifyJWT, logoutFromAllDevices)

// // get CurrentUser
userRouter.route('/currentUserProfile').get(VerifyJWT, getCurrentUser);

// // change password
userRouter.route('/changePassword')
    .patch(VerifyJWT, upload.none(), changeUserPassword)

userRouter.route('/passwordResetOTP').get(resetPasswordOTP);
userRouter.route('/resetPassword').get(resetPasswordWithOTP);


// // change fullname and email 
userRouter.route('/change-email-fullName')
    .patch(VerifyJWT, upload.none(), updateCurrentUserDetail);

// // change user avatar
// userRouter.route('/change-avatar')
//     .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

// // change user coverImage 
// // BUG-FIXED: always make sure '/' before route for proper concatination of routes
// userRouter.route('/change-coverImage')
//     .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);


export { userRouter }