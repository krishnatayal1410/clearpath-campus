import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { DomainError } from '../src/domain.mjs';

export function createDynamoDBStore(tableName = process.env.TABLE_NAME) {
  if (!tableName) throw new Error('TABLE_NAME is required.');
  const client = DynamoDBDocumentClient.from(new DynamoDBClient({}), { marshallOptions: { removeUndefinedValues: true } });
  const get = async (PK, SK) => (await client.send(new GetCommand({ TableName: tableName, Key: { PK, SK }, ConsistentRead: true }))).Item ?? null;
  const put = (Item, extra = {}) => client.send(new PutCommand({ TableName: tableName, Item, ...extra }));
  return {
    kind: 'dynamodb',
    async health() { await get('HEALTH', 'CHECK'); return true; },
    async createWorkspace(workspace, state, expiresAt) { await put({ PK: `WORKSPACE#${workspace}`, SK: 'STATE', state, revision: 1, expiresAt }, { ConditionExpression: 'attribute_not_exists(PK)' }); },
    async getWorkspace(workspace) { return get(`WORKSPACE#${workspace}`, 'STATE'); },
    async putWorkspace(workspace, state, revision, expiresAt) {
      try { await put({ PK: `WORKSPACE#${workspace}`, SK: 'STATE', state, revision: revision + 1, expiresAt }, {
        ConditionExpression: '#revision = :expected', ExpressionAttributeNames: { '#revision': 'revision' }, ExpressionAttributeValues: { ':expected': revision },
      }); } catch (error) {
        if (error.name === 'ConditionalCheckFailedException') throw new DomainError('Workspace changed. Refresh and retry.', 'VERSION_CONFLICT', 409);
        throw error;
      }
    },
    async putSession(tokenHash, session) { await put({ PK: `SESSION#${tokenHash}`, SK: 'SESSION', ...session }, { ConditionExpression: 'attribute_not_exists(PK)' }); },
    async getSession(tokenHash) { return get(`SESSION#${tokenHash}`, 'SESSION'); },
    async deleteSession(tokenHash) { await client.send(new DeleteCommand({ TableName: tableName, Key: { PK: `SESSION#${tokenHash}`, SK: 'SESSION' } })); },
  };
}
