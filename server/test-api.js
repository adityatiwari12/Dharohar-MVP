const http = require('http');

const runTest = async (name, url, expectedStatus = [200, 206]) => {
    return new Promise((resolve) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const statusStr = expectedStatus.includes(res.statusCode) ? '✅ [PASS]' : '❌ [FAIL]';
                console.log(`${statusStr} ${name} - Status ${res.statusCode}`);
                if (!expectedStatus.includes(res.statusCode)) {
                    console.error(`   Response snippet: ${data.substring(0, 200)}`);
                }

                let json = null;
                try {
                    json = JSON.parse(data);
                } catch (e) { }

                resolve({ status: res.statusCode, json, headers: res.headers });
            });
        }).on('error', err => {
            console.error(`❌ [ERROR] ${name} - Request failed: ${err.message}`);
            resolve(null);
        });
    });
};

const runStorageTest = async (name, url) => {
    return new Promise((resolve) => {
        http.get(url, (res) => {
            const statusStr = [200, 206].includes(res.statusCode) ? '✅ [PASS]' : '❌ [FAIL]';
            console.log(`${statusStr} ${name} - Status ${res.statusCode} (Content-Type: ${res.headers['content-type']})`);
            res.resume(); // discard binary data
            resolve(true);
        }).on('error', err => {
            console.error(`❌ [ERROR] ${name} - Request failed: ${err.message}`);
            resolve(false);
        });
    });
};

const runAllTests = async () => {
    console.log('--- Starting API Tests ---');

    // 1. Test public assets
    const assetsRes = await runTest('Get Public Assets (Default)', 'http://localhost:5000/assets/public', [200]);

    if (assetsRes && assetsRes.json && assetsRes.json.assets) {
        console.log(`   -> Found ${assetsRes.json.assets.length} assets.`);
        console.log(`   -> Total: ${assetsRes.json.total}, Page: ${assetsRes.json.page}, HasMore: ${assetsRes.json.hasMore}`);

        // 2. Test pagination specifically
        if (assetsRes.json.assets.length > 0) {
            await runTest('Get Public Assets (Page 1, Limit 2)', 'http://localhost:5000/assets/public?page=1&limit=2', [200]);
        }

        // 3. Test Storage URL
        const assetWithMedia = assetsRes.json.assets.find(a => a.mediaUrl);
        if (assetWithMedia) {
            console.log(`   -> Testing media retrieval for asset: ${assetWithMedia.title}`);
            console.log(`   -> URL: ${assetWithMedia.mediaUrl}`);
            const storageUrl = 'http://localhost:5000' + assetWithMedia.mediaUrl;
            await runStorageTest('Get Storage Media File', storageUrl);
        } else {
            console.log('   -> No assets with mediaUrl found to test storage route.');
        }
    }

    console.log('--- Tests Completed ---');
};

runAllTests();
