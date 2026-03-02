require('dotenv').config();
const mongoose = require('mongoose');

const checkDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to ' + conn.connection.name);

        const db = conn.connection.db;

        // 1. Check schemas/collections
        const collections = await db.listCollections().toArray();
        console.log('✅ Found collections: ' + collections.map(c => c.name).join(', '));

        // 2. Check Assets
        const totalAssets = await db.collection('assets').countDocuments();
        const assetsWithMedia = await db.collection('assets').countDocuments({ mediaFileId: { $ne: null } });
        console.log('✅ Collection assets: ' + totalAssets + ' total records.');
        console.log('✅ Collection assets: ' + assetsWithMedia + ' records with a mediaFileId.');

        // 3. Check GridFS
        const gfsFiles = await db.collection('uploads.files').countDocuments();
        const gfsChunks = await db.collection('uploads.chunks').countDocuments();
        console.log('✅ GridFS uploads: ' + gfsFiles + ' total files stored.');
        console.log('✅ GridFS uploads: ' + gfsChunks + ' total binary chunks stored.');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

checkDB();
