
import { sendError } from "./sendError.js";


export const asyncHandler = (asyncRequest, options = {}) => {
    return async (req, res, next) => {
        try {
            await asyncRequest(req, res, next);
        } catch (error) {
            console.error("Error in asyncHandler:", error.message || error);
            return sendError(res, error.statusCode || 500, error.message || "Internal Server Error");
        }
    };
}