
import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";


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

        }
    },
    {
        timestamps: true
    }
)

userSchema.pre('save', async function () {
    /*
           so that bcrypt dont run every time when document is 
           modified and only run when "password" is modified
       */
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}


userSchema.methods.generate_accessToken = function () {
    const accessToken = jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email
        },
        {
            expiresIn: '1d'
        },
        {
            secret: 'aslabsalifrubsn98w45n23j2jmf'
        }
    )

    return accessToken;
}

userSchema.methods.generate_refreshToken = function () {
    const refreshToken = jwt.sign(
        {
            _id: this._id
        },
        {
            expiresIn: '5d'
        },
        {
            secret: 'aslabsalasfjkbsdfih93925072hnfewojmf'
        }
    )

    return refreshToken;
}


export const UserModel = mongoose.model('User', userSchema);