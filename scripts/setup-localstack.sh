#!/bin/bash

# Setup script for LocalStack development environment
echo "Setting up Dharohar LocalStack environment..."

# Set LocalStack endpoint
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

# Wait for LocalStack to be ready
echo "Waiting for LocalStack to be ready..."
until curl -s http://localhost:4566/_localstack/health | grep -q '"s3": "available"'; do
  echo "Waiting for LocalStack services..."
  sleep 2
done

echo "LocalStack is ready! Setting up AWS resources..."

# Create S3 bucket
echo "Creating S3 bucket..."
aws --endpoint-url=http://localhost:4566 s3 mb s3://dharohar-media-000000000000-us-east-1

# Enable S3 CORS
aws --endpoint-url=http://localhost:4566 s3api put-bucket-cors \
  --bucket dharohar-media-000000000000-us-east-1 \
  --cors-configuration '{
    "CORSRules": [
      {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
        "AllowedOrigins": ["*"],
        "MaxAgeSeconds": 3000
      }
    ]
  }'

# Create DynamoDB tables
echo "Creating DynamoDB tables..."

# Assets table
aws --endpoint-url=http://localhost:4566 dynamodb create-table \
  --table-name dharohar-assets \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=type,AttributeType=S \
    AttributeName=creatorId,AttributeType=S \
    AttributeName=timestamp,AttributeType=S \
    AttributeName=region,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
    AttributeName=type,KeyType=RANGE \
  --global-secondary-indexes \
    'IndexName=CreatorIndex,KeySchema=[{AttributeName=creatorId,KeyType=HASH},{AttributeName=timestamp,KeyType=RANGE}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}' \
    'IndexName=RegionIndex,KeySchema=[{AttributeName=region,KeyType=HASH},{AttributeName=timestamp,KeyType=RANGE}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}' \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

# Creators table
aws --endpoint-url=http://localhost:4566 dynamodb create-table \
  --table-name dharohar-creators \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=community,AttributeType=S \
    AttributeName=region,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    'IndexName=CommunityIndex,KeySchema=[{AttributeName=community,KeyType=HASH},{AttributeName=region,KeyType=RANGE}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}' \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

# Create Cognito User Pool
echo "Creating Cognito User Pool..."
USER_POOL_ID=$(aws --endpoint-url=http://localhost:4566 cognito-idp create-user-pool \
  --pool-name dharohar-users \
  --policies '{
    "PasswordPolicy": {
      "MinimumLength": 8,
      "RequireUppercase": true,
      "RequireLowercase": true,
      "RequireNumbers": true,
      "RequireSymbols": false
    }
  }' \
  --auto-verified-attributes email phone_number \
  --alias-attributes email phone_number \
  --schema '[
    {
      "Name": "email",
      "AttributeDataType": "String",
      "Required": true,
      "Mutable": true
    },
    {
      "Name": "phone_number",
      "AttributeDataType": "String",
      "Required": false,
      "Mutable": true
    },
    {
      "Name": "given_name",
      "AttributeDataType": "String",
      "Required": true,
      "Mutable": true
    },
    {
      "Name": "family_name",
      "AttributeDataType": "String",
      "Required": true,
      "Mutable": true
    },
    {
      "Name": "custom:role",
      "AttributeDataType": "String",
      "Required": false,
      "Mutable": true
    },
    {
      "Name": "custom:community",
      "AttributeDataType": "String",
      "Required": false,
      "Mutable": true
    }
  ]' \
  --query 'UserPool.Id' --output text)

echo "User Pool ID: $USER_POOL_ID"

# Create User Pool Client
USER_POOL_CLIENT_ID=$(aws --endpoint-url=http://localhost:4566 cognito-idp create-user-pool-client \
  --user-pool-id $USER_POOL_ID \
  --client-name dharohar-client \
  --generate-secret false \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_USER_SRP_AUTH ALLOW_CUSTOM_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --supported-identity-providers COGNITO \
  --query 'UserPoolClient.ClientId' --output text)

echo "User Pool Client ID: $USER_POOL_CLIENT_ID"

# Create Identity Pool
IDENTITY_POOL_ID=$(aws --endpoint-url=http://localhost:4566 cognito-identity create-identity-pool \
  --identity-pool-name dharohar_identity_pool \
  --allow-unauthenticated-identities false \
  --cognito-identity-providers ProviderName=cognito-idp.us-east-1.amazonaws.com/$USER_POOL_ID,ClientId=$USER_POOL_CLIENT_ID \
  --query 'IdentityPoolId' --output text)

echo "Identity Pool ID: $IDENTITY_POOL_ID"

# Create QLDB Ledger
echo "Creating QLDB Ledger..."
aws --endpoint-url=http://localhost:4566 qldb create-ledger \
  --name dharohar-sovereignty \
  --permissions-mode STANDARD \
  --deletion-protection false

echo "LocalStack setup complete!"
echo ""
echo "Environment variables for your .env file:"
echo "AWS_ENDPOINT_URL=http://localhost:4566"
echo "AWS_REGION=us-east-1"
echo "AWS_ACCESS_KEY_ID=test"
echo "AWS_SECRET_ACCESS_KEY=test"
echo "USER_POOL_ID=$USER_POOL_ID"
echo "USER_POOL_CLIENT_ID=$USER_POOL_CLIENT_ID"
echo "IDENTITY_POOL_ID=$IDENTITY_POOL_ID"
echo "S3_BUCKET=dharohar-media-000000000000-us-east-1"
echo ""
echo "DynamoDB Admin UI: http://localhost:8001"
echo "LocalStack Dashboard: http://localhost:4566/_localstack/health"