const multer = require("multer");
const path = require("path");
//Cấu hình lưu file trong server
const storage = multer.diskStorage({
    destination: path.join(__dirname, "../../public/uploads"),
    filename: function (req, file, cb) {
        let fileName = `${Date.now()}${file.originalname}`;
        cb(null, fileName);
    }
});
const fileFilter = function (req, file, cb){
    if(!file.mimetype.match("image/*")){
        return cb("Chỉ chấp nhận file image",false);
    }
    cb(null,true);
}
const limits = {
    fileSize: 1048576,
    fileName:300
}
const upload = multer({
    storage: storage,
    fileFilter:fileFilter,
    limits:limits
});
module.exports = upload;