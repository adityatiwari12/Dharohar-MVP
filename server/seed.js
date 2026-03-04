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

const TEST_PASSWORD = 'Test@1234';

const TEST_USERS = [
    {
        name: 'Community Test User',
        email: 'community@dharohar.dev',
        role: 'community',
        communityName: 'Warli Heritage Council'
    },
    {
        name: 'Reviewer Test User',
        email: 'reviewer@dharohar.dev',
        role: 'review',
        communityName: null
    },
    {
        name: 'Admin Test User',
        email: 'admin@dharohar.dev',
        role: 'admin',
        communityName: null
    },
    {
        name: 'General Test User',
        email: 'general@dharohar.dev',
        role: 'general',
        communityName: null
    }
];

const seed = async () => {
    console.log('\n🌱 DHAROHAR Seed Script\n');

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(TEST_PASSWORD, salt);

        let created = 0;
        let skipped = 0;

        for (const testUser of TEST_USERS) {
            const exists = await User.findOne({ email: testUser.email });
            if (exists) {
                console.log(`⚠️  Skipped  [${testUser.role.padEnd(9)}] ${testUser.email}  (already exists)`);
                skipped++;
                continue;
            }

            await User.create({
                name: testUser.name,
                email: testUser.email,
                passwordHash,
                role: testUser.role,
                communityName: testUser.communityName
            });

            console.log(`✅ Created  [${testUser.role.padEnd(9)}] ${testUser.email}`);
            created++;
        }

        console.log(`\n📋 Done! Created: ${created}, Skipped: ${skipped}`);
        console.log('\n📌 All test users share the same password: Test@1234\n');
        console.log('┌─────────────────────────────────────────────────────┐');
        console.log('│  Role        Email                    Password       │');
        console.log('├─────────────────────────────────────────────────────┤');
        console.log('│  community   community@dharohar.dev   Test@1234      │');
        console.log('│  review      reviewer@dharohar.dev    Test@1234      │');
        console.log('│  admin       admin@dharohar.dev       Test@1234      │');
        console.log('│  general     general@dharohar.dev     Test@1234      │');
        console.log('└─────────────────────────────────────────────────────┘\n');

    } catch (err) {
        console.error('❌ Seed failed:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
};

seed();
