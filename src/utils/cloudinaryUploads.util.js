// Description: This file contains the function to upload files to Cloudinary and remove the local file after uploading.
import fs from 'fs'
import { v2 as cloudinary } from 'cloudinary';


import { sendError } from './sendError.js';

// console.log("Cloudinary API Key: ", process.env.CLOUDINARY_API_KEY ? "loaded" : "not loaded");
// console.log("Cloudinary API Secret: ", process.env.CLOUDINARY_API_SECRET ? "loaded" : "not loaded");


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});


export const uploadToCloudinary = async (res, localPath) => {

    try {
        if (!localPath) {
            return sendError(res, 400, "localPath is required to upload to cloudinary")
        }
        const response = await cloudinary.uploader.upload(localPath, { resource_type: "auto" })
        console.log("Cloudinary response in utils: ", response);

        return response;
    } catch (error) {
        return sendError(res, 500, "failed uploading " + localPath + " on cloudinary")
    } finally {
        fs.unlinkSync(localPath);
        console.log("Removed local file at " + localPath);
    }

}
