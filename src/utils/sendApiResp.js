// import { APIresponse } from "./APIresponse.js";

import APIresponse from "./APIresponse.util.js";

export const sendAPIResp = (res, statusCode, message, data) => {
    return res.status(statusCode)
        .json(
            new APIresponse(statusCode, message, data)
        );
};