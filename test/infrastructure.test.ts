import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DharoharPlatformStack } from '../lib/dharohar-platform-stack';

describe('Dharohar Platform Infrastructure', () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    const stack = new DharoharPlatformStack(app, 'TestStack');
    template = Template.fromStack(stack);
  });

  test('Creates S3 bucket for media storage', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      VersioningConfiguration: {
        Status: 'Enabled'
      },
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          {
            ServerSideEncryptionByDefault: {
              SSEAlgorithm: 'AES256'
            }
          }
        ]
      }
    });
  });

  test('Creates DynamoDB tables with correct configuration', () => {
    // Assets table
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'dharohar-assets',
      KeySchema: [
        {
          AttributeName: 'id',
          KeyType: 'HASH'
        },
        {
          AttributeName: 'type',
          KeyType: 'RANGE'
        }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    });

    // Creators table
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'dharohar-creators',
      KeySchema: [
        {
          AttributeName: 'id',
          KeyType: 'HASH'
        }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    });
  });

  test('Creates Cognito User Pool with correct configuration', () => {
    template.hasResourceProperties('AWS::Cognito::UserPool', {
      UserPoolName: 'dharohar-users',
      AutoVerifiedAttributes: ['email', 'phone_number'],
      UsernameAttributes: ['email', 'phone_number'],
      Policies: {
        PasswordPolicy: {
          MinimumLength: 8,
          RequireLowercase: true,
          RequireNumbers: true,
          RequireSymbols: false,
          RequireUppercase: true
        }
      }
    });
  });

  test('Creates API Gateway with CORS configuration', () => {
    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Name: 'Dharohar Platform API',
      Description: 'API for Dharohar Heritage Platform'
    });
  });

  test('Creates QLDB Ledger for legal records', () => {
    template.hasResourceProperties('AWS::QLDB::Ledger', {
      Name: 'dharohar-sovereignty',
      PermissionsMode: 'STANDARD',
      DeletionProtection: true
    });
  });

  test('Creates IAM roles with appropriate permissions', () => {
    // Lambda execution role
    template.hasResourceProperties('AWS::IAM::Role', {
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Effect: 'Allow',
            Principal: {
              Service: 'lambda.amazonaws.com'
            }
          }
        ]
      }
    });

    // Authenticated user role
    template.hasResourceProperties('AWS::IAM::Role', {
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Action: 'sts:AssumeRoleWithWebIdentity',
            Effect: 'Allow',
            Principal: {
              Federated: 'cognito-identity.amazonaws.com'
            }
          }
        ]
      }
    });
  });

  test('Outputs all required values', () => {
    template.hasOutput('MediaBucketName', {});
    template.hasOutput('AssetsTableName', {});
    template.hasOutput('CreatorsTableName', {});
    template.hasOutput('UserPoolId', {});
    template.hasOutput('UserPoolClientId', {});
    template.hasOutput('IdentityPoolId', {});
    template.hasOutput('ApiGatewayUrl', {});
    template.hasOutput('SovereigntyLedgerName', {});
  });
});