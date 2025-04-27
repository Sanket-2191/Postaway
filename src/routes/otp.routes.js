import { Router } from "express";

import { resetPassword, sendResetPasswordOTP, verifyOTP } from "../controllers/otp.controller.js";
import { upload } from "../middlewares/multer.middleware.js";



export const otpRouter = Router();



otpRouter.route('/send').get(upload.none(), sendResetPasswordOTP);
otpRouter.route('/verify').patch(upload.none(), verifyOTP);
otpRouter.route('/reset-password').patch(upload.none(), resetPassword);
