/**
 * Auth middleware — Cognito JWT verification + DynamoDB user lookup.
 * Replaces the MongoDB User.findOne() call with userDynamoService.findByEmail().
 */
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const userDynamoService = require('../services/userDynamoService');
const roleGuard = require('./roleGuard');

// Setup Cognito JWT Verifier (auto-handles JWKS downloading and caching)
const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USER_POOL_ID || 'ap-south-1_xxxxxxxxx',
    tokenUse: 'id',
    clientId: process.env.COGNITO_CLIENT_ID || 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
});

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authorization token missing or invalid format' });
        }

        const token = authHeader.split(' ')[1];

        // 1. Verify token with Cognito
        let payload;
        try {
            payload = await verifier.verify(token);
        } catch (verifyErr) {
            return res.status(401).json({ error: 'Token verification failed or expired: ' + verifyErr.message });
        }

        // 2. Find user profile in DynamoDB using the email from the Cognito token
        const email = payload.email || payload['cognito:username'];
        if (!email) {
            return res.status(401).json({ error: 'Invalid token payload: missing email' });
        }

        const user = await userDynamoService.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'User profile not found in database' });
        }

        // 3. Attach user profile to request (roles and id now come from DynamoDB)
        req.user = {
            id: user.id,
            role: user.role,
            communityName: user.communityName,
            email: user.email,
            name: user.name
        };

        next();
    } catch (error) {
        return res.status(500).json({ error: 'Internal auth processing error' });
    }
};

module.exports = { protect, roleGuard };
