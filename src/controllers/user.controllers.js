
import otpGenerator from 'otp-generator';

import { UserModel } from "../models/user.model.js";
import APIresponse from "../utils/APIresponse.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { uploadToCloudinary } from "../utils/cloudinaryUploads.util.js";
import { deleteAssestFromCloudinary } from '../utils/deleteCloudinaryAssest.js';
import { sendAPIResp } from "../utils/sendApiResp.js";
import { sendError } from "../utils/sendError.js";
import { sendEmail } from '../utils/sendMail.util.js';

const COOKIE_OPTIONS = { httpOnly: true, secure: true, sameSite: "strict" }

const generate_access_and_refresh_tokens = async (res, userId) => {
    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return sendError(res, 404, "User not found");
        }

        const accessToken = user.generate_accessToken();
        const refreshToken = user.generate_refreshToken();

        // Avoid storing duplicates
        if (!user.refreshToken.includes(refreshToken)) {
            user.refreshToken.push(refreshToken);
        }

        // Optional: Limit stored refresh tokens (e.g., max 5)
        if (user.refreshToken.length > 5) {
            user.refreshToken = user.refreshToken.slice(-5);
        }

        await user.save({ validateBeforeSave: false });

        console.log("User after saving refresh token: ", { accessToken, refreshToken });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error in generating tokens: ", error);
        return sendError(res, 500, "Error in generating tokens: " + error.message);
    }
};

export const signup = asyncHandler(
    async (req, res) => {
        const { email, username, password, fullname, gender } = req.body;

        if (!(email && username && password && fullname)) return sendError(res, 400, "All fields are required during signup.")

        const userEmailExisits = await UserModel.findOne({ email })
        if (userEmailExisits) return sendError(res, 409, "Account already exists with email :" + email)


        const usernameExisits = await UserModel.findOne({ username })
        if (usernameExisits) return sendError(res, 409, "Account already exists with username :" + username)


        // const avatar = ;
        // console.log("req.file: ", req.file);

        const localAvatarPath = req?.file?.path || "";
        if (!localAvatarPath) return sendError(res, 500, "Unable to save avatar file locally")

        const cloudinaryResp = await uploadToCloudinary(res, localAvatarPath);
        if (cloudinaryResp?.error) return sendError(res, 500, "Something went wrong while creating URL on cloudinary")

        console.log("Cloudinary response in controller: ", cloudinaryResp);

        const avatarURL = cloudinaryResp.secure_url;

        const newUser = await UserModel.create({
            email,
            username,
            fullname,
            password,
            avatar: avatarURL,
            gender,
            refreshToken: ""
        })

        const userInfo = await UserModel.findById(newUser._id).select("-password -refreshToken")
        if (!userInfo) return sendError(res, 500, "Something went wrong while creating new user")


        console.log(newUser);

        return sendAPIResp(
            res,
            201,
            "User Signup complete",
            userInfo
        )


    },
    {
        statusCode: 500,
        message: "Error while Signing-up new user."
    }
)

export const login = asyncHandler(
    async (req, res) => {
        const { loginCredential, password } = req.body;
        // loginCredential because can be email or a username.

        if (!(loginCredential && password)) return sendError(res, 400, "login credentials can not be empty");

        const user = await UserModel.findOne({
            $or: [
                { username: loginCredential },
                { email: loginCredential }
            ]
        });
        if (!user) return sendError(res, 404, "User not found")

        const isPasswordCorrect = await user.isPasswordCorrect(res, password);
        if (!isPasswordCorrect) return sendError(res, 401, "Incorrect password")

        const { accessToken, refreshToken } = generate_access_and_refresh_tokens(res, user._id);

        return res.status(200)
            .cookie("accessToken", accessToken, COOKIE_OPTIONS)
            .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
            .json(
                new APIresponse(
                    200,
                    "Login successfull",
                    {
                        accessToken
                    }
                )
            )
    },
    {
        statusCode: 500,
        message: "Error while logging in."
    }
)

export const logoutUser = asyncHandler(
    async (req, res) => {
        const { refreshToken } = req?.cookies || req?.body || undefined;

        if (!refreshToken) return sendError(res, 401, "User not logged in")

        await UserModel.findByIdAndUpdate(
            { _id: req.user._id },
            { $pull: { refreshToken: refreshToken } }
        )

        return res.status(200)
            .clearCookie("accessToken", COOKIE_OPTIONS)
            .clearCookie("refreshToken", COOKIE_OPTIONS)
            .json(
                new APIresponse(
                    200,
                    "Logout successfull",
                    {}
                )
            )
    },
    {
        statusCode: 500,
        message: "Error while logging out."
    }
)

export const refreshAccessToken = asyncHandler(
    async (req, res) => {
        const { refreshToken } = req?.cookies || req?.body || undefined;
        if (!refreshToken) return sendError(res, 401, "User not logged in")


        const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        if (!payload) return sendError(res, 401, "Invalid refresh token");

        const user = await UserModel.findById({ _id: payload._id });
        if (!user) return sendError(res, 401, "Expired refresh token")

        const { accessToken, refreshToken: newRefreshToken } = generate_access_and_refresh_tokens(res, user._id);


        res.status(200)
            .cookie("accessToken", accessToken, COOKIE_OPTIONS)
            .cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS)
            .json(
                new APIresponse(
                    200,
                    "Access token refreshed",
                    { accessToken }
                )
            )
    },
    {
        statusCode: 500,
        message: "Error while refreshing access token."
    }
)

export const logoutFromAllDevices = asyncHandler(
    async (req, res) => {
        const { refreshToken } = req?.cookies || req?.body || undefined;
        if (!refreshToken) return sendError(res, 401, "User not logged in",)

        await UserModel.findByIdAndUpdate(
            { _id: req.user._id },
            { $unset: { refreshToken: [] } },
        )

        return res.status(200)
            .clearCookie("refreshToken")
            .json(
                new APIresponse(
                    200,
                    "Logout successfull from all devices",
                    {}
                )
            )
    },
    {
        statusCode: 500,
        message: "Error while logging out from all devices."
    }
)

// works ✅✅
export const changeUserPassword = asyncHandler(async (req, res) => {
    // get old password and newPassword.
    const { oldPassword, newPassword } = req.body;

    // get user._id from req.user and get user from DB
    /*
        we know req obj will have user because, we are using authMidware in changePassword route
    */
    const user = await UserModel.findById(req.user?._id);

    // check for old password 
    const isPasswordCorrect = await user.isPasswordCorrect(res, oldPassword);
    if (!isPasswordCorrect) return sendError(res, 400, "Old password is incorrect!");

    // set new password, bcrypt in UserModel will handle hashing of password.
    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    return sendAPIResp(res, 200, "Password changed successfully✅✅", {});
},
    { statusCode: 500, message: "Password change failed :" });

export const resetPasswordOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) return sendError(res, 404, "User not found");

    const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: true, specialChars: false })

    user.passwordResetOTP = otp;
    user.passwordResetExpiry = Date.now() + 10 * 60 * 1000; // valid for 10 mins
    await user.save({ validateBeforeSave: false });

    await sendEmail(res, email, "Postaway Password Reset OTP",
        `Your OTP is: ${otp}. Please do not share it with anyone. OTP is valid for 10 minutes.`);

    return sendAPIResp(res, 200, "OTP sent successfully");
});

export const resetPasswordWithOTP = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) return sendError(res, 404, "User not found");

    if (
        user.passwordResetOTP !== otp ||
        !user.passwordResetExpiry ||
        user.passwordResetExpiry < Date.now()
    ) {
        return sendError(res, 400, "Invalid or expired OTP");
    }

    user.password = newPassword; // hashing handled in schema
    user.passwordResetOTP = undefined;
    user.passwordResetExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    return sendAPIResp(res, 200, "Password reset successfully ✅", {});
});
// works ✅✅
export const getCurrentUser = asyncHandler(async (req, res) => {
    return sendAPIResp(res, 200, "Current user fetched successfully✅✅", req.user);
},
    { statusCode: 500, message: "Unable to fetch Current user." });

// BUG-FIXED Make sure the feidnames match in code and in form-data
// works ✅✅
export const updateCurrentUserDetail = asyncHandler(async (req, res) => {
    console.log("userDetails received in body...", req.body);

    const { fullname, email } = req.body;

    console.log("1. find the user with req.user._id=", req.user._id);

    // if (!(fullname && email)) return sendError(res, 400, "All fields are required");

    console.log("2. find the user with req.user._id=", req.user._id);
    const updatedUser = await UserModel.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullname: fullname ? fullname : req.user.fullname,
                email: email ? username : req.user.email

            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");
    // console.log("couldn't find the user with req.user._id=", req.user._id);
    if (!updatedUser) return sendError(res, 404, "User not found");

    return sendAPIResp(
        res,
        200,
        "User updated successfully✅✅",
        updatedUser
    );
},
    { statusCode: 500, message: "Email and fullName update failed :" });

export const updateUserAvatar = asyncHandler(async (req, res) => {
    // get avatar file objects from req.file not req.files as we are only accepting for one field.
    const avatar = req.file;
    if (!avatar) return sendError(res, 400, "No file received for avatar update");

    // get localFilePath for avatar.
    const avatarLocalFilePath = avatar?.path;
    if (!avatarLocalFilePath) return sendError(res, 500,
        "Unable to create file locally while avatar update!");

    // get URL for avatarFile from cloudinary...
    const cloudinaryOBJ = await uploadToCloudinary(avatarLocalFilePath);
    const avatarURL = cloudinaryOBJ.url;
    if (!avatarURL) return sendError(res, 500, "Unable to create cloudinary-url for avatar update!");

    // update user with new avatar URL
    const user = await UserModel.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatarURL
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    // delete old avatar from cloudinary..
    const deleted = await deleteAssestFromCloudinary(res, req.user.avatar);
    if (deleted.result !== "ok") return sendError(res, 500, `Cloudinary avatar delete failed: ${deleted.result}`)

    return sendAPIResp(
        res,
        200,
        "Avatar update successful✅✅",
        user
    );
},
    { statusCode: 500, message: "Avatar update failed :" });

export const getUserChannelProfile = asyncHandler(async (req, res) => {
    // this will generally get trggered when user clicks on other channel link or profile...
    // get username from params
    const { username, userId } = req.params;  // we will 
    console.log("req.params.username :", username);

    if (!username?.trim()) return sendError(res, 400, "No username received for fetching channel profile.");

    if (userId && !(mongoose.isValidObjectId(userId))) return sendError(res, 400, "userId should be valid for fetching channel profile.");

    const channelProfile = await userModel.aggregate([
        // Match by userId or username
        {
            $match: { username }
        },

        // Users this user has sent requests to (outgoing)
        {
            $lookup: {
                from: "friends",
                localField: "_id",
                foreignField: "user",
                as: "friendsSent"
            }
        },

        // Users who sent requests to this user (incoming)
        {
            $lookup: {
                from: "friends",
                localField: "_id",
                foreignField: "friend",
                as: "friendsReceived",
                pipeline: [
                    {
                        $match: { status: "accepted" } // Only count accepted requests
                    },
                    {
                        $project: {
                            user: 1
                        }
                    }
                ]
            }
        },

        {
            $addFields: {
                friendsCount: { $size: "$friendsSent" },
                followersCount: { $size: "$friendsReceived" },

                isFriend: {
                    $cond: {
                        if: {
                            $in: [
                                mongoose.Types.ObjectId(req.user?._id), // Logged-in user
                                "$friendsReceived.user" // Users who have sent request to this profile
                            ]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },

        {
            $project: {
                username: 1,
                fullName: 1,
                avatar: 1,
                friendsCount: 1,
                followersCount: 1,
                isFriend: 1
            }
        }
    ]);

    if (!channelProfile?.length) return sendError(res, 404, "channel not found");

    return sendAPIResp(res, 200, 'Channel profile fetched successfully✅✅', channelProfile?.[0] || {});

},
    { statusCode: 500, message: "Unable to fetch channel profile :" })
