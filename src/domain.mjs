/** Shared, deterministic campus operations; no browser or server dependencies. */
export const PLACES = [
  { id: 'gate', label: 'North Gate', x: 450, y: 65 },
  { id: 'library', label: 'Central Library', x: 210, y: 170 },
  { id: 'engineering', label: 'Engineering', x: 680, y: 150 },
  { id: 'quad', label: 'Green Quad', x: 445, y: 260 },
  { id: 'cafeteria', label: 'Cafeteria', x: 200, y: 330 },
  { id: 'health', label: 'Health Center', x: 735, y: 300 },
  { id: 'hostel', label: 'Residence Hall', x: 200, y: 430 },
  { id: 'admin', label: 'Admin Building', x: 580, y: 430 },
];

export const EDGES = [
  { id: 'north-library', from: 'gate', to: 'library', meters: 120, stepFree: true },
  { id: 'north-engineering', from: 'gate', to: 'engineering', meters: 130, stepFree: true },
  { id: 'library-quad', from: 'library', to: 'quad', meters: 95, stepFree: true },
  { id: 'engineering-quad', from: 'engineering', to: 'quad', meters: 100, stepFree: false },
  { id: 'library-student', from: 'library', to: 'cafeteria', meters: 155, stepFree: true },
  { id: 'engineering-health', from: 'engineering', to: 'health', meters: 160, stepFree: true },
  { id: 'quad-student', from: 'quad', to: 'cafeteria', meters: 110, stepFree: true },
  { id: 'quad-health', from: 'quad', to: 'health', meters: 115, stepFree: true },
  { id: 'student-hostel', from: 'cafeteria', to: 'hostel', meters: 110, stepFree: true },
  { id: 'student-south', from: 'cafeteria', to: 'admin', meters: 180, stepFree: true },
  { id: 'health-south', from: 'health', to: 'admin', meters: 120, stepFree: true },
  { id: 'hostel-south', from: 'hostel', to: 'admin', meters: 170, stepFree: true },
];

export const ROLES = ['student', 'facilities', 'verifier'];
export const CATEGORIES = ['Ramp', 'Lift', 'Pathway', 'Entrance', 'Lighting'];
export const PRIORITIES = ['High', 'Medium', 'Low'];
export const STATUSES = ['Reported', 'In progress', 'Awaiting verification', 'Resolved'];

export class DomainError extends Error {
  constructor(message, code = 'INVALID_ACTION', status = 400) {
    super(message); this.name = 'DomainError'; this.code = code; this.status = status;
  }
}
const reject = (message, code, status) => { throw new DomainError(message, code, status); };
const id = () => globalThis.crypto.randomUUID();
const text = (value, name, min, max) => {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max)
    reject(`${name} must be ${min}–${max} characters.`);
  return value.trim();
};

export function seedState(workspace = 'demo') {
  const now = Date.now();
  const rows = [
    ['CP-1042', 'Ramp surface damaged near the library', 'Uneven paving makes the library ramp difficult to use. Please repair the broken section.', 'library', 'library-quad', 'Ramp', 'High', 'Reported', 12, null, 7],
    ['CP-1041', 'Pathway blocked by maintenance barriers', 'Barriers narrow the path between the quad and student center. The accessible detour needs marking.', 'cafeteria', 'quad-student', 'Pathway', 'High', 'In progress', 8, 'Facilities team', 18],
    ['CP-1040', 'North entrance door needs adjustment', 'The entrance door has been adjusted and is ready for an independent accessibility check.', 'gate', 'north-library', 'Entrance', 'Medium', 'Awaiting verification', 5, 'Facilities team', 30],
    ['CP-1039', 'Lighting restored along hostel path', 'The broken path light was replaced, and the evening visibility check is complete.', 'hostel', 'student-hostel', 'Lighting', 'Low', 'Resolved', 6, 'Facilities team', 48],
  ];
  const reports = rows.map(([reportId, title, description, location, edgeId, category, priority, status, supports, assignee, hours]) => ({
    id: reportId, title, description, location, edgeId, category, priority, status, supports,
    assignee, reporter: `${workspace}:student`, workspace, version: 1,
    createdAt: new Date(now - hours * 3600000).toISOString(), updatedAt: new Date(now - Math.min(hours, 3) * 3600000).toISOString(),
    supporters: [], repairedBy: ['Awaiting verification', 'Resolved'].includes(status) ? `${workspace}:facilities` : '',
    repairNote: ['Awaiting verification', 'Resolved'].includes(status) ? 'Facilities completed the repair and inspected the affected section.' : '',
  }));
  return { reports, activity: [
    { id: 'activity-seed-3', reportId: 'CP-1040', message: 'Repair completed. Waiting for an independent check.', actor: 'Facilities team', at: new Date(now - 3600000).toISOString() },
    { id: 'activity-seed-2', reportId: 'CP-1041', message: 'Repair work started on the blocked pathway.', actor: 'Facilities team', at: new Date(now - 2 * 3600000).toISOString() },
    { id: 'activity-seed-1', reportId: 'CP-1042', message: 'A new ramp barrier was reported.', actor: 'Student', at: new Date(now - 7 * 3600000).toISOString() },
  ] };
}

export function blockedEdgeIds(reports) {
  return new Set(reports.filter(r => r.status !== 'Resolved' && r.category !== 'Lighting').map(r => r.edgeId).filter(Boolean));
}

/** Dijkstra over the demonstration map. Unverified repairs remain blocked. */
export function findRoute(from, to, reports, stepFree = true) {
  if (!PLACES.some(p => p.id === from) || !PLACES.some(p => p.id === to)) return null;
  const blocked = blockedEdgeIds(reports);
  const distances = new Map(PLACES.map(p => [p.id, Infinity]));
  const previous = new Map(); const unvisited = new Set(PLACES.map(p => p.id));
  distances.set(from, 0);
  while (unvisited.size) {
    const current = [...unvisited].sort((a, b) => distances.get(a) - distances.get(b))[0];
    if (!Number.isFinite(distances.get(current))) break;
    unvisited.delete(current);
    if (current === to) break;
    for (const edge of EDGES) {
      if (blocked.has(edge.id) || (stepFree && !edge.stepFree)) continue;
      const neighbor = edge.from === current ? edge.to : edge.to === current ? edge.from : null;
      if (!neighbor || !unvisited.has(neighbor)) continue;
      const next = distances.get(current) + edge.meters;
      if (next < distances.get(neighbor)) { distances.set(neighbor, next); previous.set(neighbor, { node: current, edge: edge.id }); }
    }
  }
  if (!Number.isFinite(distances.get(to))) return null;
  const nodes = [to]; const edges = []; let current = to;
  while (current !== from) { const prev = previous.get(current); if (!prev) return null; edges.unshift(prev.edge); nodes.unshift(prev.node); current = prev.node; }
  return { nodes, edges, distance: distances.get(to), blockedCount: blocked.size };
}

/** Domain constraints complement Cedar authorization and never trust client roles. */
export function mutate(state, action, principal) {
  if (!principal?.id || !principal.workspace || !ROLES.includes(principal.role)) reject('A valid session is required.', 'UNAUTHORIZED', 401);
  if (!action || !['create', 'support', 'assign', 'start', 'repair', 'verify', 'reopen'].includes(action.type)) reject('Unknown action.');
  const next = structuredClone(state); const payload = action.payload ?? {}; const now = new Date().toISOString();
  let report = next.reports.find(r => r.id === action.id); let message;
  if (action.type !== 'create') {
    if (!report || report.workspace !== principal.workspace) reject('Report not found.', 'NOT_FOUND', 404);
    const expected = action.version ?? payload.version;
    if (expected !== undefined && (!Number.isInteger(expected) || expected !== report.version)) reject('This report changed. Refresh and try again.', 'VERSION_CONFLICT', 409);
  }
  const requireRole = (...roles) => { if (!roles.includes(principal.role)) reject('Your role cannot perform this action.', 'FORBIDDEN', 403); };
  const requireStatus = (...statuses) => { if (!statuses.includes(report.status)) reject('This action is unavailable in the current report status.', 'INVALID_TRANSITION', 409); };
  switch (action.type) {
    case 'create': {
      requireRole('student');
      if (next.reports.length >= 250) reject('This demo workspace has reached its report limit.', 'WORKSPACE_FULL', 409);
      const location = PLACES.find(p => p.id === payload.location);
      const edge = EDGES.find(e => e.id === payload.edgeId);
      if (!location || !edge || ![edge.from, edge.to].includes(location.id)) reject('Choose a location and one of its connected paths.');
      if (!CATEGORIES.includes(payload.category) || !PRIORITIES.includes(payload.priority)) reject('Choose a valid category and priority.');
      report = {
        id: `CP-${id().slice(0, 8).toUpperCase()}`, title: text(payload.title, 'Title', 5, 120),
        description: text(payload.description, 'Description', 12, 2000), location: location.id, edgeId: edge.id,
        category: payload.category, priority: payload.priority, status: 'Reported', supports: 1,
        createdAt: now, updatedAt: now, assignee: null, reporter: principal.id, workspace: principal.workspace,
        version: 1, supporters: [principal.id], repairedBy: '', repairNote: '',
      };
      next.reports.unshift(report); message = 'Reported a new accessibility barrier.'; break;
    }
    case 'support':
      requireRole('student');
      if (report.status === 'Resolved') reject('This report is already resolved.', 'INVALID_TRANSITION', 409);
      if (report.supporters?.includes(principal.id)) reject('You already supported this report.', 'ALREADY_SUPPORTED', 409);
      report.supporters = [...(report.supporters ?? []), principal.id]; report.supports += 1;
      message = 'Confirmed that this barrier affects them too.'; break;
    case 'assign':
      requireRole('facilities'); requireStatus('Reported', 'In progress');
      report.assignee = text(payload.assignee ?? 'Facilities team', 'Assignee', 2, 80);
      message = `Assigned to ${report.assignee}.`; break;
    case 'start':
      requireRole('facilities'); requireStatus('Reported'); report.status = 'In progress';
      report.assignee ||= 'Facilities team'; message = 'Started repair work.'; break;
    case 'repair':
      requireRole('facilities'); requireStatus('In progress');
      report.repairNote = text(payload.note ?? payload.repairNote, 'Repair note', 12, 2000);
      report.repairedBy = principal.id; report.status = 'Awaiting verification';
      message = `Repair completed: ${report.repairNote}`; break;
    case 'verify':
      requireRole('verifier'); requireStatus('Awaiting verification');
      if (report.repairedBy === principal.id) reject('The repair must be verified by a different person.', 'FORBIDDEN', 403);
      report.status = 'Resolved'; report.verifiedBy = principal.id; report.verifiedAt = now;
      message = 'Independently verified the repair. The path is available again.'; break;
    case 'reopen':
      if (principal.role !== 'verifier' && report.reporter !== principal.id) reject('Only the reporter or a verifier can reopen this report.', 'FORBIDDEN', 403);
      requireStatus('Awaiting verification', 'Resolved');
      report.status = 'Reported'; report.reopenNote = text(payload.note ?? 'The barrier remains and needs another inspection.', 'Reopen note', 12, 2000);
      report.repairedBy = ''; delete report.verifiedBy; delete report.verifiedAt;
      message = `Reopened for repair: ${report.reopenNote}`; break;
  }
  if (action.type !== 'create') { report.version += 1; report.updatedAt = now; }
  next.activity.unshift({ id: id(), reportId: report.id, message, actor: principal.role === 'student' ? 'Student' : principal.role === 'facilities' ? 'Facilities team' : 'Accessibility verifier', actorId: principal.id, at: now });
  next.activity = next.activity.slice(0, 500);
  return next;
}
