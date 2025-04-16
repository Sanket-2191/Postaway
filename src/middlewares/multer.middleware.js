import multer from "multer";


const storage = multer.diskStorage(
    {
        destination: function (req, file, cb) {
            cb(null, './public/temp_uploads')
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + "-" + Math.floor(Math.random(1000) + 1) + "-" + Date.now())
        }
    }
)


export const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        if (!(file.mimetype === 'img/jpeg' || file.mimetype === 'img/png')) {
            cb(new ErrorHandler(400, 'Unsupported file format for :', file.fieldname), false); // Reject file properly
        }

        cb(null, true)
    }
}
)