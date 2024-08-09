const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // File type validation if needed
    cb(null, true); // Accept the file
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

const uploadFields = upload.fields([
    { name: 'certificate', maxCount: 1 },
    { name: 'photo', maxCount: 1 },
    { name: 'image', maxCount: 1 }
]);

module.exports = uploadFields;
