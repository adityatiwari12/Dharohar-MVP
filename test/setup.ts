// Test setup file
import { config } from 'dotenv';

// Load environment variables for testing
config({ path: '.env.test' });

// Set default test environment variables
process.env.AWS_REGION = process.env.AWS_REGION || 'us-east-1';
process.env.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || 'test';
process.env.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || 'test';
process.env.AWS_ENDPOINT_URL = process.env.AWS_ENDPOINT_URL || 'http://localhost:4566';

// Mock AWS SDK for unit tests
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/client-lambda');
jest.mock('@aws-sdk/client-bedrock');
jest.mock('@aws-sdk/client-rekognition');
jest.mock('@aws-sdk/client-qldb');

// Global test timeout
jest.setTimeout(30000);