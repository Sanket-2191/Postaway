import fs from 'fs'

import { v2 as cloudinary } from 'cloudinary';
import ErrorHandler from './ErrorHandler.util';

cloudinary.config({
    cloud_name: 'din14pksa',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});


export const uploadToCloudinary = (localPath) => {
    cloudinary.uploader
        .upload(localPath)
        .then(res => {
            return res;
        })
        .catch(err => {
            throw new ErrorHandler(500, "failed uploading " + localPath + " on cloudinary")
        })
        .finally(() => {
            fs.unlinkSync(localPath);
            console.log("Removed local file at " + localPath);

        })

}