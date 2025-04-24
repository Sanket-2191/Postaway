import ErrorHandler from "./ErrorHandler.util.js";

export const sendError = (res, statusCode, message) => {
    console.log("Sending error response:", statusCode, message);

    return res.status(statusCode)
        .json(
            new ErrorHandler(
                statusCode,
                message,
                null,
                null
            )
        );
};