import multer from "multer";
import ErrorHandler from "../utils/ErrorHandler.util.js";


const storage = multer.diskStorage(
    {
        destination: function (req, file, cb) {
            console.log("Destination called", file.mimetype);

            cb(null, './public')
        },
        filename: function (req, file, cb) {
            console.log("Filename called", file.mimetype);

            cb(null, file.fieldname + "-" + Math.floor(Math.random(1000) + 1) + "-" + Date.now())
        }
    }
)


export const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        console.log("File filter called", file.mimetype);

        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true)
        } else {
            cb(new ErrorHandler(400, 'Unsupported file format for :', file.fieldname), false); // Reject file properly
        }


    }
}
)