import jwt from 'jsonwebtoken'

import { asyncHandler } from "../utils/asyncHandler.util.js"
import { sendError } from '../utils/sendError.js';

export const VerifyJWT = asyncHandler(async (res, req, next) => {
    const token = req?.cookies?.accessToken || req?.headers?.authorization?.split(" ")[1] || undefined;
    if (!token) return sendError(res, 401, "User not logged in")

    const payload = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) return sendError(res, 401, "Invalid token")

            const user = await UserModel.findById({ _id: payload._id }).select("-password -refreshToken ");

            req.user = user;
            next()
        }
    )

},
    {
        statusCode: 500,
        message: "Error while verifying JWT."
    }
)

