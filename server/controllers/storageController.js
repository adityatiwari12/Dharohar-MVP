const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const logger = require('../utils/logger');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const s3 = new S3Client({ region: process.env.AWS_REGION || 'ap-south-1' });
const BUCKET_NAME = process.env.MEDIA_BUCKET || 'dharohar-media'; // Set in .env

// ── Helpers ──────────────────────────────────────────────────────────────────

function getTranscodeTarget(mimetype, originalname) {
    const ext = path.extname(originalname).toLowerCase();
    const videoTypes = ['video/', '.webm', '.mkv', '.avi', '.mov', '.mp4'];
    const audioTypes = ['audio/', '.wav', '.ogg', '.flac', '.aac', '.webm'];

    if (videoTypes.some(t => mimetype.startsWith(t) || ext === t)) {
        if (mimetype.startsWith('audio/')) return 'audio';
        return 'video';
    }
    if (audioTypes.some(t => mimetype.startsWith(t) || ext === t)) {
        return 'audio';
    }
    return null;
}

/**
 * Upload an asset directly to S3.
 * Will transcode audio/video on the fly locally before uploading.
 */
exports.uploadFile = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const originalFile = req.file;
        const target = getTranscodeTarget(originalFile.mimetype, originalFile.originalname);

        let fileToUploadPath = originalFile.path;
        let outMime = originalFile.mimetype;
        const newId = uuidv4();
        let outFilename = `${newId}-${originalFile.originalname}`;
        let requiresCleanup = [originalFile.path];

        // 1. Transcode if needed
        if (target) {
            const outExt = target === 'video' ? '.mp4' : '.mp3';
            outMime = target === 'video' ? 'video/mp4' : 'audio/mpeg';
            outFilename = `${newId}${outExt}`;
            fileToUploadPath = path.join(os.tmpdir(), `dh-out-${newId}${outExt}`);
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

        // 2. Upload the final file to S3
        const fileStream = fs.createReadStream(fileToUploadPath);

        await s3.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: outFilename,
            Body: fileStream,
            ContentType: outMime
        }));

        // 3. Cleanup local temp files
        requiresCleanup.forEach(f => {
            if (fs.existsSync(f)) fs.unlink(f, () => { });
        });

        // 4. Respond
        // We return newId as fileId. The db saves it as a string instead of ObjectId now.
        res.status(201).json({
            message: 'File uploaded and processed successfully',
            fileId: outFilename,
            filename: outFilename,
            contentType: outMime
        });

    } catch (error) {
        logger.error(`Upload/Transcode/S3 error: ${error.message}`);
        if (req.file && fs.existsSync(req.file.path)) fs.unlink(req.file.path, () => { });

        const err = new Error('File upload to S3 failed');
        err.statusCode = 500;
        next(err);
    }
};

/** Get a pre-signed URL to view the file or proxy it */
exports.getFile = async (req, res, next) => {
    try {
        const fileId = req.params.id;

        // Mobile / Frontend expects to GET /storage/:id and receive the file.
        // Option 1: Generate a pre-signed URL and redirect.
        // Option 2: Proxy the S3 stream.
        // Redirecting to pre-signed URL is much more efficient and allows S3 to handle range requests directly!

        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileId
        });

        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

        // 302 Redirect to the S3 URL where Range headers are fully supported natively
        return res.redirect(302, signedUrl);

    } catch (error) {
        next(error);
    }
};

/** Delete a file from S3 (admin only) */
exports.deleteFile = async (req, res, next) => {
    try {
        const fileId = req.params.id;

        await s3.send(new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileId
        }));

        res.status(200).json({ message: 'File deleted from S3 successfully' });
    } catch (error) {
        next(error);
    }
};
