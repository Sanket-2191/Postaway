
class APIresponse {
    constructor(
        statusCode,
        message = 'success',
        data
    ) {
        this.message = message;
        this.data = data
        this.success = statusCode < 400 ? true : false;
    }
}

export default APIresponse;