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
 * Transcode a GridFS stream to a standard format and re-save to GridFS.
 * Returns the new GridFS document id.
 */
async function transcodeAndReplace(gfs, originalFile) {
    const target = getTranscodeTarget(originalFile.contentType, originalFile.filename);
    if (!target) {
        logger.info(`Skipping transcode for ${originalFile.filename} — unknown type`);
        return originalFile._id;
    }

    const tmpIn = path.join(os.tmpdir(), `dh-in-${originalFile._id}`);
    const outExt = target === 'video' ? '.mp4' : '.mp3';
    const tmpOut = path.join(os.tmpdir(), `dh-out-${originalFile._id}${outExt}`);
    const outMime = target === 'video' ? 'video/mp4' : 'audio/mpeg';
    const outFilename = path.parse(originalFile.filename).name + outExt;

    // 1. Download original from GridFS to a temp file
    await new Promise((resolve, reject) => {
        const readStream = gfs.openDownloadStream(originalFile._id);
        const writeStream = fs.createWriteStream(tmpIn);
        readStream.pipe(writeStream);
        writeStream.on('finish', resolve);
        readStream.on('error', reject);
        writeStream.on('error', reject);
    });

    // 2. Transcode with ffmpeg
    await new Promise((resolve, reject) => {
        const cmd = ffmpeg(tmpIn).on('error', reject).on('end', resolve);

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

        cmd.save(tmpOut);
    });

    // 3. Upload transcoded file back to GridFS
    const newId = new mongoose.Types.ObjectId();
    await new Promise((resolve, reject) => {
        const uploadStream = gfs.openUploadStreamWithId(newId, outFilename, {
            contentType: outMime
        });
        const readStream = fs.createReadStream(tmpOut);
        readStream.pipe(uploadStream);
        uploadStream.on('finish', resolve);
        uploadStream.on('error', reject);
        readStream.on('error', reject);
    });

    // 4. Delete original from GridFS
    try { await gfs.delete(originalFile._id); } catch (e) {
        logger.warn(`Could not delete original GridFS file ${originalFile._id}: ${e.message}`);
    }

    // 5. Cleanup temp files
    [tmpIn, tmpOut].forEach(f => fs.unlink(f, () => { }));

    logger.info(`Transcoded ${originalFile.filename} → ${outFilename}`);
    return newId;
}

// ── Route Handlers ────────────────────────────────────────────────────────────

/** Upload + optional transcode */
exports.uploadFile = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const gfs = getGFS();
        const files = await gfs.find({ _id: req.file.id }).toArray();

        let finalId = req.file.id;

        if (files && files.length > 0) {
            finalId = await transcodeAndReplace(gfs, files[0]);
        }

        res.status(201).json({
            message: 'File uploaded and processed successfully',
            fileId: finalId,
            filename: req.file.filename,
            contentType: req.file.contentType
        });
    } catch (error) {
        logger.error(`Transcode error: ${error.message}`);
        // Fallback — return original file without transcoding
        res.status(201).json({
            message: 'File uploaded (transcoding failed, raw file stored)',
            fileId: req.file.id,
            filename: req.file.filename,
            contentType: req.file.contentType
        });
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
