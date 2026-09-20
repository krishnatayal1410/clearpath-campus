import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DomainError } from '../src/domain.mjs';

export function createSQLiteStore(filename = '.data/clearpath.sqlite') {
  if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec(`PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS workspaces (id TEXT PRIMARY KEY, state TEXT NOT NULL, revision INTEGER NOT NULL, expiresAt INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (tokenHash TEXT PRIMARY KEY, workspace TEXT NOT NULL, role TEXT NOT NULL, expiresAt INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS session_expiry ON sessions(expiresAt);
    CREATE INDEX IF NOT EXISTS workspace_expiry ON workspaces(expiresAt);`);
  return {
    kind: 'sqlite',
    async health() { db.prepare('SELECT 1').get(); return true; },
    async createWorkspace(workspace, state, expiresAt) {
      const now = Math.floor(Date.now() / 1000);
      db.prepare('DELETE FROM sessions WHERE expiresAt < ?').run(now);
      db.prepare('DELETE FROM workspaces WHERE expiresAt < ?').run(now);
      if (db.prepare('SELECT COUNT(*) AS n FROM workspaces').get().n >= 5000)
        throw new DomainError('The demo is at capacity. Please try again later.', 'AT_CAPACITY', 503);
      db.prepare('INSERT INTO workspaces VALUES (?, ?, 1, ?)').run(workspace, JSON.stringify(state), expiresAt);
    },
    async getWorkspace(workspace) {
      const row = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(workspace);
      return row ? { state: JSON.parse(row.state), revision: row.revision, expiresAt: row.expiresAt } : null;
    },
    async putWorkspace(workspace, state, revision, expiresAt) {
      const result = db.prepare('UPDATE workspaces SET state = ?, revision = revision + 1, expiresAt = ? WHERE id = ? AND revision = ?')
        .run(JSON.stringify(state), expiresAt, workspace, revision);
      if (result.changes !== 1) throw new DomainError('Workspace changed. Refresh and retry.', 'VERSION_CONFLICT', 409);
    },
    async putSession(tokenHash, session) {
      db.prepare('INSERT INTO sessions VALUES (?, ?, ?, ?)').run(tokenHash, session.workspace, session.role, session.expiresAt);
    },
    async getSession(tokenHash) { return db.prepare('SELECT workspace, role, expiresAt FROM sessions WHERE tokenHash = ?').get(tokenHash) ?? null; },
    async deleteSession(tokenHash) { db.prepare('DELETE FROM sessions WHERE tokenHash = ?').run(tokenHash); },
    close() { db.close(); },
  };
}
