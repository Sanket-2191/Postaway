import otpGenerator from "otp-generator";


import { UserModel } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { sendEmail } from "../utils/sendMail.util.js";
import { sendAPIResp } from "../utils/sendApiResp.js";
import { sendError } from "../utils/sendError.js";

// functionStart:
export const sendResetPasswordOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    console.log("user received in otp send contr..", user);

    if (!user) return sendError(res, 404,
        "User not found.... PLEASE MAKE SURE PROPER SENDER MAILID & APP PASSWORD IS USED IN TRANSPORTER...error in sending OTP TO email provided");

    const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: true, specialChars: false })

    user.passwordResetOTP = otp;
    user.passwordResetOTPExpires = Date.now() + 10 * 60 * 1000; // valid for 10 mins
    user.otpVerified = false;
    await user.save({ validateBeforeSave: false });

    console.log("saved otp and its expiry:", user);

    await sendEmail(res, email, "Postaway Password Reset OTP",
        `Your OTP is: ${otp}. Please do not share it with anyone. OTP is valid for 10 minutes.`);

    return sendAPIResp(res, 200, "If you are registered with this email, OTP has been sent to your email address. Please check your inbox or spam folder.", {});
},
    { statusCode: 500, message: "PLEASE MAKE SURE PROPER SENDER MAILID & APP PASSWORD IS USED IN TRANSPORTER...Unable to send OTP TO email provided" });


// functionStart:
export const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) return sendError(res, 404, "User not found");

    if (user.passwordResetOTP !== otp) return sendError(res, 400, "Invalid OTP");
    if (!user.passwordResetOTPExpires ||
        user.passwordResetOTPExpires < Date.now()) return sendError(res, 400, "Expired OTP")

    user.otpVerified = true;

    await user.save({ validateBeforeSave: false })
    console.log("verifying otp :", { user, otpReceived: otp });

    return sendAPIResp(res, 200, "OTP verified ✅", {});
},
    { statusCode: 500, message: "Error verifying OTP" });


// functionStart:
export const resetPassword = asyncHandler(async (req, res) => {
    const { email, newPassword } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) return sendError(res, 404, "Email is not registered with Postaway.");
    console.log("reseting password :", user);

    if (!user.otpVerified) {
        console.log("otp notverified:", user.otpVerified);

        return sendError(res, 401, "Please visit password reset page to get OTP for identity verification.")
    }

    if (!user.passwordResetOTP) return sendError(res, 400, "OTP not sent to this email. Please request OTP first.");

    user.password = newPassword;
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpires = undefined;
    user.otpVerified = false;
    await user.save({ validateBeforeSave: false });

    await sendEmail(res, email, "Postaway Password Reset Success", "Your password has been reset successfully. You can now log in with your new password.");

    return sendAPIResp(res, 200, "Password reset successfully ✅", {});
},
    { statusCode: 500, message: "Error resetting password" });
