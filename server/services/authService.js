const User = require('../models/User');
const { CognitoIdentityProviderClient, SignUpCommand, AdminConfirmSignUpCommand, InitiateAuthCommand } = require('@aws-sdk/client-cognito-identity-provider');

// Initialize Cognito Client
const cognito = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION || 'ap-south-1' });

const register = async (userData) => {
    // 1. Check if user exists in MongoDB first
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
        const error = new Error('User already exists');
        error.statusCode = 400;
        throw error;
    }

    try {
        // 2. Register user in AWS Cognito
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

        // Auto-confirm the user so they don't need a verification code for this MVP
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

    // 3. Save User metadata in MongoDB
    // Note: We bypass passwordHash since Cognito handles it.
    // We store a dummy hash just to satisfy MongoDB required constraints, 
    // or remove the required constraint. 
    // To not break existing Mongoose schemas without a migration, we just set a dummy value.
    const user = new User({
        name: userData.name,
        email: userData.email,
        passwordHash: 'cognito_managed',
        role: userData.role || 'community',
        communityName: userData.communityName
    });

    await user.save();
    return { id: user._id, email: user.email, role: user.role };
};

const login = async (email, password) => {
    try {
        // 1. Authenticate with Cognito
        const authParams = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: process.env.COGNITO_CLIENT_ID,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        };

        const response = await cognito.send(new InitiateAuthCommand(authParams));
        const token = response.AuthenticationResult.IdToken;

        // 2. Lookup User in MongoDB
        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error('User profile not found in database');
            error.statusCode = 404;
            throw error;
        }

        // Return the Cognito IdToken. The frontend will use it.
        // Also returning user details matching the previous Express response structure.
        return { token, user: { id: user._id, role: user.role, name: user.name } };

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
