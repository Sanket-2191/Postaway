

import { UserModel } from "../models/user.model.js";
import APIresponse from "../utils/APIresponse.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { uploadToCloudinary } from "../utils/cloudinaryUploads.util.js";


export const signup = asyncHandler(
    async (req, res) => {
        const { email, username, password, fullname } = req.body;

        if (!(email && username && password && fullname)) {
            return res.status(400)
                .json(
                    new APIresponse(
                        400,
                        "All fields are required during signup.",
                        {}
                    )
                )
        }
        const userEmailExisits = await UserModel.findOne({ email })
        if (userEmailExisits) {
            return res.status(409)
                .json(
                    new APIresponse(
                        409,
                        {},
                        "Account already exists with email :" + email
                    )
                )
        }
        const usernameExisits = await UserModel.findOne({ username })
        if (usernameExisits) {
            return res.status(409)
                .json(
                    new APIresponse(
                        409,
                        {},
                        "Account already exists with username :" + username
                    )
                )
        }


        const { avatar } = req.file;

        const localAvatarPath = avatar?.path || "";
        if (!localAvatarPath) {
            return res.status(500)
                .json(
                    new APIresponse(
                        500,
                        "Unable to save avatar file locally",
                        {}
                    )
                )
        }

        const cloudinaryResp = await uploadToCloudinary(localAvatarPath);

        if (!cloudinaryResp) {
            return res.status(500)
                .json(
                    new APIresponse(
                        500,
                        "Something went wrong while creating URL on cloudinary",
                        {}
                    )
                )
        }

        const avatarURL = cloudinaryResp.url;

        const newUser = await UserModel.create({
            email,
            username,
            fullname,
            password,
            avatar: avatarURL
        })

        if (!newUser) {
            return res.status(500)
                .json(
                    new APIresponse(
                        500,
                        "Something went wrong while creating new user",
                        {}
                    )
                )
        }

        return res.status(201)
            .json(
                new APIresponse(
                    201,
                    "User Signup complete",
                    newUser
                )
            )

    },
    {
        statusCode: 500,
        message: "Error while Signing-up new user."
    }
)