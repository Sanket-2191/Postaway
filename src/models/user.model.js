
import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/ErrorHandler.util.js";
import { sendError } from "../utils/sendError.js";


const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            unique: true,
            required: true
        },
        username: {
            type: String,
            unique: true,
            required: true
        },
        fullname: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        avatar: {
            type: String,

        },
        gender: {
            type: String,
            enum: { values: ['male', 'female', 'other', 'prefer not to say'], message: '{VALUE} is not supported' },
            default: 'prefer not to say'
        },
        refreshToken: [{
            type: String,
            default: null
        }],
        passwordResetOTP: {
            type: String,
            default: null
        },
        passwordResetOTPExpires: {
            type: Date,
            default: null
        },
        otpVerified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

userSchema.pre('save', async function (next) {
    /*
           so that bcrypt dont run every time when document is 
           modified and only run when "password" is modified
       */
    try {
        if (!this.isModified('password')) return next();

        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        console.log("Error in hashing password: ", error);
        throw new ErrorHandler("Error in hashing password")

    }
})

userSchema.methods.isPasswordCorrect = async function (password) {
    if (!this.password || !password) throw new Error("Missing password");

    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        console.error("Error comparing password:", error.message);
        throw new Error("Error comparing password");
    }
}


userSchema.methods.generate_accessToken = function () {
    const accessToken = jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email
        },
        'hsoifsbgsojbd09oiw3r2rjwkFJsdfdfngoi06943jmssov2651dfgd',
        {
            expiresIn: '1d'
        }

    )

    return accessToken;
}

userSchema.methods.generate_refreshToken = function () {
    const refreshToken = jwt.sign(
        {
            _id: this._id
        },
        'sbosieurth395034uwjtslnsps8y4hta5eoghdnifghr049u43ons',
        {
            expiresIn: '5d'
        }

    )

    return refreshToken;
}


export const UserModel = mongoose.model('User', userSchema);