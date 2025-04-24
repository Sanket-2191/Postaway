import jwt from 'jsonwebtoken'

import { asyncHandler } from "../utils/asyncHandler.util.js"
import { sendError } from '../utils/sendError.js';
import { UserModel } from '../models/user.model.js';

export const VerifyJWT = asyncHandler(async (req, res, next) => {

    console.log("JWT verification started...");
    const token = req?.cookies?.accessToken || req?.headers?.authorization?.split(" ")[1] || undefined;
    if (!token) {
        console.log("Token not found");

        return sendError(res, 401, "User not logged in");
    }

    const payload = jwt.verify(
        token,
        'hsoifsbgsojbd09oiw3r2rjwkFJsdfdfngoi06943jmssov2651dfgd',
        async (err, decoded) => {
            if (err) return sendError(res, 401, "Invalid token")

            const user = await UserModel.findById({ _id: decoded._id }).select("-password -refreshToken ");

            req.user = user;
            console.log("JWT verified");

            next();
        }
    )

},
    {
        statusCode: 500,
        message: "Error while verifying JWT."
    }
)

