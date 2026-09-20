import test from 'node:test';
import assert from 'node:assert/strict';
import * as cedar from '@cedar-policy/cedar-wasm/nodejs';
import { CEDAR_SCHEMA, POLICIES, requestFor, isAllowed } from '../src/policy.mjs';
import { seedState, mutate, findRoute, blockedEdgeIds, DomainError } from '../src/domain.mjs';
import { authorize } from '../server/authorization.mjs';
import { createSQLiteStore } from '../server/sqlite.mjs';
import { createService } from '../server/service.mjs';

const actor = (role, workspace = 'test') => ({ id: `${workspace}:${role}`, role, workspace });
const createPayload = { title: 'Broken paving beside the quad', description: 'A large crack makes the pathway difficult to cross with a wheelchair.', location: 'quad', edgeId: 'quad-health', category: 'Pathway', priority: 'High' };

test('the checked-in Cedar policies validate with zero schema errors', () => {
  const result = cedar.validate({ schema: CEDAR_SCHEMA, policies: POLICIES });
  assert.equal(result.type, 'success'); assert.deepEqual(result.validationErrors, []);
});

test('Cedar denies cross-workspace access, student repair, and self-verification', () => {
  const report = seedState('test').reports[0];
  assert.equal(isAllowed(cedar.isAuthorized(requestFor(actor('student'), 'read', report))), true);
  assert.equal(isAllowed(cedar.isAuthorized(requestFor(actor('facilities', 'other'), 'read', report))), false);
  assert.throws(() => authorize(actor('student'), 'repair', { ...report, status: 'In progress' }), e => e.status === 403);
  const verifier = actor('verifier');
  assert.throws(() => authorize(verifier, 'verify', { ...report, status: 'Awaiting verification', repairedBy: verifier.id }), e => e.status === 403);
  assert.equal(authorize(verifier, 'verify', { ...report, status: 'Awaiting verification', repairedBy: actor('facilities').id }).decision, 'allow');
});

test('a repair remains a routing barrier until independently verified', () => {
  let state = seedState('test'); const reportId = 'CP-1042';
  const original = structuredClone(state);
  state = mutate(state, { type: 'start', id: reportId, version: 1 }, actor('facilities'));
  assert.equal(original.reports[0].status, 'Reported', 'mutations do not change the caller state');
  state = mutate(state, { type: 'repair', id: reportId, version: 2, payload: { note: 'Replaced broken paving and checked the ramp gradient.' } }, actor('facilities'));
  assert.equal(blockedEdgeIds(state.reports).has('library-quad'), true);
  const before = findRoute('library', 'quad', state.reports);
  state = mutate(state, { type: 'verify', id: reportId, version: 3 }, actor('verifier'));
  assert.equal(blockedEdgeIds(state.reports).has('library-quad'), false);
  const after = findRoute('library', 'quad', state.reports);
  assert.ok(before.distance > after.distance);
  assert.equal(after.distance, 95);
  assert.equal(state.reports[0].version, 4);
  assert.equal(state.activity[0].reportId, reportId);
});

test('routes honor steps, disconnected destinations, and the zero-length case', () => {
  const stairs = findRoute('engineering', 'quad', [], false);
  const accessible = findRoute('engineering', 'quad', [], true);
  assert.equal(stairs.distance, 100); assert.ok(accessible.distance > stairs.distance);
  assert.equal(accessible.edges.includes('engineering-quad'), false);
  assert.deepEqual(findRoute('gate', 'gate', []), { nodes: ['gate'], edges: [], distance: 0, blockedCount: 0 });
  assert.equal(findRoute('gate', 'library', [{ edgeId: 'north-library', status: 'Reported' }, { edgeId: 'north-engineering', status: 'Reported' }]), null);
  assert.equal(findRoute('missing', 'library', []), null);
});

test('domain validation rejects skipped states, stale writes, forged actors and duplicate support', () => {
  let state = seedState('test');
  assert.throws(() => mutate(state, { type: 'repair', id: 'CP-1042', payload: { note: 'Completed the repair work.' } }, actor('facilities')), e => e.code === 'INVALID_TRANSITION');
  assert.throws(() => mutate(state, { type: 'start', id: 'CP-1042', version: 99 }, actor('facilities')), e => e.code === 'VERSION_CONFLICT');
  assert.throws(() => mutate(state, { type: 'start', id: 'CP-1042' }, actor('facilities', 'other')), e => e.code === 'NOT_FOUND');
  assert.throws(() => mutate(state, { type: 'repair', id: 'CP-1041', payload: { note: 'Done' } }, actor('facilities')), DomainError);
  state = mutate(state, { type: 'support', id: 'CP-1042', version: 1 }, actor('student'));
  assert.equal(state.reports[0].supports, 13);
  assert.throws(() => mutate(state, { type: 'support', id: 'CP-1042' }, actor('student')), e => e.code === 'ALREADY_SUPPORTED');
  assert.throws(() => mutate(state, { type: 'create', payload: { ...createPayload, location: 'gate' } }, actor('student')), DomainError);
});

test('a reporter can reopen a failed repair and return its path to the blocked set', () => {
  const initial = seedState('test');
  const state = mutate(initial, { type: 'reopen', id: 'CP-1039', payload: { note: 'The replacement light failed during the evening check.' } }, actor('student'));
  assert.equal(state.reports.find(r => r.id === 'CP-1039').status, 'Reported');
  assert.throws(() => mutate(initial, { type: 'reopen', id: 'CP-1039' }, actor('facilities')), e => e.code === 'FORBIDDEN');
});

test('API derives authorization from opaque sessions and isolates each workspace', async t => {
  const store = createSQLiteStore(':memory:'); t.after(() => store.close()); const service = createService(store);
  const call = (method, path, body = {}, token) => service({ method, path, body, headers: token ? { authorization: `Bearer ${token}` } : {} });
  assert.equal((await call('GET', '/api/state')).status, 401);
  assert.equal((await call('GET', '/api/health')).body.authorization.engine, 'Cedar');
  const a = (await call('POST', '/api/session', { role: 'student' })).body;
  const b = (await call('POST', '/api/session', { role: 'student' })).body;
  assert.notEqual(a.principal.workspace, b.principal.workspace);
  const created = await call('POST', '/api/actions', { type: 'create', payload: createPayload }, a.token);
  assert.equal(created.status, 200); assert.equal(created.body.authorization.engine, 'Cedar');
  const report = created.body.state.reports[0];
  assert.equal((await call('POST', '/api/actions', { type: 'support', id: report.id }, b.token)).status, 404);
  assert.equal((await call('POST', '/api/actions', { type: 'start', id: report.id, role: 'facilities' }, a.token)).status, 400);
  assert.equal((await call('POST', '/api/actions', { type: 'start', id: report.id }, a.token)).status, 403);
  const facilities = (await call('POST', '/api/role', { role: 'facilities' }, a.token)).body;
  assert.equal((await call('GET', '/api/state', {}, a.token)).status, 401, 'switching roles rotates the token');
  const started = await call('POST', '/api/actions', { type: 'start', id: report.id, version: 1 }, facilities.token);
  assert.equal(started.status, 200);
  const repaired = await call('POST', '/api/actions', { type: 'repair', id: report.id, version: 2, payload: { note: 'Removed damaged paving and installed a level replacement.' } }, facilities.token);
  assert.equal(repaired.status, 200);
  assert.equal((await call('POST', '/api/actions', { type: 'verify', id: report.id, version: 3 }, facilities.token)).status, 403);
  const verifier = (await call('POST', '/api/role', { role: 'verifier' }, facilities.token)).body;
  const verified = await call('POST', '/api/actions', { type: 'verify', id: report.id, version: 3 }, verifier.token);
  assert.equal(verified.status, 200); assert.equal(verified.body.state.reports[0].status, 'Resolved');
  assert.equal((await call('GET', '/api/state', {}, b.token)).body.state.reports.length, 4);
});

test('SQLite persistence uses conditional revisions to prevent lost updates', async t => {
  const store = createSQLiteStore(':memory:'); t.after(() => store.close());
  const expiration = Math.floor(Date.now() / 1000) + 100;
  await store.createWorkspace('test', seedState('test'), expiration);
  const firstRead = await store.getWorkspace('test'); const staleRead = await store.getWorkspace('test');
  await store.putWorkspace('test', firstRead.state, firstRead.revision, expiration);
  await assert.rejects(() => store.putWorkspace('test', staleRead.state, staleRead.revision, expiration), e => e.code === 'VERSION_CONFLICT');
});
