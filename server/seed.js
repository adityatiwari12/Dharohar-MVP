/**
 * DHAROHAR — Seed Script
 * Creates one test user for each role.
 * Run: node seed.js   (from the server/ directory)
 *
 * Test Accounts:
 *   community@dharohar.dev  /  Test@1234   (community role)
 *   reviewer@dharohar.dev   /  Test@1234   (review role)
 *   admin@dharohar.dev      /  Test@1234   (admin role)
 *   general@dharohar.dev    /  Test@1234   (general role)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Asset = require('./models/Asset');
const License = require('./models/License');

const TEST_PASSWORD = 'Test@1234';

const TEST_USERS = [
    { name: 'Community Test User', email: 'community@dharohar.dev', role: 'community', communityName: 'Warli Heritage Council' },
    { name: 'Reviewer Test User', email: 'reviewer@dharohar.dev', role: 'review', communityName: null },
    { name: 'Admin Test User', email: 'admin@dharohar.dev', role: 'admin', communityName: null },
    { name: 'General Test User', email: 'general@dharohar.dev', role: 'general', communityName: null }
];

const seed = async () => {
    console.log('\n🌱 DHAROHAR Seed Script\n');
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(TEST_PASSWORD, salt);

        // 1. Create Users
        const users = [];
        for (const u of TEST_USERS) {
            let user = await User.findOne({ email: u.email });
            if (!user) {
                user = await User.create({ ...u, passwordHash });
                console.log(`✅ Created user: ${u.email}`);
            } else {
                console.log(`⚠️  User exists: ${u.email}`);
            }
            users.push(user);
        }

        const communityUser = users.find(u => u.role === 'community');
        const generalUser = users.find(u => u.role === 'general');

        // 2. Create Sample Assets
        const assetCount = await Asset.countDocuments();
        if (assetCount === 0) {
            const assets = await Asset.insertMany([
                {
                    type: 'BIO',
                    title: 'Warli Medicinal Herb Knowledge',
                    description: 'Traditional use of local herbs for treating fever and inflammation, preserved by the Warli community.',
                    communityName: 'Warli Heritage Council',
                    recordeeName: 'Janaki Bai',
                    riskTier: 'MEDIUM',
                    approvalStatus: 'APPROVED',
                    createdBy: communityUser._id
                },
                {
                    type: 'SONIC',
                    title: 'Tribal Harvest Chant',
                    description: 'A traditional chant performed during the annual harvest festival.',
                    communityName: 'Warli Heritage Council',
                    recordeeName: 'Community Elders',
                    riskTier: 'LOW',
                    approvalStatus: 'PENDING',
                    createdBy: communityUser._id
                }
            ]);
            console.log('✅ Created sample assets');

            // 3. Create Sample License Application
            const approvedAsset = assets.find(a => a.approvalStatus === 'APPROVED');
            const licenseExists = await License.findOne({ assetId: approvedAsset._id });
            if (!licenseExists) {
                await License.create({
                    assetId: approvedAsset._id,
                    applicantId: generalUser._id,
                    licenseType: 'RESEARCH',
                    purpose: 'Documenting indigenous medical practices for a non-profit archival project.',
                    applicantFullName: 'General Test User',
                    applicantEmail: 'general@dharohar.dev',
                    status: 'PENDING'
                });
                console.log('✅ Created sample license application');
            }
        }

        console.log('\n📋 Seeding complete!');
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
};

seed();
