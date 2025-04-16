import ErrorHandler from "./ErrorHandler.util.js";


export const asyncHandler = (asyncRequest, options = {}) => {
    return async (req, res, next) => {
        try {
            await asyncRequest(req, res, next);
        } catch (error) {
            if (error instanceof ErrorHandler) {
                return next(error);
            }

            const { statusCode = 500, message = "Something went wrong" } = options;
            next(new ErrorHandler(statusCode, message));
        }
    };
}