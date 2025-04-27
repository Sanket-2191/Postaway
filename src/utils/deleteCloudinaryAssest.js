import cloudinary from 'cloudinary';
import { extractPublicId } from 'cloudinary-build-url';


import { sendError } from './sendError.js';



// console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
// console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "Loaded" : "Missing");
// console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "Loaded" : "Missing");
// Ensure Cloudinary is configured
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

export const deleteAssestFromCloudinary = async (res, url) => {
    try {
        if (!url) return sendError(res, 400, "URL needed to delete the asset from Cloudinary");

        const publicId = extractPublicId(url); // Extracts public ID
        // console.log("URL:", url);
        console.log("Extracted Public ID:", publicId);

        // Use `uploader.destroy()` instead of `delete_resources`
        const deleteComplete = await cloudinary.v2.uploader.destroy(publicId);

        // console.log("Cloudinary API Response:", deleteComplete);

        console.log("Asset deletion successful:", deleteComplete);
        return deleteComplete;

    } catch (err) {
        // console.error("Error deleting asset:", err);
        return sendError(res, 500, "Unable to delete the asset from Cloudinary >> " + err.message || "");
    }
};

// const url = 'https://res.cloudinary.com/din14pksa/image/upload/v1742834640/ehok61z0cy31zsfhj33s.png';

// deleteAssestFromCloudinary(url);
/*
    URL: https://res.cloudinary.com/din14pksa/image/upload/v1742834640/ehok61z0cy31zsfhj33s.png
    Extracted Public ID: ehok61z0cy31zsfhj33s
    Cloudinary API Response: { result: 'ok' }
    Asset deletion successful: { result: 'ok' }
*/