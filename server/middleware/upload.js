const multer = require('multer');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

// Use standard tmpdir storage, controller will stream it to GridFS
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, os.tmpdir());
    },
    filename: (req, file, cb) => {
        crypto.randomBytes(16, (err, raw) => {
            if (err) return cb(err);
            cb(null, raw.toString('hex') + path.extname(file.originalname));
        });
    }
});

const upload = multer({ storage });

module.exports = upload;
