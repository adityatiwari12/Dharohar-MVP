const { getGFS } = require('../config/db');
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Point fluent-ffmpeg at the bundled binary
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Classify an uploaded file's intended output format by MIME type / extension */
function getTranscodeTarget(mimetype, originalname) {
    const ext = path.extname(originalname).toLowerCase();
    const videoTypes = ['video/', '.webm', '.mkv', '.avi', '.mov', '.mp4'];
    const audioTypes = ['audio/', '.wav', '.ogg', '.flac', '.aac', '.webm'];

    if (videoTypes.some(t => mimetype.startsWith(t) || ext === t)) {
        // But if extension is clearly audio (e.g. audio/webm for a mic recording) keep as audio
        if (mimetype.startsWith('audio/')) return 'audio';
        return 'video';
    }
    if (audioTypes.some(t => mimetype.startsWith(t) || ext === t)) {
        return 'audio';
    }
    return null; // don't transcode unknown types
}

/**
 * Upload an asset directly from the local tmp storage to GridFS.
 * Will transcode audio/video on the fly.
 */
exports.uploadFile = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const gfs = getGFS();
        const originalFile = req.file;
        const target = getTranscodeTarget(originalFile.mimetype, originalFile.originalname);

        let fileToUploadPath = originalFile.path;
        let outMime = originalFile.mimetype;
        let outFilename = originalFile.filename;
        let requiresCleanup = [originalFile.path]; // array of local temp files to delete

        // 1. Transcode if needed
        if (target) {
            const outExt = target === 'video' ? '.mp4' : '.mp3';
            outMime = target === 'video' ? 'video/mp4' : 'audio/mpeg';
            outFilename = path.parse(originalFile.filename).name + outExt;
            fileToUploadPath = path.join(os.tmpdir(), `dh-out-${path.parse(originalFile.filename).name}${outExt}`);
            requiresCleanup.push(fileToUploadPath);

            logger.info(`Transcoding ${target} from ${originalFile.mimetype} to ${outMime}...`);

            await new Promise((resolve, reject) => {
                const cmd = ffmpeg(originalFile.path).on('error', reject).on('end', resolve);

                if (target === 'video') {
                    cmd
                        .videoCodec('libx264')
                        .audioCodec('aac')
                        .outputOptions(['-crf 28', '-preset fast', '-movflags +faststart'])
                        .format('mp4');
                } else {
                    cmd
                        .audioCodec('libmp3lame')
                        .audioBitrate('128k')
                        .format('mp3');
                }

                cmd.save(fileToUploadPath);
            });
            logger.info('Transcoding completed successfully.');
        }

        // 2. Upload the final local file directly into GridFS
        const newId = new mongoose.Types.ObjectId();
        await new Promise((resolve, reject) => {
            const uploadStream = gfs.openUploadStreamWithId(newId, outFilename, {
                contentType: outMime
            });
            const readStream = fs.createReadStream(fileToUploadPath);
            readStream.pipe(uploadStream);
            uploadStream.on('finish', resolve);
            uploadStream.on('error', reject);
            readStream.on('error', reject);
        });

        // 3. Cleanup local temp files
        requiresCleanup.forEach(f => {
            if (fs.existsSync(f)) fs.unlink(f, () => { });
        });

        // 4. Respond
        res.status(201).json({
            message: 'File uploaded and processed successfully',
            fileId: newId,
            filename: outFilename,
            contentType: outMime
        });

    } catch (error) {
        logger.error(`Upload/Transcode error: ${error.message}`);

        // Attempt cleanup on failure
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlink(req.file.path, () => { });
        }

        const err = new Error('File upload and processing failed');
        err.statusCode = 500;
        next(err);
    }
};

/** Stream a file from GridFS (public) */
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
        res.set('Accept-Ranges', 'bytes');

        const readStream = gfs.openDownloadStream(file._id);
        readStream.pipe(res);

        readStream.on('error', (err) => {
            logger.error(`Read Stream Error: ${err.message}`);
            if (!res.headersSent) {
                res.status(500).json({ message: 'Error streaming file' });
            }
        });
    } catch (error) {
        next(error);
    }
};

/** Delete a file from GridFS (admin only) */
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
