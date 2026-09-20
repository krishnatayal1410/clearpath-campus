import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { seedState, mutate, ROLES, DomainError } from '../src/domain.mjs';
import { authorize, cedarVersion } from './authorization.mjs';

const roleInput = z.object({ role: z.enum(ROLES).default('student') }).strict();
const actionInput = z.object({
  type: z.enum(['create', 'support', 'assign', 'start', 'repair', 'verify', 'reopen']),
  id: z.string().min(1).max(80).optional(), version: z.number().int().positive().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
}).strict();
const hash = token => createHash('sha256').update(token).digest('hex');
const friendlyNames = { student: 'Alex Morgan', facilities: 'Sam Rivera', verifier: 'Jamie Chen' };
const principalFor = session => ({ id: `${session.workspace}:${session.role}`, role: session.role, workspace: session.workspace, name: friendlyNames[session.role] });

export function createService(store) {
  // This is a demonstration workspace. Production enrollment must replace role switching.
  const sessionHours = Math.max(1, Math.min(Number(process.env.DEMO_TTL_HOURS ?? process.env.DEMO_SESSION_HOURS) || 24, 72));
  async function issueSession(workspace, role, expiresAt) {
    const token = randomBytes(32).toString('base64url');
    const session = { workspace, role, expiresAt };
    await store.putSession(hash(token), session);
    return { token, principal: principalFor(session), expiresAt: new Date(expiresAt * 1000).toISOString() };
  }
  async function authenticated(headers) {
    const token = /^Bearer ([A-Za-z0-9_-]{43})$/.exec(headers.authorization ?? '')?.[1];
    if (!token) throw new DomainError('Start a demo session to continue.', 'UNAUTHORIZED', 401);
    const tokenHash = hash(token); const session = await store.getSession(tokenHash);
    if (!session || session.expiresAt <= Math.floor(Date.now() / 1000))
      throw new DomainError('This demo session expired. Start a new session.', 'SESSION_EXPIRED', 401);
    return { session, principal: principalFor(session), tokenHash };
  }
  return async function service({ method, path, headers = {}, body = {} }) {
    try {
      if (method === 'GET' && path === '/api/health') {
        await store.health();
        return { status: 200, body: { ok: true, service: 'clearpath', mode: 'isolated-demo', storage: store.kind, cedarVersion, authorization: { engine: 'Cedar', version: cedarVersion } } };
      }
      if (method === 'POST' && path === '/api/session') {
        const { role } = roleInput.parse(body);
        const workspace = randomUUID(); const expiresAt = Math.floor(Date.now() / 1000) + sessionHours * 3600;
        const state = seedState(workspace);
        await store.createWorkspace(workspace, state, expiresAt);
        return { status: 201, body: { ...(await issueSession(workspace, role, expiresAt)), state } };
      }
      const { session, principal, tokenHash } = await authenticated(headers);
      const workspace = await store.getWorkspace(session.workspace);
      if (!workspace || workspace.expiresAt <= Math.floor(Date.now() / 1000))
        throw new DomainError('This workspace expired. Start a new demo.', 'SESSION_EXPIRED', 401);
      if (method === 'GET' && path === '/api/state') {
        authorize(principal, 'read', { id: 'workspace', workspace: session.workspace });
        return { status: 200, body: { state: workspace.state, principal, revision: workspace.revision } };
      }
      if (method === 'POST' && path === '/api/role') {
        const { role } = roleInput.parse(body);
        const issued = await issueSession(session.workspace, role, session.expiresAt);
        await store.deleteSession(tokenHash);
        return { status: 200, body: { ...issued, state: workspace.state } };
      }
      if (method === 'POST' && path === '/api/actions') {
        const action = actionInput.parse(body);
        let report;
        if (action.type === 'create') report = { id: 'new-report', reporter: principal.id, workspace: principal.workspace, status: 'Reported' };
        else {
          report = workspace.state.reports.find(r => r.id === action.id);
          if (!report) throw new DomainError('Report not found.', 'NOT_FOUND', 404);
        }
        const authorization = authorize(principal, action.type, report);
        const state = mutate(workspace.state, action, principal);
        // DynamoDB has a 400 KB item limit; keep the aggregate beneath a safe margin.
        if (Buffer.byteLength(JSON.stringify(state)) > 300000)
          throw new DomainError('This demo workspace has reached its storage limit.', 'WORKSPACE_FULL', 409);
        await store.putWorkspace(session.workspace, state, workspace.revision, session.expiresAt);
        return { status: 200, body: { state, principal, revision: workspace.revision + 1, authorization } };
      }
      return { status: 404, body: { error: 'Endpoint not found.', code: 'NOT_FOUND' } };
    } catch (error) {
      if (error instanceof z.ZodError) return { status: 400, body: { error: 'Invalid request fields.', code: 'INVALID_INPUT', fields: error.issues.map(i => ({ path: i.path.join('.'), message: i.message })) } };
      if (error instanceof DomainError) return { status: error.status, body: { error: error.message, code: error.code } };
      // Deliberately avoid returning SDK errors, database details, or request tokens.
      console.error(JSON.stringify({ event: 'clearpath-api-error', name: error?.name ?? 'Error', path }));
      return { status: 500, body: { error: 'The request could not be completed. Please retry.', code: 'INTERNAL_ERROR' } };
    }
  };
}
