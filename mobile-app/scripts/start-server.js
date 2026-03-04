/**
 * start-server.js
 *
 * Cross-platform helper to launch the Dharohar backend from the mobile-app
 * directory. Changes the working directory to the sibling `server` folder
 * before requiring server.js so that dotenv correctly loads `server/.env`.
 *
 * Directory structure:
 *   Dharohar/
 *     mobile-app/
 *       scripts/          <-- __dirname points here
 *         start-server.js
 *     server/             <-- we need to get here (2 levels up, then /server)
 *       server.js
 *       .env
 */
const path = require('path');

// __dirname = .../Dharohar/mobile-app/scripts
// Two levels up reaches .../Dharohar, then into server/
const serverDir = path.resolve(__dirname, '..', '..', 'server');
console.log('[SERVER-HELPER] Starting server from:', serverDir);
process.chdir(serverDir);
require(path.join(serverDir, 'server.js'));
