const multer = require('multer');
const path   = require('path');

// const PATH_STORAGE_IMAGE = path.resolve(__dirname, '../public/upload');
const PATH_STORAGE_IMAGE = path.resolve(__dirname, '../public/upload');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, PATH_STORAGE_IMAGE)
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})
  
const fileFilter = (req, file, cb) => {
  const { mimetype } = file;
  if (mimetype === 'image/jpeg' || mimetype === 'image/png') 
    cb(null, true);
  cb(new Error('input_not_valid'));
}
var upload = multer({ storage })

module.exports = upload;