import { createDynamoDBStore } from './dynamodb.mjs';
import { createService } from './service.mjs';

let service;
export async function handler(event) {
  const headers = Object.fromEntries(Object.entries(event.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v]));
  const responseHeaders = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
  if (process.env.ALLOWED_ORIGIN && headers.origin === process.env.ALLOWED_ORIGIN)
    Object.assign(responseHeaders, { 'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN, 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', Vary: 'Origin' });
  const method = event.requestContext?.http?.method ?? event.httpMethod;
  if (method === 'OPTIONS') return { statusCode: 204, headers: responseHeaders, body: '' };
  let body = {};
  try {
    const raw = event.isBase64Encoded ? Buffer.from(event.body ?? '', 'base64').toString('utf8') : (event.body ?? '');
    if (Buffer.byteLength(raw) > 49152) return { statusCode: 413, headers: responseHeaders, body: JSON.stringify({ error: 'Request is too large.', code: 'INVALID_INPUT' }) };
    body = raw ? JSON.parse(raw) : {};
  } catch { return { statusCode: 400, headers: responseHeaders, body: JSON.stringify({ error: 'Invalid JSON request.', code: 'INVALID_INPUT' }) }; }
  service ??= createService(createDynamoDBStore());
  const result = await service({ method, path: event.rawPath ?? event.path, headers, body });
  return { statusCode: result.status, headers: responseHeaders, body: JSON.stringify(result.body) };
}
