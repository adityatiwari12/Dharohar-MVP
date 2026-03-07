# Dharohar — Smart Contracts Implementation Guide

## User Roles

| Role | Cognito Group | Action |
|---|---|---|
| `COMMUNITY_USER` | `community-users` | Uploads assets, receives 80% payment |
| `REVIEWER` | `reviewers` | Reviews uploaded assets, approves to marketplace or rejects |
| `GENERAL` | `general-users` | Browses marketplace, applies for licenses |
| `ADMIN` | `admins` | Accepts, rejects, or requests modification on license applications |

---

## Project Paths

All Lambda code goes inside `SONIC/backend/lambdas/`.
CDK stack file is `SONIC/lib/dharohar-mvp-stack.ts`.

```
SONIC/
├── backend/
│   └── lambdas/
│       ├── bio-processor/           ← already exists
│       ├── transcribe-processor/    ← already exists
│       ├── ai-extractor/            ← already exists
│       ├── license-contract/        ← CREATE THIS
│       │   ├── index.ts
│       │   └── qldb-helper.ts
│       ├── certification-contract/  ← CREATE THIS
│       │   ├── index.ts
│       │   └── qldb-helper.ts
│       └── qldb-setup/              ← CREATE THIS (run once only)
│           └── index.ts
└── lib/
    └── dharohar-mvp-stack.ts        ← UPDATE THIS
```

---

## NPM Packages

Run from inside `SONIC/`:

```bash
npm install amazon-qldb-driver-nodejs ion-js razorpay @aws-sdk/client-sns
```

---

## Shared Infrastructure — Add Once to CDK Stack

File: `SONIC/lib/dharohar-mvp-stack.ts`

**Add imports:**
```typescript
import * as qldb from 'aws-cdk-lib/aws-qldb';
import * as sns  from 'aws-cdk-lib/aws-sns';
```

**Add inside constructor after existing resources:**
```typescript
// QLDB Ledger
const ledger = new qldb.CfnLedger(this, 'DharoharLedger', {
  name:               'dharohar-ledger',
  permissionsMode:    'STANDARD',
  deletionProtection: false,
});

// SNS Topic
const notificationTopic = new sns.Topic(this, 'NotificationTopic', {
  topicName: 'dharohar-notifications',
});

new cdk.CfnOutput(this, 'NotificationTopicArn', { value: notificationTopic.topicArn });
```

---

## Contract 1 — License Contract

### Full Asset & License Flow

```
COMMUNITY_USER uploads asset
        ↓
asset.status = PENDING_REVIEW
        ↓
REVIEWER calls POST /review/approve or /review/reject
  (APPROVED) → asset.status = MARKETPLACE
               asset visible to GENERAL users
  (REJECTED) → asset.status = REJECTED
               SNS to COMMUNITY_USER with reason
        ↓
GENERAL browses marketplace, calls POST /license/request
  → asset.licenseStatus = LICENSE_PENDING
  → SNS alert to ADMIN
        ↓
ADMIN calls POST /license/decision
  (ACCEPTED)          → 80/20 split calculated
                      → QLDB record inserted (immutable)
                      → DynamoDB updated
                      → Razorpay payout to COMMUNITY_USER
                      → SNS to COMMUNITY_USER, GENERAL, ADMIN
  (REJECTED)          → QLDB record inserted as REJECTED
                      → Razorpay refund to GENERAL
                      → SNS to GENERAL with reason
  (MODIFICATION)      → asset.licenseStatus = MODIFICATION_REQUESTED
                      → SNS to GENERAL with required changes
                      → GENERAL can resubmit via POST /license/request
```

### DynamoDB Changes

**dharohar-assets** (partitionKey: `assetId`):
```
licenseStatus       = "LICENSE_PENDING" | "LICENSED" | "LICENSE_REJECTED"
licenseContractId   = contractId string
generalUserId             = Cognito sub of general user
licensedAt          = ISO timestamp
updatedAt           = ISO timestamp
```

**dharohar-creators** (partitionKey: `creatorId`):
```
totalEarnings   += creatorAmount   (use ADD expression, never SET)
totalLicenses   += 1               (use ADD expression)
updatedAt        = ISO timestamp
```

### QLDB Record — LicenseContracts table

```json
{
  "contractId":     "LICENSE-{assetId}-{Date.now()}",
  "contractType":   "LICENSE",
  "assetId":        "string",
  "generalUserId":        "string",
  "creatorId":      "string",
  "adminId":        "string",
  "paymentId":      "string — Razorpay payment ID",
  "payoutId":       "string — Razorpay payout ID",
  "totalAmount":    "number",
  "creatorAmount":  "number — totalAmount * 0.80",
  "platformAmount": "number — totalAmount * 0.20",
  "splitPercent":   80,
  "licenseType":    "COMMERCIAL | RESEARCH | EDUCATIONAL",
  "status":         "EXECUTED | REJECTED",
  "executedAt":     "ISO timestamp"
}
```

### API Endpoints

**POST /review/approve** — REVIEWER only
```typescript
// 1. Validate JWT — caller must be in 'reviewers' Cognito group
// 2. Fetch asset — must be status PENDING_REVIEW
// 3. Update dharohar-assets: status=MARKETPLACE, reviewedBy, reviewedAt
// 4. SNS to creatorId: type ASSET_APPROVED, asset now visible on marketplace
```

**POST /review/reject** — REVIEWER only
```typescript
// 1. Validate JWT — caller must be in 'reviewers' Cognito group
// 2. Fetch asset — must be status PENDING_REVIEW
// 3. Update dharohar-assets: status=REJECTED, reviewedBy, reviewNotes
// 4. SNS to creatorId: type ASSET_REJECTED, include reviewNotes
```

Request body (both):
```json
{ "assetId": "string", "notes": "optional reason" }
```

---

**POST /license/request** — GENERAL only
```typescript
// 1. Validate JWT — caller must be in 'general-users' Cognito group
// 2. Fetch asset from DynamoDB — must be status MARKETPLACE
// 3. Verify Razorpay paymentId exists and amount matches
// 4. Set asset.licenseStatus = LICENSE_PENDING in DynamoDB
// 5. Save request record to DynamoDB with generalUserId
// 6. SNS publish: type LICENSE_REQUEST to ADMIN
// 7. Return { success: true, requestId, message }
```

Request body:
```json
{ "assetId": "string", "licenseType": "COMMERCIAL", "amount": 10000, "razorpayPaymentId": "pay_xxx" }
```

**POST /license/decision** — ADMIN only
```typescript
// 1. Validate JWT — caller must be in 'admins' Cognito group
// If decision=ACCEPTED:
//   creatorAmount  = Math.floor(totalAmount * 0.80)
//   platformAmount = Math.floor(totalAmount * 0.20)
//   contractId     = `LICENSE-${assetId}-${Date.now()}`
//   Insert into QLDB LicenseContracts table
//   Update dharohar-assets: licenseStatus=LICENSED, licenseContractId, licensedAt
//   Update dharohar-creators: ADD totalEarnings creatorAmount, ADD totalLicenses 1
//   Razorpay payout to creator (skip if MOCK_PAYMENTS=true)
//   SNS to creatorId:     type PAYMENT_RECEIVED, amount creatorAmount
//   SNS to generalUserId: type LICENSE_ACCEPTED
// If decision=REJECTED:
//   contractId = `LICENSE-${assetId}-${Date.now()}-REJECTED`
//   Insert REJECTED record into QLDB LicenseContracts table
//   Update dharohar-assets: licenseStatus=LICENSE_REJECTED
//   Razorpay refund to general user
//   SNS to generalUserId: type LICENSE_REJECTED, include adminNotes
// If decision=MODIFICATION:
//   Update dharohar-assets: licenseStatus=MODIFICATION_REQUESTED, modificationNotes
//   SNS to generalUserId: type MODIFICATION_REQUESTED, include modificationNotes
//   No QLDB record yet — resubmit via POST /license/request after changes
```

Request body:
```json
{ "requestId": "string", "assetId": "string", "decision": "ACCEPTED | REJECTED | MODIFICATION", "adminNotes": "required for REJECTED and MODIFICATION" }
```

### Reading Cognito Group in Lambda

```typescript
const claims  = event.requestContext?.authorizer?.claims;
const userId  = claims?.sub;
const groups  = claims?.['cognito:groups'] || '';
const isAdmin = groups.includes('admins');
const isBuyer = groups.includes('general-users');

if (!isAdmin) {
  return { statusCode: 403, body: JSON.stringify({ error: 'Admin access required' }) };
}
```

### CDK — License Contract Lambda

```typescript
const licenseContractFn = new nodejs.NodejsFunction(this, 'LicenseContract', {
  functionName: 'dharohar-license-contract',
  runtime:      lambda.Runtime.NODEJS_20_X,
  entry:        path.join(__dirname, '../backend/lambdas/license-contract/index.ts'),
  handler:      'handler',
  timeout:      cdk.Duration.seconds(30),
  memorySize:   256,
  environment: {
    ASSETS_TABLE:        assetsTable.tableName,
    CREATORS_TABLE:      creatorsTable.tableName,
    LEDGER_NAME:         'dharohar-ledger',
    NOTIFICATION_TOPIC:  notificationTopic.topicArn,
    RAZORPAY_KEY_ID:     process.env.RAZORPAY_KEY_ID     || 'mock',
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'mock',
    MOCK_PAYMENTS:       'true',
  },
});
assetsTable.grantReadWriteData(licenseContractFn);
creatorsTable.grantReadWriteData(licenseContractFn);
notificationTopic.grantPublish(licenseContractFn);
licenseContractFn.addToRolePolicy(new iam.PolicyStatement({
  actions:   ['qldb:SendCommand'],
  resources: [`arn:aws:qldb:${this.region}:${this.account}:ledger/dharohar-ledger`],
}));

const licenseResource = api.root.addResource('license');
licenseResource.addResource('request').addMethod('POST',
  new apigateway.LambdaIntegration(licenseContractFn),
  { authorizer, authorizationType: apigateway.AuthorizationType.COGNITO });
licenseResource.addResource('approve').addMethod('POST',
  new apigateway.LambdaIntegration(licenseContractFn),
  { authorizer, authorizationType: apigateway.AuthorizationType.COGNITO });
```

---

## Contract 2 — Certification Contract

### Flow

```
AUTOMATIC: ai-extractor Lambda triggers this when confidenceScore >= 85

MANUAL:    ADMIN calls POST /certification/certify
           for assets where confidenceScore < 85

Both paths:
  → passportId generated: DHAR-{2 letters}{4 digits}  e.g. DHAR-AB1234
  → Record inserted into QLDB CertificationContracts (immutable)
  → dharohar-assets updated in DynamoDB
  → SNS to COMMUNITY_USER: "Knowledge legally protected!"
```

### DynamoDB Changes

**dharohar-assets** (partitionKey: `assetId`):
```
status                  = "CERTIFIED"
passportId              = "DHAR-AB1234"
certificationContractId = contractId string
certifiedAt             = ISO timestamp
certifiedBy             = "AUTO" | adminId
legalWeight             = "PRIOR_ART_ESTABLISHED"
updatedAt               = ISO timestamp
```

### QLDB Record — CertificationContracts table

```json
{
  "contractId":        "CERT-{assetId}-{Date.now()}",
  "contractType":      "CERTIFICATION",
  "assetId":           "string",
  "creatorId":         "string",
  "passportId":        "DHAR-AB1234",
  "confidenceScore":   "number",
  "certifiedBy":       "AUTO | adminId",
  "certificationMode": "AUTOMATIC | MANUAL",
  "status":            "CERTIFIED",
  "legalWeight":       "PRIOR_ART_ESTABLISHED",
  "certifiedAt":       "ISO timestamp",
  "geographicOrigin":  "string — from AI extraction",
  "dialectDetected":   "string — from AI extraction"
}
```

### Passport ID Generation

```typescript
function generatePassportId(): string {
  const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const l1 = L[Math.floor(Math.random() * 26)];
  const l2 = L[Math.floor(Math.random() * 26)];
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `DHAR-${l1}${l2}${digits}`;
}
```

### API Endpoints

**POST /certification/certify** — ADMIN or internal Lambda
```typescript
// If certificationMode=MANUAL:    validate caller in 'admins' Cognito group
// If certificationMode=AUTOMATIC: no JWT check (Lambda-to-Lambda internal call)
// 1. Fetch asset from DynamoDB — must be PROCESSED or NEEDS_EXPERT_REVIEW (routed to REVIEWER)
// 2. Generate passportId and contractId = `CERT-${assetId}-${Date.now()}`
// 3. Insert into QLDB CertificationContracts
// 4. Update dharohar-assets with all certification fields listed above
// 5. SNS to creatorId: type ASSET_CERTIFIED, passportId, contractId
// 6. Return { success: true, contractId, passportId, legalWeight }
```

Request body:
```json
{ "assetId": "string", "certificationMode": "AUTOMATIC | MANUAL" }
```

**GET /certification/passport/{assetId}** — any authenticated user
```typescript
// Read asset from DynamoDB
// Return: passportId, certifiedAt, legalWeight, confidenceScore, contractId
```

### Trigger from ai-extractor

Add at the end of `SONIC/backend/lambdas/ai-extractor/index.ts` after saving to DynamoDB:

```typescript
if (extraction.confidenceScore >= 85) {
  const { LambdaClient, InvokeCommand } = await import('@aws-sdk/client-lambda');
  await new LambdaClient({ region: process.env.AWS_REGION }).send(new InvokeCommand({
    FunctionName:   'dharohar-certification-contract',
    InvocationType: 'Event',
    Payload: Buffer.from(JSON.stringify({
      assetId:           assetId,
      certificationMode: 'AUTOMATIC',
    })),
  }));
}
```

Add to `aiExtractorFn` permissions in CDK:
```typescript
aiExtractorFn.addToRolePolicy(new iam.PolicyStatement({
  actions:   ['lambda:InvokeFunction'],
  resources: [`arn:aws:lambda:${this.region}:${this.account}:function:dharohar-certification-contract`],
}));
```

### CDK — Certification Contract Lambda

```typescript
const certificationContractFn = new nodejs.NodejsFunction(this, 'CertificationContract', {
  functionName: 'dharohar-certification-contract',
  runtime:      lambda.Runtime.NODEJS_20_X,
  entry:        path.join(__dirname, '../backend/lambdas/certification-contract/index.ts'),
  handler:      'handler',
  timeout:      cdk.Duration.seconds(30),
  memorySize:   256,
  environment: {
    ASSETS_TABLE:       assetsTable.tableName,
    LEDGER_NAME:        'dharohar-ledger',
    NOTIFICATION_TOPIC: notificationTopic.topicArn,
  },
});
assetsTable.grantReadWriteData(certificationContractFn);
notificationTopic.grantPublish(certificationContractFn);
certificationContractFn.addToRolePolicy(new iam.PolicyStatement({
  actions:   ['qldb:SendCommand'],
  resources: [`arn:aws:qldb:${this.region}:${this.account}:ledger/dharohar-ledger`],
}));

const certResource = api.root.addResource('certification');
certResource.addResource('certify').addMethod('POST',
  new apigateway.LambdaIntegration(certificationContractFn),
  { authorizer, authorizationType: apigateway.AuthorizationType.COGNITO });
certResource.addResource('passport').addResource('{assetId}').addMethod('GET',
  new apigateway.LambdaIntegration(certificationContractFn),
  { authorizer, authorizationType: apigateway.AuthorizationType.COGNITO });
```

---

## QLDB One-Time Table Setup

File: `SONIC/backend/lambdas/qldb-setup/index.ts`

```typescript
import { QldbDriver, RetryConfig } from 'amazon-qldb-driver-nodejs';
const driver = new QldbDriver('dharohar-ledger', { retryConfig: new RetryConfig(3) });

export const handler = async () => {
  await driver.executeLambda(async (txn) => {
    await txn.execute('CREATE TABLE LicenseContracts');
    await txn.execute('CREATE TABLE CertificationContracts');
    await txn.execute('CREATE INDEX ON LicenseContracts (contractId)');
    await txn.execute('CREATE INDEX ON LicenseContracts (assetId)');
    await txn.execute('CREATE INDEX ON CertificationContracts (contractId)');
    await txn.execute('CREATE INDEX ON CertificationContracts (assetId)');
  });
  return { success: true };
};
```

Add this Lambda to CDK stack:
```typescript
const qldbSetupFn = new nodejs.NodejsFunction(this, 'QldbSetup', {
  functionName: 'dharohar-qldb-setup',
  runtime:      lambda.Runtime.NODEJS_20_X,
  entry:        path.join(__dirname, '../backend/lambdas/qldb-setup/index.ts'),
  handler:      'handler',
  timeout:      cdk.Duration.seconds(30),
  memorySize:   128,
  environment: { LEDGER_NAME: 'dharohar-ledger' },
});
qldbSetupFn.addToRolePolicy(new iam.PolicyStatement({
  actions:   ['qldb:SendCommand'],
  resources: [`arn:aws:qldb:${this.region}:${this.account}:ledger/dharohar-ledger`],
}));
```

Run once after `cdk deploy`:
```bash
aws lambda invoke --function-name dharohar-qldb-setup --region ap-south-1 out.json
type out.json
# Expected: {"success": true}
```

---

## Deployment Order

```bash
cd SONIC
npm install amazon-qldb-driver-nodejs ion-js razorpay @aws-sdk/client-sns
npx tsc --noEmit --skipLibCheck
cdk diff
cdk deploy
aws lambda invoke --function-name dharohar-qldb-setup --region ap-south-1 out.json
```

---

## Common Errors

| Error | Fix |
|---|---|
| `No such table: LicenseContracts` | Run qldb-setup Lambda first |
| `qldb:SendCommand denied` | Add IAM policy in CDK stack |
| `403 on /license/approve` | Add user to `admins` Cognito group |
| `Asset not PROCESSED` | Wait for ai-extractor to complete first |
| `Razorpay Bad Request` | Set `MOCK_PAYMENTS=true` |

---

*Dharohar — Team MLOps 4.0 — AWS Hackathon 2026*
