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
    const ASSETS_TABLE = process.env.ASSETS_TABLE;

    try {
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event;

        const timestamp = new Date().toISOString();
        const passportId = `DHAR-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        const transactionId = crypto.randomUUID();

        // 1. Record immutable transaction in Ledger
        await ddbDocClient.send(new PutCommand({
            TableName: LEDGER_TABLE,
            Item: {
                passportId: passportId,
                transactionId: transactionId,
                timestamp: timestamp,
                assetId: body.assetId,
                creatorId: body.creatorId || 'unknown',
                action: 'ISSUE_CERTIFICATE',
                status: 'CERTIFIED',
                hash: crypto.createHash('sha256').update(JSON.stringify(body) + timestamp).digest('hex')
            }
        }));

        // 2. Publish Notification Event
        if (NOTIFICATION_TOPIC_ARN) {
            await snsClient.send(new PublishCommand({
                TopicArn: NOTIFICATION_TOPIC_ARN,
                Message: JSON.stringify({
                    passportId,
                    assetId: body.assetId,
                    action: 'ISSUE_CERTIFICATE',
                    timestamp
                }),
                Subject: `Certification Contract: Issued Passport ${passportId}`
            }));
        }

        // 3. Update active asset state
        if (ASSETS_TABLE && body.assetId) {
            await ddbDocClient.send(new UpdateCommand({
                TableName: ASSETS_TABLE,
                Key: { id: body.assetId },
                UpdateExpression: "set isCertified = :cert, passportId = :p, updatedAt = :t, smartContractId = :c",
                ExpressionAttributeValues: {
                    ":cert": true,
                    ":p": passportId,
                    ":t": timestamp,
                    ":c": transactionId
                }
            }));
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Certification Smart Contract Executed',
                passportId,
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
