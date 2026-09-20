import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCheck,
  ChevronDown,
  CircleHelp,
  CirclePlus,
  Clock3,
  Compass,
  Footprints,
  GraduationCap,
  LayoutDashboard,
  Leaf,
  ListFilter,
  MapPin,
  Menu,
  MessageSquare,
  Navigation,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  TrafficCone,
  TrendingUp,
  Users,
  Wrench,
  X,
} from "lucide-react";
import {
  PLACES as placesData,
  EDGES as edgesData,
  findRoute,
} from "./domain.mjs";
import type {
  State,
  Principal,
  Role,
  Report,
  Place,
  Edge,
  Command,
  RouteResult,
} from "./types";
import {
  initialize,
  readLocal,
  perform,
  switchRole,
  lastDecision,
  storageMode,
} from "./client";
const PLACES = placesData as Place[],
  EDGES = edgesData as Edge[];
const nameOf = (id: string) => PLACES.find((p) => p.id === id)?.label || id;
const roles: Record<Role, string> = {
  student: "Student",
  facilities: "Facilities",
  verifier: "Access champion",
};
const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "reports", label: "Barrier reports", icon: MessageSquare },
  { id: "routes", label: "Find a clear path", icon: Route },
  { id: "impact", label: "Progress & activity", icon: TrendingUp },
];
function elapsed(iso: string) {
  const n = Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / 60000),
  );
  return n < 1
    ? "Just now"
    : n < 60
      ? `${n}m ago`
      : n < 1440
        ? `${Math.floor(n / 60)}h ago`
        : `${Math.floor(n / 1440)}d ago`;
}
function statusClass(status: string) {
  return status.toLowerCase().replaceAll(" ", "-");
}
function Status({ status }: { status: string }) {
  return (
    <span className={`status ${statusClass(status)}`}>
      <i />
      {status}
    </span>
  );
}
function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "wide" : ""}`}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-title">
        <h2>{title}</h2>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function CampusMap({
  reports,
  route,
  onReport,
  large = false,
}: {
  reports: Report[];
  route?: RouteResult | null;
  onReport: (r: Report) => void;
  large?: boolean;
}) {
  const [zoom, setZoom] = useState(1);
  const active = reports.filter((r) => r.status !== "Resolved");
  const selected = new Set(route?.edges || []);
  const groups = PLACES.map((p) => ({
    p,
    reports: active.filter((r) => r.location === p.id),
  }));
  return (
    <div className={`map-wrap ${large ? "large" : ""}`}>
      <svg
        className="campus-map"
        viewBox={`${450 - 450 / zoom} ${250 - 250 / zoom} ${900 / zoom} ${500 / zoom}`}
        role="img"
        aria-label="Illustrated demonstration campus. Report markers and current route are shown. Use the report list for full details."
      >
        <defs>
          <pattern
            id="dots"
            width="19"
            height="19"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r=".7" fill="#c4ccba" opacity=".6" />
          </pattern>
          <pattern
            id="grass"
            width="12"
            height="12"
            patternUnits="userSpaceOnUse"
          >
            <path d="M2 9l2-4m3 5l2-4" stroke="#b6c59d" opacity=".32" />
          </pattern>
          <filter id="buildingShadow">
            <feDropShadow
              dx="0"
              dy="5"
              stdDeviation="0"
              floodColor="#c6c9b9"
              floodOpacity=".5"
            />
          </filter>
        </defs>
        <rect width="900" height="500" fill="#edf0e4" />
        <rect width="900" height="500" fill="url(#dots)" />
        <path
          d="M-10 110Q190 20 400 68T920 95M-10 420Q350 450 540 418T920 450"
          stroke="#dee3d4"
          strokeWidth="38"
          fill="none"
        />
        <path
          d="M-10 110Q190 20 400 68T920 95M-10 420Q350 450 540 418T920 450"
          stroke="#fafbf5"
          strokeWidth="23"
          fill="none"
        />
        <rect x="335" y="167" width="235" height="146" rx="61" fill="#dfe9cb" />
        <rect
          x="345"
          y="177"
          width="215"
          height="126"
          rx="54"
          fill="url(#grass)"
        />
        <ellipse cx="459" cy="241" rx="33" ry="22" fill="#d3e2c5" />
        <ellipse cx="459" cy="241" rx="19" ry="11" fill="#bbd4cc" />
        {EDGES.map((e) => {
          const a = PLACES.find((p) => p.id === e.from),
            b = PLACES.find((p) => p.id === e.to);
          if (!a || !b) return null;
          const blocked = active.some(
            (r) => r.edgeId === e.id && r.category !== "Lighting",
          );
          return (
            <g key={e.id}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#d8dcca"
                strokeWidth="19"
                strokeLinecap="round"
              />
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={
                  selected.has(e.id)
                    ? "#467858"
                    : blocked
                      ? "#e9b99b"
                      : "#fbfaf2"
                }
                strokeWidth={selected.has(e.id) ? 7 : 12}
                strokeDasharray={
                  blocked ? "7 6" : !e.stepFree ? "3 5" : undefined
                }
                strokeLinecap="round"
              />
              {selected.has(e.id) && (
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="#eff8ce"
                  strokeWidth="2"
                  strokeDasharray="3 9"
                />
              )}
            </g>
          );
        })}
        {Array.from({ length: 36 }, (_, i) => {
          const x = 36 + ((i * 137) % 830),
            y = 24 + ((i * 73) % 448);
          if (
            PLACES.some((p) => Math.abs(p.x - x) < 64 && Math.abs(p.y - y) < 57)
          )
            return null;
          return (
            <g key={i} transform={`translate(${x},${y})`}>
              <ellipse cy="6" rx="12" ry="7" fill="#cbd6ba" />
              <circle
                cy="-2"
                r={8 + (i % 5)}
                fill={["#a9c695", "#b5cda0", "#c4d6af"][i % 3]}
              />
              <path d="M0 4V-5m0 5l-3-3" stroke="#88a875" strokeWidth="1.5" />
            </g>
          );
        })}
        {groups.map(({ p, reports: rs }, index) => (
          <g key={p.id} transform={`translate(${p.x},${p.y})`}>
            <g transform="translate(-40,-57)" filter="url(#buildingShadow)">
              <rect
                width="80"
                height="46"
                rx="5"
                fill={index % 3 === 0 ? "#dadccc" : "#e5dfcf"}
                stroke="#c3c6b7"
                strokeWidth="1.5"
              />
              <rect
                x="5"
                y="5"
                width="70"
                height="34"
                rx="3"
                fill={index % 3 === 0 ? "#e7eadb" : "#f0ecdf"}
              />
              {[15, 33, 51].map((x) => (
                <rect
                  key={x}
                  x={x}
                  y="11"
                  width="10"
                  height="17"
                  rx="1"
                  fill="#d2d8c7"
                />
              ))}
              <rect x="34" y="39" width="12" height="7" fill="#b9c4b0" />
            </g>
            <circle r="5" fill="#fff" stroke="#79916d" strokeWidth="2" />
            <text
              y="20"
              textAnchor="middle"
              fill="#56624d"
              fontSize="12"
              fontWeight="600"
            >
              {p.label}
            </text>
            {rs.length > 0 && (
              <g
                className="map-marker"
                role="button"
                tabIndex={0}
                aria-label={`${rs.length} barrier reports at ${p.label}`}
                onClick={() => onReport(rs[0])}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onReport(rs[0]);
                  }
                }}
                transform="translate(35,-51)"
              >
                <circle
                  r="15"
                  fill={
                    rs.some((r) => r.priority === "High")
                      ? "#bc6544"
                      : "#c69448"
                  }
                  stroke="#fff"
                  strokeWidth="3"
                />
                <text
                  textAnchor="middle"
                  y="5"
                  fontWeight="700"
                  fontSize="13"
                  fill="#fff"
                >
                  {rs.length}
                </text>
              </g>
            )}
          </g>
        ))}
        {route &&
          route.nodes.length > 0 &&
          [route.nodes[0], route.nodes[route.nodes.length - 1]].map((id, i) => {
            const p = PLACES.find((p) => p.id === id);
            return p ? (
              <g key={`${id}-${i}`} transform={`translate(${p.x},${p.y})`}>
                <circle
                  r="11"
                  fill={i ? "#234c39" : "#e4f3b8"}
                  stroke="#fff"
                  strokeWidth="3"
                />
                <text
                  y="4"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill={i ? "#fff" : "#234c39"}
                >
                  {i ? "B" : "A"}
                </text>
              </g>
            ) : null;
          })}
      </svg>
      <div className="map-label">
        <span className="live-dot" /> DEMONSTRATION CAMPUS
      </div>
      <div className="map-compass">
        <Navigation size={17} />
        <span>N</span>
      </div>
      <div className="map-controls">
        <button
          aria-label="Zoom in map"
          disabled={zoom >= 1.6}
          onClick={() => setZoom((z) => Math.min(1.6, z + 0.2))}
        >
          +
        </button>
        <button
          aria-label="Zoom out map"
          disabled={zoom <= 1}
          onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
        >
          −
        </button>
      </div>
      <div className="map-key">
        <span>
          <i className="key-open" />
          Open path
        </span>
        <span>
          <i className="key-barrier" />
          Reported barrier
        </span>
        {route && (
          <span>
            <i className="key-route" />
            Your route
          </span>
        )}
      </div>
    </div>
  );
}
export default function App() {
  const initial = useRef(readLocal()).current;
  const [state, setState] = useState<State>(initial.state),
    [principal, setPrincipal] = useState<Principal>(initial.principal),
    [mode, setMode] = useState("Loading workspace"),
    [ready, setReady] = useState(false);
  const [view, setView] = useState("overview"),
    [filter, setFilter] = useState("All reports"),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState<string | null>(null),
    [showNew, setShowNew] = useState(false),
    [showAbout, setShowAbout] = useState(false),
    [mobileMenu, setMobileMenu] = useState(false),
    [toast, setToast] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [note, setNote] = useState("");
  const [from, setFrom] = useState(
      PLACES.find((p) => p.id === "gate")?.id || PLACES[0]?.id,
    ),
    [to, setTo] = useState(
      PLACES.find((p) => p.id === "library")?.id || PLACES[1]?.id,
    ),
    [stepFree, setStepFree] = useState(true),
    [planned, setPlanned] = useState(false);
  useEffect(() => {
    let alive = true;
    initialize()
      .then((data) => {
        if (alive) {
          setState(data.state);
          setPrincipal(data.principal);
          setMode(data.mode);
          setReady(true);
        }
      })
      .catch(() =>
        setError(
          "The policy engine could not load. Please reload to try again.",
        ),
      );
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  const active = state.reports.filter((r) => r.status !== "Resolved"),
    resolved = state.reports.filter((r) => r.status === "Resolved"),
    awaiting = state.reports.filter(
      (r) => r.status === "Awaiting verification",
    );
  const visible = state.reports
    .filter(
      (r) =>
        (filter === "All reports" || r.status === filter) &&
        (r.title + " " + nameOf(r.location) + " " + r.category)
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort(
      (a, b) =>
        ({ High: 0, Medium: 1, Low: 2 })[a.priority] -
        { High: 0, Medium: 1, Low: 2 }[b.priority],
    );
  const report = state.reports.find((r) => r.id === selected);
  const route = planned
    ? (findRoute(from, to, state.reports, stepFree) as RouteResult | null)
    : null;
  async function action(command: Command, message: string) {
    setBusy(true);
    setError("");
    try {
      const next = await perform(state, principal, command);
      setState(next);
      setToast(message);
      setNote("");
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function changeRole(role: Role) {
    setBusy(true);
    try {
      const data = await switchRole(role, state);
      setState(data.state);
      setPrincipal(data.principal);
      setToast(`Exploring as ${roles[role].toLowerCase()}`);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  function navigate(id: string) {
    setView(id);
    setMobileMenu(false);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function exportData() {
    const payload = {
      app: "ClearPath",
      exportedAt: new Date().toISOString(),
      notice: "Fictional demonstration campus; not real navigation data",
      ...state,
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "clearpath-workspace.json";
    a.click();
    URL.revokeObjectURL(url);
    setToast("Workspace exported as JSON");
  }
  const title = navItems.find((n) => n.id === view)?.label || "Overview";
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <div className="app-shell">
        <aside className={`sidebar ${mobileMenu ? "shown" : ""}`}>
          <a
            className="brand"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("overview");
            }}
          >
            <span className="brand-mark">
              <Route size={27} strokeWidth={2.2} />
            </span>
            clearpath<span className="brand-period">.</span>
          </a>
          <div className="campus-select">
            <div className="campus-icon">
              <GraduationCap size={20} />
            </div>
            <div>
              <strong>Greenfield Campus</strong>
              <small>Demonstration workspace</small>
            </div>
            <ChevronDown size={14} />
          </div>
          <p className="nav-label">YOUR WORKSPACE</p>
          <nav aria-label="Main navigation">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={view === id ? "active" : ""}
                onClick={() => navigate(id)}
                aria-current={view === id ? "page" : undefined}
              >
                <Icon size={19} />
                {label}
                {id === "reports" && (
                  <span className="nav-count">{active.length}</span>
                )}
              </button>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="kind-card">
              <span className="kind-icon">
                <Leaf size={23} />
              </span>
              <strong>
                Small fixes.
                <br />A more open campus.
              </strong>
              <p>Every report is a step toward a place for everyone.</p>
              <button
                disabled={!ready || busy || principal.role !== "student"}
                title={
                  principal.role !== "student"
                    ? "Switch to the Student demo role to report a barrier"
                    : undefined
                }
                onClick={() => {
                  setShowNew(true);
                  setError("");
                }}
              >
                Make a difference <ArrowUpRight size={16} />
              </button>
            </div>
            <button className="help-link" onClick={() => setShowAbout(true)}>
              <CircleHelp size={18} />
              About this project
              <ArrowUpRight size={14} />
            </button>
            <div className="profile">
              <span className="avatar">
                {principal.role === "student"
                  ? "ST"
                  : principal.role === "facilities"
                    ? "FT"
                    : "AC"}
              </span>
              <div>
                <strong>{roles[principal.role]}</strong>
                <small>Demo role</small>
              </div>
              <ShieldCheck size={17} />
            </div>
          </div>
        </aside>
        <div className="workspace">
          <header className="topbar">
            <div className="breadcrumb">
              <button
                className="mobile-toggle icon-button"
                aria-label="Toggle navigation"
                onClick={() => setMobileMenu(!mobileMenu)}
              >
                <Menu size={21} />
              </button>
              <span>Workspace</span>
              <span className="slash">/</span>
              <strong>{title}</strong>
            </div>
            <div className="topbar-actions">
              <span className="demo-badge">
                <span className="live-dot" />
                Sample data
              </span>
              <label className="role-select">
                <Users size={15} />
                <span className="sr-only">Demo role</span>
                <select
                  aria-label="Demo role"
                  value={principal.role}
                  disabled={!ready || busy}
                  onChange={(e) => changeRole(e.target.value as Role)}
                >
                  {Object.entries(roles).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </header>
          <main id="main">
            <div className="page-heading">
              <div>
                <p className="eyebrow">A CAMPUS THAT INCLUDES EVERYONE</p>
                <h1>
                  {view === "overview"
                    ? "Every path, for everyone."
                    : view === "reports"
                      ? "See it. Report it. Change it."
                      : view === "routes"
                        ? "A better way to get there."
                        : "Small actions. Visible progress."}
                </h1>
                <p className="heading-copy">
                  {view === "overview"
                    ? "Spot a barrier. Bring the right people together. Keep your campus moving."
                    : view === "reports"
                      ? "From the first report to a verified fix. Nothing gets lost along the way."
                      : view === "routes"
                        ? "Find a step-free route that responds to the barriers reported today."
                        : "Follow the work behind a more accessible campus."}
                </p>
              </div>
              <button
                className="button primary"
                disabled={!ready || busy || principal.role !== "student"}
                title={
                  principal.role !== "student"
                    ? "Switch to the Student demo role to report a barrier"
                    : undefined
                }
                onClick={() => {
                  setShowNew(true);
                  setError("");
                }}
              >
                <CirclePlus size={18} />
                Report a barrier
              </button>
            </div>
            {error && !showNew && !report && (
              <div className="error" role="alert">
                {error}
                <button aria-label="Dismiss error" onClick={() => setError("")}>
                  <X size={15} />
                </button>
              </div>
            )}
            {view === "overview" && (
              <>
                <section className="welcome-banner">
                  <div className="banner-content">
                    <span className="banner-eyebrow">
                      <span /> ACCESS STARTS WITH US
                    </span>
                    <h2>
                      A small detour shouldn’t
                      <br />
                      be a daily barrier.
                    </h2>
                    <p>
                      Help turn “someone should fix this” into
                      <br className="desktop-only" /> a clear path forward.
                    </p>
                    <button onClick={() => navigate("routes")}>
                      Find a clear path <ArrowRight size={17} />
                    </button>
                  </div>
                  <div className="banner-art" aria-hidden="true">
                    <svg viewBox="0 0 420 230">
                      <path
                        d="M20 220V145Q20 105 75 105H280Q340 105 340 55V-10"
                        stroke="#375d46"
                        strokeWidth="86"
                        fill="none"
                      />
                      <path
                        d="M20 220V145Q20 105 75 105H280Q340 105 340 55V-10"
                        stroke="#d6ecab"
                        strokeWidth="47"
                        fill="none"
                      />
                      <path
                        d="M20 220V145Q20 105 75 105H280Q340 105 340 55V-10"
                        stroke="#fafce4"
                        strokeWidth="2"
                        strokeDasharray="6 9"
                        fill="none"
                      />
                      <g transform="translate(213 104)">
                        <circle r="28" fill="#f5f7e6" />
                        <path
                          d="M-10 0l7 7 14-16"
                          stroke="#375d46"
                          strokeWidth="4"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </g>
                      <g transform="translate(346 30)">
                        <path
                          d="M-13-2l13-14L13-2M0-15v32"
                          stroke="#244a39"
                          strokeWidth="4"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </g>
                      <circle cx="95" cy="35" r="19" fill="#638264" />
                      <circle cx="105" cy="32" r="13" fill="#7d9971" />
                      <circle cx="362" cy="191" r="31" fill="#3e654b" />
                      <circle cx="371" cy="185" r="24" fill="#4e7655" />
                      <path d="M143 183l4-11 4 11-11-7h15z" fill="#bdd68e" />
                    </svg>
                    <div className="floating-note">
                      <span>
                        <Check size={15} />
                      </span>
                      Better together. Barrier by barrier.
                    </div>
                  </div>
                </section>
                <section
                  className="stats-grid"
                  aria-label="Workspace report statistics"
                >
                  <Stat
                    label="Open barriers"
                    value={active.length}
                    icon={<TrafficCone size={19} />}
                    foot={`${active.filter((r) => r.priority === "High").length} high priority`}
                    tone="orange"
                  />
                  <Stat
                    label="Being worked on"
                    value={
                      state.reports.filter((r) => r.status === "In progress")
                        .length
                    }
                    icon={<Wrench size={19} />}
                    foot="A clear owner. A next step."
                    tone="blue"
                  />
                  <Stat
                    label="Ready to verify"
                    value={awaiting.length}
                    icon={<ShieldCheck size={19} />}
                    foot="A second look makes it count"
                    tone="yellow"
                  />
                  <Stat
                    label="Paths made clearer"
                    value={resolved.length}
                    icon={<CheckCheck size={19} />}
                    foot="Verified in this demo workspace"
                    tone="green"
                  />
                </section>
                <section className="overview-grid">
                  <div className="panel map-panel">
                    <div className="section-heading">
                      <div>
                        <h2>Your campus, at a glance</h2>
                        <p>Reported barriers, all in one place.</p>
                      </div>
                      <button
                        className="text-button"
                        onClick={() => navigate("routes")}
                      >
                        Explore routes <ArrowUpRight size={16} />
                      </button>
                    </div>
                    <CampusMap
                      reports={state.reports}
                      onReport={(r) => {
                        setSelected(r.id);
                        setError("");
                      }}
                    />
                  </div>
                  <div className="panel priorities">
                    <div className="section-heading">
                      <div>
                        <h2>A little attention, a big difference</h2>
                        <p>Start with what’s blocking the way.</p>
                      </div>
                    </div>
                    <div className="priority-list">
                      {visible
                        .filter((r) => r.status !== "Resolved")
                        .slice(0, 3)
                        .map((r) => (
                          <button
                            className="priority-item"
                            key={r.id}
                            onClick={() => {
                              setSelected(r.id);
                              setError("");
                            }}
                          >
                            <span
                              className={`priority-icon ${r.priority.toLowerCase()}`}
                            >
                              <TrafficCone size={19} />
                            </span>
                            <div>
                              <strong>{r.title}</strong>
                              <span>
                                <MapPin size={12} />
                                {nameOf(r.location)}
                              </span>
                              <small>
                                {r.priority} priority · {elapsed(r.createdAt)}
                              </small>
                            </div>
                            <ArrowUpRight size={16} />
                          </button>
                        ))}
                    </div>
                    <button
                      className="all-reports"
                      onClick={() => navigate("reports")}
                    >
                      View all reports <ArrowRight size={16} />
                    </button>
                  </div>
                </section>
                {ReportSection({ compact: true })}
              </>
            )}
            {view === "reports" && ReportSection({})}
            {view === "routes" && (
              <section className="route-layout">
                <div className="panel route-planner">
                  <div className="section-heading">
                    <div>
                      <span className="mini-icon">
                        <Route size={21} />
                      </span>
                      <h2>Where are you headed?</h2>
                      <p>Choose two places on the demo campus.</p>
                    </div>
                  </div>
                  <div className="route-form">
                    <label>
                      Starting point
                      <select
                        value={from}
                        onChange={(e) => {
                          setFrom(e.target.value);
                          setPlanned(false);
                        }}
                      >
                        {PLACES.map((p) => (
                          <option value={p.id} key={p.id}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="route-connector">•••</div>
                    <label>
                      Destination
                      <select
                        value={to}
                        onChange={(e) => {
                          setTo(e.target.value);
                          setPlanned(false);
                        }}
                      >
                        {PLACES.map((p) => (
                          <option value={p.id} key={p.id}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="check-row">
                      <input
                        type="checkbox"
                        checked={stepFree}
                        onChange={(e) => setStepFree(e.target.checked)}
                      />
                      <span>
                        <strong>Step-free paths only</strong>
                        <small>Avoid routes with steps</small>
                      </span>
                    </label>
                    <button
                      className="button primary full"
                      onClick={() => setPlanned(true)}
                    >
                      <Navigation size={17} />
                      Find my path
                    </button>
                  </div>
                  {planned && (
                    <div
                      className={`route-result ${route ? "" : "no-route"}`}
                      role="status"
                    >
                      {route ? (
                        <>
                          <span className="result-icon">
                            <Check size={20} />
                          </span>
                          <h3>
                            {route.distance === 0
                              ? "You’re already here"
                              : `${route.distance} m · ${Math.max(1, Math.ceil(route.distance / 60))} min estimate`}
                          </h3>
                          <p>
                            {stepFree ? "Step-free route" : "Route"} avoiding
                            currently reported barriers.
                          </p>
                          <ol>
                            {route.nodes.map((id, i) => (
                              <li key={id}>
                                <span>
                                  {i === 0
                                    ? "A"
                                    : i === route.nodes.length - 1
                                      ? "B"
                                      : i}
                                </span>
                                {nameOf(id)}
                              </li>
                            ))}
                          </ol>
                        </>
                      ) : (
                        <>
                          <TrafficCone size={28} />
                          <h3>No clear route found</h3>
                          <p>
                            All matching paths are currently blocked in this
                            demo. Try another destination or contact campus
                            facilities.
                          </p>
                        </>
                      )}
                    </div>
                  )}
                  <p className="map-disclaimer">
                    <Compass size={16} />
                    Illustrative routes on a fictional campus. Real navigation
                    needs surveyed paths and current, verified conditions.
                  </p>
                </div>
                <div className="panel route-map-panel">
                  <div className="section-heading">
                    <div>
                      <h2>Greenfield Campus</h2>
                      <p>
                        The route updates when a barrier is verified as
                        resolved.
                      </p>
                    </div>
                    <span className="small-tag">DEMO MAP</span>
                  </div>
                  <CampusMap
                    reports={state.reports}
                    route={route}
                    large
                    onReport={(r) => setSelected(r.id)}
                  />
                  <div className="route-map-footer">
                    <ShieldCheck size={18} />
                    <p>
                      Repairs stay on the map until an access champion verifies
                      the fix.
                    </p>
                  </div>
                </div>
              </section>
            )}
            {view === "impact" && (
              <>
                <section className="stats-grid">
                  <Stat
                    label="Total reports"
                    value={state.reports.length}
                    icon={<MessageSquare size={19} />}
                    foot="Created in this workspace"
                    tone="blue"
                  />
                  <Stat
                    label="Verified fixes"
                    value={resolved.length}
                    icon={<CheckCheck size={19} />}
                    foot="Confirmed by an access champion"
                    tone="green"
                  />
                  <Stat
                    label="Community support"
                    value={state.reports.reduce((s, r) => s + r.supports, 0)}
                    icon={<Users size={19} />}
                    foot="Support actions on reports"
                    tone="yellow"
                  />
                  <Stat
                    label="Resolution rate"
                    value={`${Math.round((resolved.length / Math.max(1, state.reports.length)) * 100)}%`}
                    icon={<TrendingUp size={19} />}
                    foot="Verified fixes / all reports"
                    tone="orange"
                  />
                </section>
                <div className="impact-grid">
                  <section className="panel">
                    <div className="section-heading">
                      <div>
                        <h2>Every step is on the record</h2>
                        <p>Report history from this sample workspace.</p>
                      </div>
                      <button className="button subtle" onClick={exportData}>
                        <ArrowDownToLine size={16} />
                        Export
                      </button>
                    </div>
                    <div className="timeline">
                      {state.activity.slice(0, 30).map((a) => (
                        <div className="timeline-item" key={a.id}>
                          <span className="timeline-dot">
                            <Check size={12} />
                          </span>
                          <div>
                            <strong>{a.message}</strong>
                            <p>
                              {roles[a.actor as Role] || a.actor} ·{" "}
                              {elapsed(a.at)}
                            </p>
                            {state.reports.some((r) => r.id === a.reportId) && (
                              <button
                                className="text-button"
                                onClick={() => setSelected(a.reportId)}
                              >
                                Open report <ArrowUpRight size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section className="panel breakdown">
                    <div className="section-heading">
                      <div>
                        <h2>What needs attention?</h2>
                        <p>Open reports by type of barrier.</p>
                      </div>
                    </div>
                    {["Ramp", "Lift", "Pathway", "Entrance", "Lighting"].map(
                      (category) => {
                        const n = active.filter(
                          (r) => r.category === category,
                        ).length;
                        return (
                          <div className="bar-item" key={category}>
                            <div>
                              <span>{category}</span>
                              <strong>{n}</strong>
                            </div>
                            <div className="bar-track">
                              <i
                                style={{
                                  width: `${(n / Math.max(1, active.length)) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      },
                    )}
                    <div className="impact-note">
                      <Leaf size={23} />
                      <h3>Measured, not imagined.</h3>
                      <p>
                        These numbers come from sample workspace records. They
                        do not represent real repairs or real-world impact.
                      </p>
                    </div>
                  </section>
                </div>
              </>
            )}
            <footer className="workspace-footer">
              <span>
                <span className="live-dot" />
                {mode} · {ready ? "Changes saved automatically" : "Connecting…"}
              </span>
              <button onClick={() => setShowAbout(true)}>
                Made for access. Built with care. <ArrowUpRight size={13} />
              </button>
            </footer>
          </main>
        </div>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
      {showNew && (
        <NewReport
          onClose={() => {
            setShowNew(false);
            setError("");
          }}
          onSubmit={async (payload) => {
            const success = await action(
              { type: "create", payload },
              "Barrier reported. Your campus map has been updated.",
            );
            if (success) setShowNew(false);
          }}
          busy={busy}
          error={error}
          reports={state.reports}
        />
      )}
      {report && (
        <Modal
          title="A clearer path starts here"
          onClose={() => {
            setSelected(null);
            setError("");
            setNote("");
          }}
        >
          <div className="report-detail">
            <div className="detail-topline">
              <span
                className={`priority-label ${report.priority.toLowerCase()}`}
              >
                {report.priority} priority
              </span>
              <Status status={report.status} />
            </div>
            <h3>{report.title}</h3>
            <p className="detail-location">
              <MapPin size={16} />
              {nameOf(report.location)}
              <span>·</span>
              {report.category}
            </p>
            <p className="detail-description">{report.description}</p>
            <div className="detail-facts">
              <div>
                <small>REPORTED</small>
                <strong>{elapsed(report.createdAt)}</strong>
              </div>
              <div>
                <small>ASSIGNED TO</small>
                <strong>{report.assignee || "Needs an owner"}</strong>
              </div>
              <div>
                <small>COMMUNITY</small>
                <strong>{report.supports} supporting</strong>
              </div>
            </div>
            <div className="progress-steps">
              {[
                "Reported",
                "In progress",
                "Awaiting verification",
                "Resolved",
              ].map((s, i) => (
                <div
                  key={s}
                  className={
                    [
                      "Reported",
                      "In progress",
                      "Awaiting verification",
                      "Resolved",
                    ].indexOf(report.status) >= i
                      ? "done"
                      : ""
                  }
                >
                  <span>
                    {report.status === s ? (
                      <span className="live-dot" />
                    ) : (
                      <Check size={12} />
                    )}
                  </span>
                  <small>
                    {s === "Awaiting verification"
                      ? "Verify"
                      : s === "In progress"
                        ? "Repair"
                        : s}
                  </small>
                </div>
              ))}
            </div>
            {report.repairNote && (
              <div className="repair-note">
                <ShieldCheck size={18} />
                <div>
                  <strong>Repair note</strong>
                  <p>{report.repairNote}</p>
                </div>
              </div>
            )}
            {report.verificationNote && (
              <div className="repair-note">
                <CheckCheck size={18} />
                <div>
                  <strong>Verification evidence</strong>
                  <p>{report.verificationNote}</p>
                </div>
              </div>
            )}
            {error && (
              <div className="error" role="alert">
                {error}
              </div>
            )}
            <div className="detail-actions">
              {report.status !== "Resolved" && principal.role === "student" && (
                <button
                  disabled={
                    busy || !ready || report.supporters?.includes(principal.id)
                  }
                  className="button subtle"
                  onClick={() =>
                    action(
                      {
                        type: "support",
                        id: report.id,
                        version: report.version,
                      },
                      "Your support has been added.",
                    )
                  }
                >
                  <ThumbsUp size={16} />
                  {report.supporters?.includes(principal.id)
                    ? "You’re supporting this"
                    : "This affects me too"}
                </button>
              )}
              {principal.role === "facilities" &&
                report.status === "Reported" && (
                  <button
                    className="button primary"
                    disabled={busy}
                    onClick={() =>
                      action(
                        {
                          type: "start",
                          id: report.id,
                          version: report.version,
                          payload: { assignee: "Facilities team" },
                        },
                        "Repair started. Facilities owns the next step.",
                      )
                    }
                  >
                    <Wrench size={16} />
                    Start repair
                  </button>
                )}
              {((principal.role === "facilities" &&
                report.status === "In progress") ||
                (principal.role === "verifier" &&
                  report.status === "Awaiting verification")) && (
                <div className="verification-form">
                  <label htmlFor="repair-note">
                    {principal.role === "facilities"
                      ? "What was repaired?"
                      : "What did you verify?"}
                  </label>
                  <textarea
                    id="repair-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={1000}
                    placeholder={
                      principal.role === "facilities"
                        ? "Describe the work completed and anything the verifier should check."
                        : "Confirm the path is clear and describe what you checked."
                    }
                  />
                  <button
                    className="button primary full"
                    disabled={busy || note.trim().length < 12}
                    onClick={() =>
                      action(
                        {
                          type:
                            principal.role === "facilities"
                              ? "repair"
                              : "verify",
                          id: report.id,
                          version: report.version,
                          payload: { note },
                        },
                        principal.role === "facilities"
                          ? "Repair recorded. Waiting for independent verification."
                          : "Fix verified. The path is available again.",
                      )
                    }
                  >
                    <ShieldCheck size={17} />
                    {principal.role === "facilities"
                      ? "Send for verification"
                      : "Verify & reopen path"}
                  </button>
                  {principal.role === "verifier" && (
                    <button
                      className="button subtle full"
                      disabled={busy || note.trim().length < 12}
                      onClick={() =>
                        action(
                          {
                            type: "reopen",
                            id: report.id,
                            version: report.version,
                            payload: { note },
                          },
                          "Sent back for more work. The path stays blocked.",
                        )
                      }
                    >
                      <Wrench size={16} />
                      Needs more work
                    </button>
                  )}
                </div>
              )}
              {report.status === "Resolved" &&
                (principal.role === "verifier" ||
                  principal.id === report.reporter) && (
                  <button
                    className="button subtle"
                    disabled={busy}
                    onClick={() =>
                      action(
                        {
                          type: "reopen",
                          id: report.id,
                          version: report.version,
                          payload: {
                            note: "Barrier reported again after a previous fix.",
                          },
                        },
                        "Report reopened. This path is excluded again.",
                      )
                    }
                  >
                    <TrafficCone size={16} />
                    Barrier has returned
                  </button>
                )}
            </div>
            <div className="policy-note">
              <ShieldCheck size={15} />
              <span>
                {roles[principal.role]} demo role · {storageMode()}
              </span>
            </div>
            <p className="detail-tip">
              Switch the demo role in the top bar to explore reporting,
              facilities repairs, and independent verification.
            </p>
          </div>
        </Modal>
      )}
      {showAbout && (
        <Modal
          title="Access is a shared responsibility."
          wide
          onClose={() => setShowAbout(false)}
        >
          <div className="about-content">
            <span className="about-logo">
              <Route size={32} />
            </span>
            <h3>Meet ClearPath.</h3>
            <p>
              A campus accessibility repair desk that connects a reported
              barrier, the people fixing it, and the route someone needs today.
            </p>
            <div className="about-steps">
              <div>
                <MessageSquare />
                <strong>1. Report</strong>
                <p>
                  Tie a barrier to a campus path, so the report has a place and
                  a purpose.
                </p>
              </div>
              <div>
                <Wrench />
                <strong>2. Repair</strong>
                <p>
                  Give it an owner and record the work. A marked repair still
                  stays blocked.
                </p>
              </div>
              <div>
                <ShieldCheck />
                <strong>3. Verify</strong>
                <p>
                  An access champion checks the fix before routing uses that
                  path again.
                </p>
              </div>
            </div>
            <h4>AWS, doing real work</h4>
            <p>
              The AWS open-source Cedar policy engine evaluates who may perform
              each action. The backend enforces those decisions, isolates demo
              workspaces, and stores reports. The browser-only demo runs the
              same policies locally; its role switch is a demonstration, not a
              security boundary.
            </p>
            <div className="cedar-status">
              <ShieldCheck size={19} />
              <div>
                <strong>{lastDecision}</strong>
                <small>{storageMode()}</small>
              </div>
            </div>
            <h4>Built on a real need. Demonstrated with sample data.</h4>
            <p>
              UGC’s accessibility guidelines discuss accessible campus mapping,
              maintenance, and grievance handling. This prototype connects those
              tasks. Greenfield Campus, its reports, people, distances, and
              repairs are fictional. The map is not for real navigation.
            </p>
            <a
              href="https://www.ugc.gov.in/pdfnews/8572354_Final-Accessibility-Guidelines.pdf"
              target="_blank"
              rel="noreferrer"
            >
              Read the UGC accessibility guidelines <ArrowUpRight size={14} />
            </a>
            <p className="disclosure">
              Created for First Commit 2026. AI-assisted implementation using
              OpenAI Codex. React, Lucide, Cedar and AWS SDK are credited in the
              project repository.
            </p>
          </div>
        </Modal>
      )}
    </>
  );
  function ReportSection({ compact = false }: { compact?: boolean }) {
    return (
      <section className="panel reports-panel">
        <div className="section-heading">
          <div>
            <h2>
              {compact ? "The next step is a small one." : "Barrier reports"}{" "}
              <span className="count-badge">{state.reports.length}</span>
            </h2>
            <p>
              {compact
                ? "Your community’s reports. Your campus, getting better."
                : "Search, support, and follow each report through to a verified fix."}
            </p>
          </div>
          <button className="button subtle export-button" onClick={exportData}>
            <ArrowDownToLine size={16} />
            Export
          </button>
        </div>
        <div className="report-toolbar">
          <div className="filter-tabs" role="group" aria-label="Filter reports">
            {[
              "All reports",
              "Reported",
              "In progress",
              "Awaiting verification",
              "Resolved",
            ].map((s) => (
              <button
                className={filter === s ? "selected" : ""}
                key={s}
                onClick={() => setFilter(s)}
              >
                {s === "Awaiting verification" ? "To verify" : s}
              </button>
            ))}
          </div>
          <label className="search-box">
            <Search size={16} />
            <input
              aria-label="Search reports"
              placeholder="Search reports…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
        <div className="report-table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th>REPORT</th>
                <th>LOCATION</th>
                <th>PRIORITY</th>
                <th>STATUS</th>
                <th>SUPPORT</th>
                <th>
                  <span className="sr-only">Open report</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.slice(0, compact ? 4 : 200).map((r) => (
                <tr key={r.id}>
                  <td>
                    <button
                      className="table-title"
                      onClick={() => {
                        setSelected(r.id);
                        setError("");
                      }}
                    >
                      <span
                        className={`report-type-icon ${r.category.toLowerCase()}`}
                      >
                        {r.category === "Lift" ? (
                          <Wrench size={19} />
                        ) : r.category === "Pathway" ? (
                          <Footprints size={19} />
                        ) : (
                          <TrafficCone size={19} />
                        )}
                      </span>
                      <span>
                        <strong>{r.title}</strong>
                        <small>
                          {r.category} · {elapsed(r.createdAt)}
                        </small>
                      </span>
                    </button>
                  </td>
                  <td>
                    <span className="location-cell">
                      <MapPin size={13} />
                      {nameOf(r.location)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`priority-label ${r.priority.toLowerCase()}`}
                    >
                      <i />
                      {r.priority}
                    </span>
                  </td>
                  <td>
                    <Status status={r.status} />
                  </td>
                  <td>
                    <span className="support-count">
                      <Users size={14} />
                      {r.supports}
                    </span>
                  </td>
                  <td>
                    <button
                      className="icon-button"
                      aria-label={`View ${r.title}`}
                      onClick={() => {
                        setSelected(r.id);
                        setError("");
                      }}
                    >
                      <ArrowUpRight size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && (
            <div className="empty-state">
              <Search size={28} />
              <h3>No reports found</h3>
              <p>
                Try another search or filter. A clearer path starts with one
                report.
              </p>
              <button
                className="text-button"
                onClick={() => {
                  setQuery("");
                  setFilter("All reports");
                }}
              >
                Clear filters <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
        <div className="table-footer">
          <span>
            Showing {Math.min(visible.length, compact ? 4 : 200)} of{" "}
            {visible.length} matching reports
          </span>
          {compact ? (
            <button className="text-button" onClick={() => navigate("reports")}>
              View all reports <ArrowRight size={15} />
            </button>
          ) : (
            <span>
              <ListFilter size={13} /> Highest priority first
            </span>
          )}
        </div>
      </section>
    );
  }
}
function Stat({
  label,
  value,
  icon,
  foot,
  tone,
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
  foot: string;
  tone: string;
}) {
  return (
    <article className="stat-card">
      <div>
        <span>{label}</span>
        <span className={`stat-icon ${tone}`}>{icon}</span>
      </div>
      <strong>{value.toString().padStart(2, "0")}</strong>
      <p>
        {tone === "green" ? (
          <TrendingUp size={13} />
        ) : (
          <span className={`stat-dot ${tone}`} />
        )}{" "}
        {foot}
      </p>
    </article>
  );
}
function NewReport({
  onClose,
  onSubmit,
  busy,
  error,
  reports,
}: {
  onClose: () => void;
  onSubmit: (p: Record<string, unknown>) => void;
  busy: boolean;
  error: string;
  reports: Report[];
}) {
  const [location, setLocation] = useState(PLACES[0]?.id || ""),
    [edgeId, setEdgeId] = useState(""),
    [category, setCategory] = useState("Ramp"),
    [title, setTitle] = useState(""),
    [description, setDescription] = useState(""),
    [priority, setPriority] = useState("High");
  const available = EDGES.filter(
    (e) => e.from === location || e.to === location,
  );
  useEffect(() => {
    setEdgeId(available[0]?.id || "");
  }, [location]);
  const duplicates = reports.filter(
    (r) =>
      r.status !== "Resolved" && r.edgeId === edgeId && r.category === category,
  );
  function submit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      location,
      edgeId,
      category,
      priority,
    });
  }
  return (
    <Modal title="Let’s clear the way." onClose={onClose}>
      <form className="report-form" onSubmit={submit}>
        <p className="form-intro">
          Tell us what’s getting in the way. A good report helps the right
          people take action.
        </p>
        <div className="sample-notice">
          <Sparkles size={16} />
          Demo workspace — please use sample details only.
        </div>
        <label>
          What’s the barrier?
          <input
            autoFocus
            minLength={6}
            maxLength={100}
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Library ramp blocked by parked bicycles"
          />
        </label>
        <div className="form-columns">
          <label>
            Location
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              {PLACES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Barrier type
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {["Ramp", "Lift", "Pathway", "Entrance", "Lighting"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Affected path
          <select
            value={edgeId}
            onChange={(e) => setEdgeId(e.target.value)}
            required
          >
            {available.map((e) => (
              <option key={e.id} value={e.id}>
                {nameOf(e.from)} ↔ {nameOf(e.to)}
              </option>
            ))}
          </select>
        </label>
        {duplicates.length > 0 && (
          <div className="duplicate-note">
            <MessageSquare size={17} />
            <span>
              {duplicates.length} open {category.toLowerCase()} report already
              exists on this path. Check the report list first if it’s the same
              barrier.
            </span>
          </div>
        )}
        <label>
          What should the team know?
          <textarea
            minLength={15}
            maxLength={1000}
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue, where to find it, and how it affects access. Avoid personal information."
          />
        </label>
        <fieldset>
          <legend>How much does it affect access?</legend>
          <div className="priority-options">
            {[
              ["High", "No usable access"],
              ["Medium", "A difficult detour"],
              ["Low", "Access could improve"],
            ].map(([p, desc]) => (
              <label key={p} className={priority === p ? "chosen" : ""}>
                <input
                  type="radio"
                  name="priority"
                  value={p}
                  checked={priority === p}
                  onChange={() => setPriority(p)}
                />
                <strong>{p}</strong>
                <small>{desc}</small>
              </label>
            ))}
          </div>
        </fieldset>
        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}
        <div className="form-footer">
          <button type="button" className="button subtle" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button primary" disabled={busy}>
            {busy ? "Saving report…" : "Submit report"}
            <ArrowRight size={17} />
          </button>
        </div>
      </form>
    </Modal>
  );
}
