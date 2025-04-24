import { UserModel } from "../models/user.model.js";
import { asyncHandler } from "./asyncHandler.util.js";
import { sendError } from "./sendError.js";

export const requestPasswordOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) return sendError(res, 404, "User not found");

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const otpExpiry = Date.now() + 10 * 60 * 1000; // valid for 10 mins

    user.passwordResetOTP = otp;
    user.passwordResetExpiry = otpExpiry;
    await user.save({ validateBeforeSave: false });

    // TODO Send OTP via email/SMS (use nodemailer/twilio)
    console.log("OTP sent to user:", otp);

    return sendAPIResp(res, 200, "OTP sent successfully");
});