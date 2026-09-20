/** Cedar is the authorization engine in both the interactive demo and the API. */
export const SCHEMA = `namespace ClearPath {
  entity User { id: String, role: String, workspace: String };
  entity Report { workspace: String, reporter: String, repairedBy: String, status: String };
  action "read", "create", "support", "assign", "start", "repair", "verify", "reopen"
    appliesTo { principal: [User], resource: [Report], context: {} };
}`;

export const POLICIES = { staticPolicies: {
  'workspace-read': `permit(principal, action == ClearPath::Action::"read", resource)
    when { principal.workspace == resource.workspace };`,
  'student-report': `permit(principal, action == ClearPath::Action::"create", resource)
    when { principal.workspace == resource.workspace && principal.role == "student" && resource.reporter == principal.id };`,
  'student-support': `permit(principal, action == ClearPath::Action::"support", resource)
    when { principal.workspace == resource.workspace && principal.role == "student" && resource.status != "Resolved" };`,
  'facilities-assign': `permit(principal, action == ClearPath::Action::"assign", resource)
    when { principal.workspace == resource.workspace && principal.role == "facilities" &&
      (resource.status == "Reported" || resource.status == "In progress") };`,
  'facilities-start': `permit(principal, action == ClearPath::Action::"start", resource)
    when { principal.workspace == resource.workspace && principal.role == "facilities" && resource.status == "Reported" };`,
  'facilities-repair': `permit(principal, action == ClearPath::Action::"repair", resource)
    when { principal.workspace == resource.workspace && principal.role == "facilities" && resource.status == "In progress" };`,
  'independent-verification': `permit(principal, action == ClearPath::Action::"verify", resource)
    when { principal.workspace == resource.workspace && principal.role == "verifier" &&
      resource.status == "Awaiting verification" && resource.repairedBy != principal.id };`,
  'reopen-with-accountability': `permit(principal, action == ClearPath::Action::"reopen", resource)
    when { principal.workspace == resource.workspace &&
      (principal.role == "verifier" || resource.reporter == principal.id) &&
      (resource.status == "Awaiting verification" || resource.status == "Resolved") };`,
} };

export const CEDAR_SCHEMA = SCHEMA;
export const POLICY_VERSION = 'clearpath-1';

export function requestFor(principal, action, report = {}) {
  const user = { type: 'ClearPath::User', id: String(principal.id) };
  const resource = { type: 'ClearPath::Report', id: String(report.id ?? 'new-report') };
  return {
    principal: user,
    action: { type: 'ClearPath::Action', id: action },
    resource,
    context: {},
    schema: CEDAR_SCHEMA,
    validateRequest: true,
    policies: POLICIES,
    entities: [
      { uid: user, attrs: { id: principal.id, role: principal.role, workspace: principal.workspace }, parents: [] },
      { uid: resource, attrs: {
        workspace: report.workspace ?? (action === 'create' ? principal.workspace : ''),
        reporter: report.reporter ?? (action === 'create' ? principal.id : ''),
        repairedBy: report.repairedBy ?? '',
        status: report.status ?? 'Reported',
      }, parents: [] },
    ],
  };
}

export function isAllowed(answer) {
  return answer?.type === 'success' && answer.response.decision === 'allow' && answer.response.diagnostics.errors.length === 0;
}
