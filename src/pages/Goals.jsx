import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Target, Plus, Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { getGoals, getGoalOptions, createGoal, updateGoal, deleteGoal } from "../services/goalService";

const FONT = { fontFamily: "var(--font-body)" };
const FIELD = "w-full h-10 rounded-md border px-3 text-sm focus:outline-none";
const FIELD_STYLE = { borderColor: "var(--c-border)", color: "var(--c-ink)", backgroundColor: "var(--c-surface)" };
const EMPTY = { user: "", kpi: "", cohort: "", client: "", goal: "", weight: "" };

const can = (perm) => {
    try {
        return JSON.parse(localStorage.getItem("user_permissions") || "[]").includes(perm);
    } catch {
        return false;
    }
};

const Label = ({ children }) => (
    <label className="text-xs font-medium" style={{ color: "var(--c-hint)" }}>{children}</label>
);

export const Goals = () => {
    const canAdd = can("app.add_goalperuser");
    const canChange = can("app.change_goalperuser");
    const canDelete = can("app.delete_goalperuser");

    const [options, setOptions] = useState({ users: [], kpis: [], cohorts: [], clients: [] });
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cohortFilter, setCohortFilter] = useState("");
    const [userFilter, setUserFilter] = useState("");
    const defaultApplied = useRef(false);
    const [form, setForm] = useState(null); // null = closed; { id?, ...fields } = open
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [opts, rows] = await Promise.all([getGoalOptions(), getGoals()]);
            setOptions(opts);
            setGoals(rows.results || rows);
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    // Default the cohort filter once data arrives: the newest cohort that already has goals
    // (options.cohorts comes newest-first), else simply the newest cohort.
    useEffect(() => {
        if (defaultApplied.current || !options.cohorts.length || loading) return;
        defaultApplied.current = true; // only once, so choosing "All cohorts" later sticks
        const withGoals = new Set(goals.map(g => String(g.cohort)));
        const pick = options.cohorts.find(c => withGoals.has(String(c.id))) || options.cohorts[0];
        setCohortFilter(String(pick.id));
    }, [options.cohorts, goals, loading]);

    const visible = useMemo(() => goals.filter(g =>
        (!cohortFilter || String(g.cohort) === cohortFilter) &&
        (!userFilter || String(g.user) === userFilter)
    ), [goals, cohortFilter, userFilter]);

    // Total weight per user+client inside the filtered cohort: must never pass 100%.
    const weightTotals = useMemo(() => {
        const totals = {};
        visible.forEach(g => {
            const key = `${g.user}|${g.client || ""}`;
            totals[key] = (totals[key] || 0) + Number(g.weight);
        });
        return totals;
    }, [visible]);

    const openNew = () => setForm({ ...EMPTY, cohort: cohortFilter, user: userFilter });
    const openEdit = (g) => setForm({
        id: g.id, user: String(g.user), kpi: String(g.kpi), cohort: String(g.cohort),
        client: g.client ? String(g.client) : "", goal: String(g.goal), weight: String(g.weight),
    });
    const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (form.id) {
                await updateGoal(form.id, { goal: Number(form.goal), weight: form.weight });
            } else {
                await createGoal({
                    user: Number(form.user), kpi: form.kpi, cohort: form.cohort,
                    client: form.client || null, goal: Number(form.goal), weight: form.weight,
                });
            }
            setForm(null);
            await load();
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (g) => {
        const confirm = await Swal.fire({
            title: "Delete goal?",
            text: `${g.user_name} — ${g.kpi_name} (${g.cohort_name})`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete",
        });
        if (!confirm.isConfirmed) return;
        try {
            await deleteGoal(g.id);
            await load();
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        }
    };

    return (
        <div className="p-6 space-y-6" style={FONT}>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: "color-mix(in srgb, var(--c-brand) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--c-brand) 30%, transparent)" }}
                    >
                        <Target className="h-5 w-5" style={{ color: "var(--c-brand)" }} />
                    </div>
                    <div>
                        <p className="text-base font-semibold" style={{ color: "var(--c-ink)" }}>Goals</p>
                        <p className="text-sm" style={{ color: "var(--c-hint)" }}>
                            KPI targets per employee and cohort. Weights per employee must add up to 100% or less.
                        </p>
                    </div>
                </div>
                {canAdd && (
                    <button
                        onClick={openNew}
                        className="h-10 px-4 rounded-md text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                        style={{ backgroundColor: "var(--c-brand)", color: "var(--c-on-dark)" }}
                    >
                        <Plus className="h-4 w-4" /> New goal
                    </button>
                )}
            </div>

            {form && (
                <form
                    onSubmit={handleSave}
                    className="rounded-xl p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    style={{ border: "1px solid var(--c-border)", backgroundColor: "var(--c-surface)" }}
                >
                    <div className="space-y-1.5">
                        <Label>Employee</Label>
                        <select required disabled={!!form.id} value={form.user} onChange={set("user")} className={FIELD} style={FIELD_STYLE}>
                            <option value="">Select...</option>
                            {options.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <Label>KPI</Label>
                        <select required disabled={!!form.id} value={form.kpi} onChange={set("kpi")} className={FIELD} style={FIELD_STYLE}>
                            <option value="">Select...</option>
                            {options.kpis.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Cohort</Label>
                        <select required disabled={!!form.id} value={form.cohort} onChange={set("cohort")} className={FIELD} style={FIELD_STYLE}>
                            <option value="">Select...</option>
                            {options.cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Client (optional)</Label>
                        <select disabled={!!form.id} value={form.client} onChange={set("client")} className={FIELD} style={FIELD_STYLE}>
                            <option value="">No client</option>
                            {options.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Goal (target number)</Label>
                        <input required type="number" min="0" step="1" value={form.goal} onChange={set("goal")} className={FIELD} style={FIELD_STYLE} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Weight (%)</Label>
                        <input required type="number" min="0" max="100" step="0.01" value={form.weight} onChange={set("weight")} className={FIELD} style={FIELD_STYLE} />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
                        <button
                            type="submit"
                            disabled={saving}
                            className="h-10 px-5 rounded-md text-sm font-semibold disabled:opacity-50 cursor-pointer"
                            style={{ backgroundColor: "var(--c-brand)", color: "var(--c-on-dark)" }}
                        >
                            {saving ? "Saving..." : form.id ? "Save changes" : "Create goal"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setForm(null)}
                            className="h-10 px-5 rounded-md text-sm font-medium border cursor-pointer"
                            style={{ borderColor: "var(--c-border)", color: "var(--c-ink)" }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="flex flex-wrap gap-3">
                <select value={cohortFilter} onChange={e => setCohortFilter(e.target.value)} className={`${FIELD} sm:w-64`} style={FIELD_STYLE}>
                    <option value="">All cohorts</option>
                    {options.cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={userFilter} onChange={e => setUserFilter(e.target.value)} className={`${FIELD} sm:w-64`} style={FIELD_STYLE}>
                    <option value="">All employees</option>
                    {options.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
            </div>

            <div className="rounded-xl overflow-x-auto" style={{ border: "1px solid var(--c-border)", backgroundColor: "var(--c-surface)" }}>
                <table className="w-full text-sm">
                    <thead>
                        <tr style={{ color: "var(--c-hint)", borderBottom: "1px solid var(--c-border)" }}>
                            {["Employee", "KPI", "Cohort", "Client", "Goal", "Weight", "Employee total", ""].map(h => (
                                <th key={h} className="text-left font-medium px-4 py-3 whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} className="px-4 py-6" style={{ color: "var(--c-hint)" }}>Loading...</td></tr>
                        ) : visible.length === 0 ? (
                            <tr><td colSpan={8} className="px-4 py-6" style={{ color: "var(--c-hint)" }}>No goals for this selection.</td></tr>
                        ) : visible.map(g => {
                            const total = weightTotals[`${g.user}|${g.client || ""}`];
                            return (
                                <tr key={g.id} style={{ color: "var(--c-ink)", borderBottom: "1px solid var(--c-border)" }}>
                                    <td className="px-4 py-3 whitespace-nowrap">{g.user_name}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{g.kpi_name}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{g.cohort_name}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{g.client_name || "—"}</td>
                                    <td className="px-4 py-3">{g.goal}</td>
                                    <td className="px-4 py-3">{Number(g.weight)}%</td>
                                    <td className="px-4 py-3" style={{ color: total === 100 ? "var(--c-ink)" : "var(--c-hint)" }}>{total}%</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1 justify-end">
                                            {canChange && (
                                                <button onClick={() => openEdit(g)} aria-label="Edit goal" className="p-2 rounded-md cursor-pointer" style={{ color: "var(--c-ink)" }}>
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button onClick={() => handleDelete(g)} aria-label="Delete goal" className="p-2 rounded-md cursor-pointer" style={{ color: "var(--c-ink)" }}>
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
