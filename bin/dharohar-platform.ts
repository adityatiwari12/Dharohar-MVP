#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DharoharPlatformStack } from '../lib/dharohar-platform-stack';

const app = new cdk.App();

new DharoharPlatformStack(app, 'DharoharPlatformStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: 'Dharohar Heritage Platform - Core Infrastructure Stack',
});

// Add tags to all resources
cdk.Tags.of(app).add('Project', 'Dharohar');
cdk.Tags.of(app).add('Environment', process.env.NODE_ENV || 'development');
cdk.Tags.of(app).add('Owner', 'DharoharTeam');