import type { State, Principal, Role, Command } from "./types";
import { seedState, mutate } from "./domain.mjs";
import { requestFor } from "./policy.mjs";
const KEY = "clearpath.demo.v1";
let token = localStorage.getItem(KEY + ".token");
let remote = false;
let cedar: typeof import("@cedar-policy/cedar-wasm") | null = null;
export let lastDecision = "Ready to evaluate";
const fallbackPrincipal = (role: Role): Principal => ({
  id: `demo:${role}`,
  role,
  workspace: "demo",
});
async function call(path: string, body?: unknown) {
  const res = await fetch("/api" + path, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(
      data.error || data.message || `Request failed (${res.status})`,
    );
  return data;
}
export function readLocal(): { state: State; principal: Principal } {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "null");
    if (
      data &&
      Array.isArray(data.state?.reports) &&
      Array.isArray(data.state?.activity) &&
      ["student", "facilities", "verifier"].includes(data.principal?.role)
    )
      return data;
  } catch {}
  return {
    state: seedState() as State,
    principal: fallbackPrincipal("student"),
  };
}
function save(state: State, principal: Principal) {
  localStorage.setItem(KEY, JSON.stringify({ state, principal }));
}
let initialization: ReturnType<typeof boot> | null = null;
export function initialize() {
  return (initialization ||= boot());
}
async function boot() {
  const local = readLocal();
  try {
    const res = await fetch("/api/health", {
      signal: AbortSignal.timeout(2500),
    });
    const health = await res.json();
    if (!res.ok || !health.cedarVersion) throw new Error("No backend");
    remote = true;
    let data;
    if (token) {
      try {
        data = await call("/state");
      } catch {
        token = null;
      }
    }
    if (!data) {
      data = await call("/session", { role: local.principal.role });
      token = data.token;
      localStorage.setItem(KEY + ".token", token!);
    }
    return { ...data, mode: "Connected workspace" as const };
  } catch {
    remote = false;
    cedar = await import("@cedar-policy/cedar-wasm");
    return { ...local, mode: "Browser demo" as const };
  }
}
export async function switchRole(role: Role, state: State) {
  if (remote) {
    const data = await call("/role", { role });
    token = data.token;
    localStorage.setItem(KEY + ".token", token!);
    return data;
  }
  const principal = fallbackPrincipal(role);
  save(state, principal);
  return { state, principal };
}
export async function perform(
  state: State,
  principal: Principal,
  command: Command,
) {
  if (remote) {
    const data = await call("/actions", command);
    lastDecision = `AWS Cedar · allowed ${command.type}`;
    return data.state as State;
  }
  cedar ||= await import("@cedar-policy/cedar-wasm");
  const report = state.reports.find((r) => r.id === command.id);
  const response = cedar.isAuthorized(
    requestFor(principal, command.type, report) as unknown as Parameters<
      typeof cedar.isAuthorized
    >[0],
  );
  if (response.type !== "success" || response.response.decision !== "allow") {
    lastDecision = `AWS Cedar · denied ${command.type}`;
    throw new Error(
      "This action is not available for your current role. Switch roles to explore the demo.",
    );
  }
  const next = mutate(state, command, principal) as State;
  lastDecision = `AWS Cedar · allowed ${command.type}`;
  save(next, principal);
  return next;
}
export function storageMode() {
  return remote
    ? "Server-side Cedar authorization"
    : "Cedar runs locally · isolated sample workspace";
}
