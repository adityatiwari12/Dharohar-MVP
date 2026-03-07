import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import * as crypto from 'crypto';

const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const snsClient = new SNSClient({});

export const handler = async (event: any, context: any) => {
    console.log('Event:', JSON.stringify(event));

    const LEDGER_TABLE = process.env.LEDGER_TABLE;
    const NOTIFICATION_TOPIC_ARN = process.env.NOTIFICATION_TOPIC_ARN;
    const LICENSES_TABLE = process.env.LICENSES_TABLE;

    try {
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event;
        const action = body.action || 'REQUEST'; // or APPROVE

        const timestamp = new Date().toISOString();
        const transactionId = crypto.randomUUID();

        // 1. Record immutable transaction in Ledger
        await ddbDocClient.send(new PutCommand({
            TableName: LEDGER_TABLE,
            Item: {
                contractId: transactionId,
                timestamp: timestamp,
                assetId: body.assetId,
                licensee: body.licensee,
                action: action,
                amountPaid: body.amountPaid || 0,
                status: action === 'APPROVE' ? 'APPROVED' : 'PENDING',
                hash: crypto.createHash('sha256').update(JSON.stringify(body) + timestamp).digest('hex')
            }
        }));

        // 2. Publish Notification Event
        if (NOTIFICATION_TOPIC_ARN) {
            await snsClient.send(new PublishCommand({
                TopicArn: NOTIFICATION_TOPIC_ARN,
                Message: JSON.stringify({
                    transactionId,
                    assetId: body.assetId,
                    action,
                    timestamp
                }),
                Subject: `License Contract Update: ${action}`
            }));
        }

        // 3. Update active states if APPROVE
        if (action === 'APPROVE' && LICENSES_TABLE && body.licenseId) {
            await ddbDocClient.send(new UpdateCommand({
                TableName: LICENSES_TABLE,
                Key: { licenseId: body.licenseId },
                UpdateExpression: "set #status = :s, updatedAt = :t, smartContractId = :c",
                ExpressionAttributeNames: { "#status": "status" },
                ExpressionAttributeValues: {
                    ":s": "APPROVED",
                    ":t": timestamp,
                    ":c": transactionId
                }
            }));
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Smart Contract Executed',
                transactionId,
                ledgerStatus: 'COMMITTED'
            }),
        };
    } catch (error: any) {
        console.error('Contract Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
