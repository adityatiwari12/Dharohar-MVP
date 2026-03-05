/**
 * Auth service — Cognito auth + DynamoDB user profile storage.
 * Replaces the MongoDB User model usage in the former authService.js.
 */
const {
    CognitoIdentityProviderClient,
    SignUpCommand,
    AdminConfirmSignUpCommand,
    InitiateAuthCommand
} = require('@aws-sdk/client-cognito-identity-provider');
const userDynamoService = require('./userDynamoService');

// Initialize Cognito Client
const cognito = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION || 'ap-south-1'
});

const register = async (userData) => {
    // Guard: ensure body was parsed correctly
    if (!userData || !userData.email || !userData.password || !userData.name) {
        const error = new Error('name, email and password are required');
        error.statusCode = 400;
        throw error;
    }

    // 1. Check if user already has a profile in DynamoDB
    const existingUser = await userDynamoService.findByEmail(userData.email);
    if (existingUser) {
        const error = new Error('User already exists');
        error.statusCode = 400;
        throw error;
    }

    // 2. Register user in AWS Cognito
    try {
        const signUpParams = {
            ClientId: process.env.COGNITO_CLIENT_ID,
            Username: userData.email,
            Password: userData.password,
            UserAttributes: [
                { Name: 'email', Value: userData.email },
                { Name: 'name', Value: userData.name || 'Unknown' }
            ]
        };
        await cognito.send(new SignUpCommand(signUpParams));

        // Auto-confirm so users don't need a verification code in this MVP
        if (process.env.COGNITO_USER_POOL_ID) {
            await cognito.send(new AdminConfirmSignUpCommand({
                UserPoolId: process.env.COGNITO_USER_POOL_ID,
                Username: userData.email
            }));
        }
    } catch (err) {
        const error = new Error(`Cognito Registration Failed: ${err.message}`);
        error.statusCode = 400;
        throw error;
    }

    // 3. Save user profile in DynamoDB (Cognito manages the password)
    const user = await userDynamoService.createUser({
        name: userData.name,
        email: userData.email,
        role: userData.role || 'community',
        communityName: userData.communityName
    });

    return { id: user.id, email: user.email, role: user.role };
};

const login = async (email, password) => {
    try {
        // 1. Authenticate with Cognito
        const response = await cognito.send(new InitiateAuthCommand({
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: process.env.COGNITO_CLIENT_ID,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        }));
        const token = response.AuthenticationResult.IdToken;

        // 2. Lookup user profile in DynamoDB
        const user = await userDynamoService.findByEmail(email);
        if (!user) {
            const error = new Error('User profile not found in database');
            error.statusCode = 404;
            throw error;
        }

        return { token, user: { id: user.id, role: user.role, name: user.name } };

    } catch (err) {
        if (err.name === 'NotAuthorizedException' || err.name === 'UserNotFoundException') {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }
        throw err;
    }
};

module.exports = { register, login };
