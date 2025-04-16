
class ErrorHandler extends Error {
    constructor(
        statusCode,
        message = "Something went wrong!",
        errors = [],
        stack = ""
    ) {
        super();
        this.message = message;
        this.statusCode = statusCode;
        this.data = null;
        this.errors = errors || [];
        this.success = false;

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export default ErrorHandler;