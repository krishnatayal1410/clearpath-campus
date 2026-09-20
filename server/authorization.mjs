import * as cedar from '@cedar-policy/cedar-wasm/nodejs';
import { CEDAR_SCHEMA, POLICIES, POLICY_VERSION, requestFor, isAllowed } from '../src/policy.mjs';
import { DomainError } from '../src/domain.mjs';

const validation = cedar.validate({ schema: CEDAR_SCHEMA, policies: POLICIES });
if (validation.type !== 'success' || validation.validationErrors.length)
  throw new Error('Cedar policy validation failed at startup.');

export const cedarVersion = cedar.getCedarVersion();
export function authorize(principal, action, report) {
  const answer = cedar.isAuthorized(requestFor(principal, action, report));
  if (!isAllowed(answer)) throw new DomainError('Cedar policy does not allow this action for your role and this report.', 'FORBIDDEN', 403);
  return { engine: 'Cedar', version: cedarVersion, policyVersion: POLICY_VERSION, decision: 'allow', policies: answer.response.diagnostics.reason };
}
