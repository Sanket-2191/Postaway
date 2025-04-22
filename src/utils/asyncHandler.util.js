
import { sendError } from "./sendError.js";


export const asyncHandler = (asyncRequest, options = {}) => {
    return async (req, res, next) => {
        try {
            await asyncRequest(req, res, next);
        } catch (error) {

            return sendError(res, 500, error.message || "Internal Server Error");
        }
    };
}