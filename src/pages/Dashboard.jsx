import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { API_URL, getHeaders, fetchAllPages } from "@/services/api";
import { getMyTasks } from "@/services/taskService";
import { getClients } from "@/services/clientService";
import { getCohorts } from "@/services/cohortService";
import { Modal } from "../components/Modal";
import { Magnet, Building2, Receipt, Laptop, ArrowUpRight, ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";

const fetchCount = async (endpoint) => {
    const res = await fetch(`${API_URL}/${endpoint}/?page_size=1`, { headers: getHeaders() });
    if (!res.ok) return null;
    const data = await res.json();
    return data.count ?? null;
};

const CARD_ACCENTS = {
    Leads:    { bar: "var(--c-cta)", badge: { bg: "var(--c-cta-pale)", text: "var(--c-ink)" }, link: "var(--c-cta)", icon: { bg: "var(--c-cta)" } },
    Clients:  { bar: "var(--c-brand)", badge: { bg: "var(--c-brand-pale)", text: "var(--c-brand)" }, link: "var(--c-brand)", icon: { bg: "var(--c-brand)" } },
    Invoices: { bar: "var(--c-accent)", badge: { bg: "var(--c-accent-pale)", text: "var(--c-brand)" }, link: "var(--c-accent)", icon: { bg: "var(--c-accent)" } },
    Assets:   { bar: "var(--c-border)", badge: { bg: "var(--c-surface-2)", text: "var(--c-muted)" }, link: "var(--c-muted)", icon: { bg: "var(--c-muted)" } },
};

const TASK_COLORS = {
    lead:    { dot: "var(--c-brand)", bg: "var(--c-brand-pale)", text: "var(--c-brand)", label: "Lead" },
    client:  { dot: "#3B82F6", bg: "color-mix(in srgb, #3B82F6 18%, transparent)", text: "var(--c-ink)", label: "Client" },
    service: { dot: "#7C3AED", bg: "color-mix(in srgb, #7C3AED 18%, transparent)", text: "var(--c-ink)", label: "Service" },
};

const ENTITY_PATHS = { lead: "/lead", client: "/client", service: "/service" };

// Single source of truth for a task row — used by both the calendar's
// "Selected day" panel and the Tasks-KPI modals (#65), so the two never
// visually drift apart. `navigate` decides what a click does; the modal
// version wraps it to also close the modal.
const TaskRow = ({ task, navigate }) => {
    const colors = TASK_COLORS[task.entity_type];
    const path = `${ENTITY_PATHS[task.entity_type]}/${task.entity_id}`;
    return (
        <div
            onClick={() => navigate(path)}
            className="px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
            style={{ backgroundColor: "var(--c-hover)" }}
        >
            <span
                className="mt-0.5 shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: colors.bg, color: colors.text }}
            >
                {colors.label}
            </span>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--c-ink)" }}>{task.task}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--c-hint)" }}>{task.entity_name}</p>
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "var(--c-hint)" }} />
        </div>
    );
};

// Opens from a Tasks-KPI card — shows every pending task for that entity
// type assigned to the logged-in user (same data already loaded via
// getMyTasks(), just filtered by entity_type — no new request), same row
// style as the calendar's day panel but without the date filter.
const TaskListModal = ({ isOpen, entityType, tasks, onClose, navigate }) => {
    const colors = TASK_COLORS[entityType];
    const title = colors ? `${colors.label} Tasks` : "Tasks";

    const goToTask = (path) => {
        onClose();
        navigate(path);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            {tasks.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: "var(--c-hint)" }}>
                    No pending tasks assigned to you.
                </p>
            ) : (
                <div className="rounded-lg overflow-hidden divide-y divide-gray-100" style={{ border: "1px solid var(--c-border)" }}>
                    {tasks.map(task => (
                        <TaskRow key={task.id} task={task} navigate={goToTask} />
                    ))}
                </div>
            )}
            {entityType && ENTITY_PATHS[entityType] && (
                <button
                    onClick={() => goToTask(ENTITY_PATHS[entityType])}
                    className="mt-4 flex items-center gap-1.5 text-xs font-semibold hover:gap-2.5 transition-all cursor-pointer"
                    style={{ color: colors?.text ?? "var(--c-brand)" }}
                >
                    <span>View all {colors?.label}s</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
            )}
        </Modal>
    );
};

const StatCard = ({ title, count, icon: Icon, href, loading, navigate }) => {
    const accent = CARD_ACCENTS[title] ?? CARD_ACCENTS.Assets;
    return (
        <div
            className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
            style={{ backgroundColor: "var(--c-surface-2)", border: "1px solid var(--c-border)", borderRadius: "8px", boxShadow: "0 1px 3px rgba(30,47,74,0.06)" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 24px rgba(30,47,74,0.12)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(30,47,74,0.06)"}
            onClick={() => navigate(href)}
        >
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: accent.bar }} />
            <div className="relative p-6 flex flex-col gap-5 pt-7">
                <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: accent.icon.bg }}>
                        <Icon className="h-5 w-5" style={{ color: "var(--c-on-dark)" }} />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: accent.badge.bg, color: accent.badge.text, border: `1px solid color-mix(in srgb, ${accent.bar} 19%, transparent)` }}>
                        Active
                    </span>
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "var(--c-muted)", fontFamily: 'var(--font-body)' }}>
                        {title}
                    </p>
                    {loading ? (
                        <div className="h-10 w-24 rounded animate-pulse" style={{ backgroundColor: "var(--c-border)" }} />
                    ) : (
                        <span className="text-4xl font-bold" style={{ color: "var(--c-ink)", fontFamily: 'var(--font-body)', letterSpacing: "-0.02em" }}>
                            {count ?? "—"}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold pt-3 group-hover:gap-2.5 transition-all"
                    style={{ color: accent.link, borderTop: "1px solid var(--c-border)", fontFamily: 'var(--font-body)' }}>
                    <span>View all</span>
                    <ArrowUpRight className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                </div>
            </div>
        </div>
    );
};

const TaskKpiCard = ({ title, count, color, entityKey, onOpenModal, loading }) => (
    <div
        className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
        style={{ backgroundColor: "var(--c-surface-2)", border: "1px solid var(--c-border)", borderRadius: "8px", boxShadow: "0 1px 3px rgba(30,47,74,0.06)" }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 24px rgba(30,47,74,0.12)"}
        onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(30,47,74,0.06)"}
        onClick={() => onOpenModal(entityKey)}
    >
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: color.dot }} />
        <div className="relative p-5 flex flex-col gap-4 pt-6">
            <div className="flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: color.dot }}>
                    <ClipboardList className="h-4 w-4" style={{ color: "var(--c-on-dark)" }} />
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: color.bg, color: color.text }}>
                    Pending
                </span>
            </div>
            <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--c-muted)", fontFamily: 'var(--font-body)' }}>
                    {title}
                </p>
                {loading ? (
                    <div className="h-9 w-16 rounded animate-pulse" style={{ backgroundColor: "var(--c-border)" }} />
                ) : (
                    <span className="text-3xl font-bold" style={{ color: "var(--c-ink)", fontFamily: 'var(--font-body)', letterSpacing: "-0.02em" }}>
                        {count}
                    </span>
                )}
            </div>
        </div>
    </div>
);

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const normalizeDate = (dateStr) => {
    if (!dateStr) return null;
    try {
        return new Date(dateStr).toISOString().slice(0, 10);
    } catch {
        return null;
    }
};

const TaskCalendar = ({ tasks, navigate }) => {
    const today = new Date();
    const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });
    const [selectedDay, setSelectedDay] = useState(null);

    const prevMonth = () => setCurrent(c => {
        const d = new Date(c.year, c.month - 1, 1);
        return { year: d.getFullYear(), month: d.getMonth() };
    });

    const nextMonth = () => setCurrent(c => {
        const d = new Date(c.year, c.month + 1, 1);
        return { year: d.getFullYear(), month: d.getMonth() };
    });

    // Build calendar grid
    const firstDay = new Date(current.year, current.month, 1);
    const lastDay = new Date(current.year, current.month + 1, 0);
    // Monday-based: 0=Mon ... 6=Sun
    const startOffset = (firstDay.getDay() + 6) % 7;
    const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;

    const cells = Array.from({ length: totalCells }, (_, i) => {
        const dayNum = i - startOffset + 1;
        if (dayNum < 1 || dayNum > lastDay.getDate()) return null;
        const dateStr = `${current.year}-${String(current.month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        const dayTasks = tasks.filter(t => normalizeDate(t.date) === dateStr);
        return { dayNum, dateStr, tasks: dayTasks };
    });

    const todayStr = today.toISOString().slice(0, 10);
    const selectedTasks = selectedDay ? tasks.filter(t => normalizeDate(t.date) === selectedDay) : [];

    return (
        <div className="rounded-xl p-5" style={{ backgroundColor: "var(--c-surface-2)", border: "1px solid var(--c-border)" }}>

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold" style={{ color: "var(--c-ink)", fontFamily: 'var(--font-body)' }}>
                    {MONTHS[current.month]} {current.year}
                </h3>
                <div className="flex gap-1">
                    <button onClick={prevMonth} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-[var(--c-border)] transition-colors cursor-pointer">
                        <ChevronLeft className="h-4 w-4" style={{ color: "var(--c-muted)" }} />
                    </button>
                    <button onClick={nextMonth} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-[var(--c-border)] transition-colors cursor-pointer">
                        <ChevronRight className="h-4 w-4" style={{ color: "var(--c-muted)" }} />
                    </button>
                </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
                {DAYS.map(d => (
                    <div key={d} className="text-center text-xs font-semibold uppercase tracking-widest py-1" style={{ color: "var(--c-hint)" }}>
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px" style={{ backgroundColor: "var(--c-border)", borderRadius: "8px", overflow: "hidden" }}>
                {cells.map((cell, i) => {
                    if (!cell) return (
                        <div key={i} className="py-2 px-1 min-h-[52px]" style={{ backgroundColor: "var(--c-surface-2)", opacity: 0.4 }} />
                    );

                    const isToday = cell.dateStr === todayStr;
                    const isSelected = cell.dateStr === selectedDay;
                    const hasTasks = cell.tasks.length > 0;

                    const typesInDay = [...new Set(cell.tasks.map(t => t.entity_type))];

                    return (
                        <div
                            key={i}
                            onClick={() => hasTasks && setSelectedDay(isSelected ? null : cell.dateStr)}
                            className="py-2 px-1 min-h-[52px] flex flex-col items-center gap-1 transition-colors"
                            style={{
                                backgroundColor: isSelected ? "var(--c-brand-pale)" : "var(--c-surface-2)",
                                cursor: hasTasks ? "pointer" : "default",
                            }}
                            onMouseEnter={e => hasTasks && !isSelected && (e.currentTarget.style.backgroundColor = "var(--c-surface-2)")}
                            onMouseLeave={e => hasTasks && !isSelected && (e.currentTarget.style.backgroundColor = "var(--c-surface-2)")}
                        >
                            <span
                                className="text-xs font-semibold h-6 w-6 flex items-center justify-center rounded-full"
                                style={{
                                    color: isToday ? "var(--c-on-dark)" : "var(--c-ink)",
                                    backgroundColor: isToday ? "var(--c-brand)" : "transparent",
                                    fontFamily: 'var(--font-body)',
                                }}
                            >
                                {cell.dayNum}
                            </span>
                            {/* Dots */}
                            {typesInDay.length > 0 && (
                                <div className="flex gap-0.5">
                                    {typesInDay.map(type => (
                                        <span
                                            key={type}
                                            className="h-1.5 w-1.5 rounded-full"
                                            style={{ backgroundColor: TASK_COLORS[type]?.dot }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Selected day task panel */}
            {selectedDay && selectedTasks.length > 0 && (
                <div className="mt-4 rounded-lg overflow-hidden" style={{ border: "1px solid var(--c-border)" }}>
                    <div className="px-4 py-2.5 flex items-center justify-between" style={{ backgroundColor: "var(--c-surface-2)", borderBottom: "1px solid var(--c-border)" }}>
                        <span className="text-xs font-semibold" style={{ color: "var(--c-ink)" }}>
                            Tasks for {new Date(selectedDay + 'T00:00:00').toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                        </span>
                        <button onClick={() => setSelectedDay(null)} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {selectedTasks.map(task => (
                            <TaskRow key={task.id} task={task} navigate={navigate} />
                        ))}
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="flex gap-4 mt-3">
                {Object.entries(TASK_COLORS).map(([type, colors]) => (
                    <div key={type} className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.dot }} />
                        <span className="text-xs" style={{ color: "var(--c-hint)" }}>{colors.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Pipeline report ────────────────────────────────────────────────────────

const STAGE_PALETTE = ["var(--c-brand)", "var(--c-cta)", "var(--c-accent)", "var(--c-brand)", "var(--c-hint)", "var(--c-border)", "var(--c-muted)"];

const PipelineReportCard = ({ pipeline }) => {
    const maxCount = Math.max(...pipeline.orderedStages.map(s => pipeline.byStage[s] || 0), 1);
    return (
        <div style={{ backgroundColor: "var(--c-surface-2)", border: "1px solid var(--c-border)", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(30,47,74,0.06)" }}>
            <div style={{ borderBottom: "1px solid var(--c-border)", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--c-ink)", fontFamily: 'var(--font-body)', margin: 0 }}>
                    {pipeline.name}
                </p>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--c-brand)", backgroundColor: "var(--c-brand-pale)", border: "1px solid var(--c-accent)", borderRadius: 99, padding: "2px 10px" }}>
                    {pipeline.total} lead{pipeline.total !== 1 ? "s" : ""}
                </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                {/* By stage */}
                <div style={{ padding: "16px 20px", borderRight: "1px solid var(--c-border)" }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "var(--c-hint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, fontFamily: 'var(--font-body)' }}>
                        By Stage
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {pipeline.orderedStages.map((stage, i) => {
                            const count = pipeline.byStage[stage] || 0;
                            const pct = Math.round((count / maxCount) * 100);
                            const color = STAGE_PALETTE[i % STAGE_PALETTE.length];
                            return (
                                <div key={stage}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                        <span style={{ fontSize: 12, color: "var(--c-ink)", fontFamily: 'var(--font-body)' }}>{stage}</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--c-ink)", fontFamily: 'var(--font-body)' }}>{count}</span>
                                    </div>
                                    <div style={{ height: 7, backgroundColor: "var(--c-skeleton)", borderRadius: 4 }}>
                                        <div style={{ height: 7, width: `${pct}%`, backgroundColor: color, borderRadius: 4, transition: "width 0.5s ease" }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* By responsible */}
                <div style={{ padding: "16px 20px" }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "var(--c-hint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, fontFamily: 'var(--font-body)' }}>
                        By Responsible
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {pipeline.orderedUsers.map(([userName, data]) => (
                            <div key={userName} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                <div style={{ width: 26, height: 26, borderRadius: "50%", backgroundColor: "var(--c-brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--c-on-dark)" }}>
                                        {userName.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                        <span style={{ fontSize: 12, color: "var(--c-ink)", fontFamily: 'var(--font-body)', overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {userName}
                                        </span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--c-ink)", fontFamily: 'var(--font-body)', marginLeft: 8, flexShrink: 0 }}>
                                            {data.total}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                        {Object.entries(data.stages).sort((a, b) => pipeline.orderedStages.indexOf(a[0]) - pipeline.orderedStages.indexOf(b[0])).map(([stage, count]) => {
                                            const idx = pipeline.orderedStages.indexOf(stage);
                                            const color = idx >= 0 ? STAGE_PALETTE[idx % STAGE_PALETTE.length] : "var(--c-hint)";
                                            return (
                                                <span key={stage} style={{ fontSize: 10, color: "#fff", backgroundColor: color, borderRadius: 3, padding: "1px 6px", fontFamily: 'var(--font-body)', whiteSpace: "nowrap" }}>
                                                    {stage} · {count}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ────────────────────────────────────────────────────────────────────────────

// Reads the real permission list the backend sent at login (same source PermissionGuard uses).
const userPermissions = () => {
    try {
        return JSON.parse(localStorage.getItem("user_permissions") || "[]");
    } catch {
        return [];
    }
};

export const Dashboard = () => {
    const { user } = useAuth();
    const can = (model) => userPermissions().includes(`app.view_${model}`);
    const navigate = useNavigate();
    const [counts, setCounts] = useState({ leads: null, clients: null, invoices: null, assets: null });
    const [loading, setLoading] = useState(true);
    const [taskData, setTaskData] = useState({ totals: { leads: 0, clients: 0, services: 0 }, tasks: [] });
    const [tasksLoading, setTasksLoading] = useState(true);
    const [pipelineReport, setPipelineReport] = useState([]);
    const [reportLoading, setReportLoading] = useState(true);
    // Raw data behind the "Leads by Pipeline" report, kept as-is so the
    // Client/Cohort filters below can recompute byStage/byUser client-side
    // without re-fetching every lead on every filter change.
    const [reportRaw, setReportRaw] = useState({ pipelines: [], leads: [], userMap: {} });
    const [reportClients, setReportClients] = useState([]);
    const [reportCohorts, setReportCohorts] = useState([]);
    const [reportClientFilter, setReportClientFilter] = useState("");
    const [reportCohortFilter, setReportCohortFilter] = useState("");
    const [openTaskModal, setOpenTaskModal] = useState(null); // 'lead' | 'client' | 'service' | null

    useEffect(() => {
        const load = async () => {
            // Only ask for the counts this user is allowed to see (no pointless 403s).
            const skip = () => Promise.reject(new Error("no permission"));
            const [leads, clients, invoices, assets] = await Promise.allSettled([
                can("lead") ? fetchCount("leads") : skip(),
                can("client") ? fetchCount("clients") : skip(),
                can("invoice") ? fetchCount("invoices") : skip(),
                can("asset") ? fetchCount("assets") : skip(),
            ]);
            setCounts({
                leads:    leads.status    === "fulfilled" ? leads.value    : null,
                clients:  clients.status  === "fulfilled" ? clients.value  : null,
                invoices: invoices.status === "fulfilled" ? invoices.value : null,
                assets:   assets.status   === "fulfilled" ? assets.value   : null,
            });
            setLoading(false);
        };
        load();
    }, []);

    useEffect(() => {
        const loadReport = async () => {
            if (!can("lead") || !can("pipeline")) {
                setReportLoading(false);
                return;
            }
            try {
                const [pipelines, leads, users, clients, cohorts] = await Promise.all([
                    fetchAllPages(`${API_URL}/pipelines/`, { headers: getHeaders() }),
                    fetchAllPages(`${API_URL}/leads/`, { headers: getHeaders() }),
                    fetchAllPages(`${API_URL}/sales/`, { headers: getHeaders() }),
                    getClients().catch(() => []),
                    getCohorts().catch(() => []),
                ]);

                const userMap = {};
                users.forEach(u => {
                    userMap[u.id] = u.name || u.username || "Unassigned";
                });

                setReportRaw({ pipelines, leads, userMap });
                setReportClients(clients || []);
                setReportCohorts(cohorts.results || cohorts || []);
            } catch (e) {
                console.error("Error loading pipeline report", e);
            } finally {
                setReportLoading(false);
            }
        };
        loadReport();
    }, []);

    // Recomputes byStage/byUser from the raw leads already in memory whenever
    // the Client/Cohort filters change — no re-fetch needed (see reportRaw).
    useEffect(() => {
        const { pipelines, leads, userMap } = reportRaw;
        if (!pipelines.length) {
            setPipelineReport([]);
            return;
        }

        const selectedCohort = reportCohorts.find(c => String(c.id) === String(reportCohortFilter));

        const filteredLeads = leads.filter(l => {
            if (reportClientFilter) {
                const clientId = typeof l.possible_client === "object" ? l.possible_client?.id : l.possible_client;
                if (String(clientId || "") !== String(reportClientFilter)) return false;
            }
            if (selectedCohort) {
                if (!l.moodle_course_id || l.moodle_course_id !== selectedCohort.moodle_course_id) return false;
            }
            return true;
        });

        const report = pipelines.map(pipeline => {
            const pipelineLeads = filteredLeads.filter(l => {
                const pId = typeof l.pipeline === "object" ? l.pipeline?.id : l.pipeline;
                return String(pId) === String(pipeline.id);
            });
            if (pipelineLeads.length === 0) return null;

            const stageOrder = [...(pipeline.stages || [])].sort((a, b) => a.order - b.order).map(s => s.name);

            const byStage = {};
            const byUser = {};
            pipelineLeads.forEach(l => {
                byStage[l.stage] = (byStage[l.stage] || 0) + 1;

                const resp = l.responsible;
                let userName = "Unassigned";
                if (typeof resp === "object" && resp) {
                    userName = resp.name || resp.username || "Unassigned";
                } else if (resp && userMap[resp]) {
                    userName = userMap[resp];
                }
                if (!byUser[userName]) byUser[userName] = { total: 0, stages: {} };
                byUser[userName].total++;
                byUser[userName].stages[l.stage] = (byUser[userName].stages[l.stage] || 0) + 1;
            });

            const orderedStages = [
                ...stageOrder.filter(s => byStage[s]),
                ...Object.keys(byStage).filter(s => !stageOrder.includes(s)),
            ];
            const orderedUsers = Object.entries(byUser).sort((a, b) => b[1].total - a[1].total);

            return { id: pipeline.id, name: pipeline.name, total: pipelineLeads.length, orderedStages, byStage, orderedUsers };
        }).filter(Boolean);

        setPipelineReport(report);
    }, [reportRaw, reportClientFilter, reportCohortFilter, reportCohorts]);

    useEffect(() => {
        const loadTasks = async () => {
            if (!can("lead") && !can("client") && !can("service")) {
                setTasksLoading(false);
                return;
            }
            try {
                const data = await getMyTasks();
                setTaskData(data);
            } catch (e) {
                console.error("Error fetching tasks", e);
            } finally {
                setTasksLoading(false);
            }
        };
        loadTasks();
    }, []);

    // Each card/section only appears if the user can actually view that model.
    const cards = [
        { title: "Leads",    count: counts.leads,    icon: Magnet,    href: "/lead",    model: "lead" },
        { title: "Clients",  count: counts.clients,  icon: Building2, href: "/client",  model: "client" },
        { title: "Invoices", count: counts.invoices,  icon: Receipt,   href: "/invoice", model: "invoice" },
        { title: "Assets",   count: counts.assets,   icon: Laptop,    href: "/asset",   model: "asset" },
    ].filter(card => can(card.model));

    const taskCards = [
        { title: "Tasks in Leads",    count: taskData.totals.leads,    color: TASK_COLORS.lead,    entityKey: "lead" },
        { title: "Tasks in Clients",  count: taskData.totals.clients,  color: TASK_COLORS.client,  entityKey: "client" },
        { title: "Tasks in Services", count: taskData.totals.services, color: TASK_COLORS.service, entityKey: "service" },
    ].filter(card => can(card.entityKey));

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    return (
        <div className="h-full flex flex-col w-full transition-colors duration-300" style={{ backgroundColor: "var(--c-surface)" }}>

            {/* Page header */}
            <header
                className="sticky top-0 z-30 w-full px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{
                    backgroundColor: "color-mix(in srgb, var(--c-surface) 85%, transparent)",
                    borderBottom: "1px solid var(--c-border)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                }}
            >
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-2xl font-semibold"
                            style={{ fontFamily: 'var(--font-heading)', color: "var(--c-ink)", letterSpacing: "-0.01em" }}>
                            Dashboard
                        </h1>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest rounded-full px-2 py-0.5"
                            style={{ backgroundColor: "var(--c-brand-pale)", border: "1px solid var(--c-accent)", color: "var(--c-brand)" }}>
                            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--c-accent)" }} />
                            Live
                        </span>
                    </div>
                    <p className="text-sm mt-0.5" style={{ color: "var(--c-muted)", fontFamily: 'var(--font-body)' }}>
                        {greeting},{" "}
                        <span className="font-semibold" style={{ color: "var(--c-ink)" }}>{user?.username || "User"}</span>
                        {user?.groups?.[0] && <span style={{ color: "var(--c-hint)" }}> · {user.groups[0]}</span>}
                    </p>
                </div>
                <p className="text-xs hidden sm:block"
                    style={{ color: "var(--c-muted)", fontFamily: 'var(--font-body)', letterSpacing: "0.04em" }}>
                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
            </header>

            {/* Content */}
            <div className="flex-1 p-6 space-y-8 overflow-y-auto">

                {/* Overview */}
                {cards.length > 0 && (
                <section className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--c-hint)", fontFamily: 'var(--font-body)' }}>
                        Overview
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {cards.map(card => (
                            <StatCard key={card.title} {...card} loading={loading} navigate={navigate} />
                        ))}
                    </div>
                </section>
                )}

                {/* Leads by Pipeline */}
                {(reportLoading || reportRaw.pipelines.length > 0) && (
                    <section className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--c-hint)", fontFamily: 'var(--font-body)' }}>
                                Leads by Pipeline
                            </p>
                            {!reportLoading && (
                                <div className="flex items-center gap-2">
                                    <select
                                        value={reportClientFilter}
                                        onChange={e => setReportClientFilter(e.target.value)}
                                        className="appearance-none pl-3 pr-7 py-1.5 rounded-full text-xs font-semibold focus:outline-none cursor-pointer"
                                        style={{ border: "1px solid var(--c-border)", backgroundColor: "var(--c-surface-2)", color: "var(--c-ink)" }}
                                    >
                                        <option value="">All Clients</option>
                                        {reportClients.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={reportCohortFilter}
                                        onChange={e => setReportCohortFilter(e.target.value)}
                                        className="appearance-none pl-3 pr-7 py-1.5 rounded-full text-xs font-semibold focus:outline-none cursor-pointer"
                                        style={{ border: "1px solid var(--c-border)", backgroundColor: "var(--c-surface-2)", color: "var(--c-ink)" }}
                                    >
                                        <option value="">All Cohorts</option>
                                        {reportCohorts.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        {reportLoading ? (
                            <div className="space-y-3">
                                {[1, 2].map(i => (
                                    <div key={i} className="h-40 rounded-xl animate-pulse" style={{ backgroundColor: "var(--c-skeleton)" }} />
                                ))}
                            </div>
                        ) : pipelineReport.length === 0 ? (
                            <p className="text-sm py-4 text-center" style={{ color: "var(--c-hint)" }}>
                                No leads match the selected filters.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {pipelineReport.map(pipeline => (
                                    <PipelineReportCard key={pipeline.id} pipeline={pipeline} />
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* My Pending Tasks KPIs */}
                {taskCards.length > 0 && (<>
                <section className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--c-hint)", fontFamily: 'var(--font-body)' }}>
                        My Pending Tasks
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {taskCards.map(card => (
                            <TaskKpiCard key={card.title} {...card} loading={tasksLoading} onOpenModal={setOpenTaskModal} />
                        ))}
                    </div>
                </section>

                {/* Calendar */}
                <section className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--c-hint)", fontFamily: 'var(--font-body)' }}>
                        Task Calendar
                    </p>
                    {tasksLoading ? (
                        <div className="h-64 rounded-xl animate-pulse" style={{ backgroundColor: "var(--c-skeleton)" }} />
                    ) : (
                        <TaskCalendar tasks={taskData.tasks} navigate={navigate} />
                    )}
                </section>
                </>)}

            </div>

            <TaskListModal
                isOpen={!!openTaskModal}
                entityType={openTaskModal}
                tasks={taskData.tasks.filter(t => t.entity_type === openTaskModal)}
                onClose={() => setOpenTaskModal(null)}
                navigate={navigate}
            />
        </div>
    );
};
