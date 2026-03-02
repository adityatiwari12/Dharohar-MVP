const { getGFS } = require('../config/db');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Retrieve file from GridFS and stream it back
exports.getFile = async (req, res, next) => {
    try {
        const gfs = getGFS();
        const fileId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            const error = new Error('Invalid file ID');
            error.statusCode = 400;
            throw error;
        }

        const files = await gfs.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();
        if (!files || files.length === 0) {
            const error = new Error('File not found');
            error.statusCode = 404;
            throw error;
        }

        const file = files[0];
        res.set('Content-Type', file.contentType);
        // Optional: res.set('Content-Disposition', `attachment; filename="${file.filename}"`);

        const readStream = gfs.openDownloadStream(file._id);
        readStream.pipe(res);

        readStream.on('error', (err) => {
            logger.error(`Read Stream Error: ${err.message}`);
            res.status(500).json({ message: 'Error streaming file' });
        });
    } catch (error) {
        next(error);
    }
};

// Handle file upload response (metadata linkage happens in asset controller)
exports.uploadFile = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.status(201).json({
        message: 'File uploaded successfully',
        fileId: req.file.id,
        filename: req.file.filename,
        contentType: req.file.contentType
    });
};

// Delete file from GridFS
exports.deleteFile = async (req, res, next) => {
    try {
        const gfs = getGFS();
        const fileId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            const error = new Error('Invalid file ID');
            error.statusCode = 400;
            throw error;
        }

        await gfs.delete(new mongoose.Types.ObjectId(fileId));
        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        next(error);
    }
};
