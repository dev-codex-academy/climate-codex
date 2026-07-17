import React, { useEffect, useState, useRef, useCallback } from "react";
import { LeadCard } from "./LeadCard";
import { getPipelines } from "../../services/pipelineService";
import { getLeadsPage, updateLead } from "../../services/leadService";
import { getSales } from "../../services/salesService";
import { getClients } from "../../services/clientService";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Modal } from "../Modal";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import Swal from "sweetalert2";

const LEAD_MY_LEADS_STORAGE_KEY = 'lead_my_leads_only';
const LEAD_SEARCH_STORAGE_KEY = 'lead_search_term';
const STAGE_PAGE_SIZE = 30;
const SEARCH_DEBOUNCE_MS = 400;

// Each column fetches and paginates its own leads independently (see
// plan.md #64) — no more loading every lead in the pipeline up front. "My
// Leads" and the search box are query params sent with every column's
// request instead of a client-side filter, so a match past what's already
// scrolled into view is never silently invisible (the exact failure mode
// of bug #57).
const StageColumn = ({ stage, data, onLoadMore, onDragOver, onDrop, salesUsers, clientsById, onDragStart, onLeadClick }) => {
    // Plain refs don't work here: the sentinel div only renders once
    // `hasMore` is true (after the first fetch resolves), so it doesn't
    // exist yet on the render where a ref-based effect would normally set up
    // the observer, and a `[]`/`[stage.name]` dependency array never re-runs
    // to pick it up once it does appear. State-backed callback refs make the
    // effect re-run exactly when the node actually mounts.
    const [sentinelNode, setSentinelNode] = useState(null);
    const [scrollNode, setScrollNode] = useState(null);
    const onLoadMoreRef = useRef(onLoadMore);
    onLoadMoreRef.current = onLoadMore;

    useEffect(() => {
        if (!sentinelNode || !scrollNode) return;
        const observer = new IntersectionObserver(
            (entries) => { if (entries[0].isIntersecting) onLoadMoreRef.current(); },
            { root: scrollNode, threshold: 0.1 }
        );
        observer.observe(sentinelNode);
        return () => observer.disconnect();
    }, [sentinelNode, scrollNode]);

    const stageColor = stage.color || "#5E6A43";
    const leads = data?.leads || [];
    const loading = !!data?.loading;
    const hasMore = !!data?.hasMore;
    const initialLoad = leads.length === 0 && loading;

    return (
        <div
            className="flex-shrink-0 w-72 flex flex-col rounded-xl h-full transition-all"
            style={{ border: "1px solid #D8D2C4", borderTop: `4px solid ${stageColor}`, backgroundColor: "#FBF7EF" }}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, stage.name)}
        >
            <div
                className="px-4 py-3 flex items-center justify-between shrink-0 rounded-t-lg"
                style={{ backgroundColor: "#F2EBDD", borderBottom: "1px solid #D8D2C4" }}
            >
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: stageColor }} />
                    <h3 className="font-black text-[10px] uppercase tracking-widest" style={{ color: "#2E2A26" }}>
                        {stage.name}
                    </h3>
                </div>
                <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums"
                    style={{ backgroundColor: "rgba(94,106,67,0.12)", border: "1px solid rgba(94,106,67,0.25)", color: "#5E6A43" }}
                >
                    {data?.count ?? leads.length}
                </span>
            </div>

            <div ref={setScrollNode} className="flex-1 p-2.5 overflow-y-auto space-y-2.5 min-h-[80px]">
                {initialLoad && (
                    <div className="h-20 flex items-center justify-center text-[10px] uppercase tracking-widest font-bold" style={{ color: "#9b948e" }}>
                        Loading...
                    </div>
                )}
                {leads.map((lead) => (
                    <LeadCard
                        key={lead.id}
                        lead={lead}
                        salesUsers={salesUsers}
                        clientsById={clientsById}
                        onDragStart={onDragStart}
                        onClick={() => onLeadClick?.(lead)}
                    />
                ))}
                {!initialLoad && leads.length === 0 && (
                    <div className="h-20 flex flex-col items-center justify-center rounded-lg mx-1" style={{ border: "1.5px dashed #D8D2C4" }}>
                        <p className="text-[9px] uppercase tracking-widest font-bold" style={{ color: "#9b948e" }}>Empty Stage</p>
                        <p className="text-[8px] mt-0.5 opacity-60" style={{ color: "#9b948e" }}>Drop cards here</p>
                    </div>
                )}
                {hasMore && <div ref={setSentinelNode} className="h-4" />}
                {loading && leads.length > 0 && (
                    <div className="text-center py-2 text-[10px] uppercase tracking-widest font-bold" style={{ color: "#9b948e" }}>
                        Loading more...
                    </div>
                )}
            </div>
        </div>
    );
};

export const LeadBoard = ({ refreshTrigger, selectedPipelineId, setSelectedPipelineId, onLeadClick }) => {
    const [pipelines, setPipelines] = useState([]);
    const [stages, setStages] = useState([]);
    const [stageData, setStageData] = useState({});
    const [salesUsers, setSalesUsers] = useState([]);
    const [clientsById, setClientsById] = useState({});
    const [loading, setLoading] = useState(true);
    const [myLeadsOnly, setMyLeadsOnly] = useState(
        () => localStorage.getItem(LEAD_MY_LEADS_STORAGE_KEY) === 'true'
    );
    const [searchTerm, setSearchTerm] = useState(
        () => localStorage.getItem(LEAD_SEARCH_STORAGE_KEY) || ""
    );
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const scrollContainerRef = useRef(null);
    const stageDataRef = useRef(stageData);
    const { user } = useAuth();

    const [lostModalOpen, setLostModalOpen] = useState(false);
    const [lostReason, setLostReason] = useState("");
    const [pendingLostLeadId, setPendingLostLeadId] = useState(null);

    useEffect(() => { stageDataRef.current = stageData; }, [stageData]);

    const scrollLeft = () => scrollContainerRef.current?.scrollBy({ left: -320, behavior: 'smooth' });
    const scrollRight = () => scrollContainerRef.current?.scrollBy({ left: 320, behavior: 'smooth' });

    useEffect(() => {
        const fetchPipelines = async () => {
            const pipelinesData = await getPipelines();
            const loadedPipelines = pipelinesData.results || pipelinesData || [];
            setPipelines(loadedPipelines);
            if (loadedPipelines.length > 0 && !selectedPipelineId) {
                setSelectedPipelineId(loadedPipelines[0].id);
            }
        };
        const fetchSalesUsers = async () => {
            try {
                const salesData = await getSales();
                setSalesUsers(salesData.results || salesData || []);
            } catch (err) {
                console.error("Failed to load sales users", err);
            }
        };
        const fetchClients = async () => {
            try {
                const clientsData = await getClients();
                const map = {};
                (clientsData || []).forEach(c => { map[String(c.id)] = c.name; });
                setClientsById(map);
            } catch (err) {
                console.error("Failed to load clients", err);
            }
        };
        fetchPipelines();
        fetchSalesUsers();
        fetchClients();
    }, []);

    useEffect(() => {
        if (!selectedPipelineId || !pipelines.length) return;
        const activePipeline = pipelines.find(p => p.id == selectedPipelineId);
        setStages(activePipeline?.stages ? [...activePipeline.stages].sort((a, b) => a.order - b.order) : []);
    }, [selectedPipelineId, pipelines]);

    // Debounce the search box so typing doesn't fire a request per column per keystroke.
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearchTerm(searchTerm), SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(t);
    }, [searchTerm]);

    useEffect(() => {
        localStorage.setItem(LEAD_MY_LEADS_STORAGE_KEY, String(myLeadsOnly));
    }, [myLeadsOnly]);

    useEffect(() => {
        localStorage.setItem(LEAD_SEARCH_STORAGE_KEY, searchTerm);
    }, [searchTerm]);

    // Loads the first page of every stage/column, in parallel, whenever the
    // pipeline, its stages, or any server-side filter changes.
    useEffect(() => {
        if (!selectedPipelineId || !stages.length) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);

        setStageData(() => {
            const initial = {};
            stages.forEach(s => { initial[s.name] = { leads: [], nextUrl: null, loading: true, hasMore: false, count: 0 }; });
            return initial;
        });

        const loadStage = async (stage) => {
            const params = {
                pipeline_id: selectedPipelineId,
                stage: stage.name,
                page_size: STAGE_PAGE_SIZE,
            };
            if (myLeadsOnly && user?.id) params.responsible = user.id;
            if (debouncedSearchTerm.trim()) params.search = debouncedSearchTerm.trim();

            try {
                const data = await getLeadsPage(params);
                if (cancelled) return;
                setStageData(prev => ({
                    ...prev,
                    [stage.name]: { leads: data.results || [], nextUrl: data.next, loading: false, hasMore: !!data.next, count: data.count ?? (data.results || []).length },
                }));
            } catch (err) {
                console.error(`Error loading leads for stage "${stage.name}"`, err);
                if (cancelled) return;
                setStageData(prev => ({
                    ...prev,
                    [stage.name]: { leads: [], nextUrl: null, loading: false, hasMore: false, count: 0 },
                }));
            }
        };

        Promise.all(stages.map(loadStage)).finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [selectedPipelineId, stages, myLeadsOnly, debouncedSearchTerm, refreshTrigger, user?.id]);

    const loadMoreForStage = useCallback(async (stageName) => {
        const current = stageDataRef.current[stageName];
        if (!current || current.loading || !current.hasMore || !current.nextUrl) return;

        setStageData(prev => ({ ...prev, [stageName]: { ...prev[stageName], loading: true } }));
        try {
            const data = await getLeadsPage(current.nextUrl);
            setStageData(prev => ({
                ...prev,
                [stageName]: {
                    leads: [...prev[stageName].leads, ...(data.results || [])],
                    nextUrl: data.next,
                    loading: false,
                    hasMore: !!data.next,
                    count: data.count ?? prev[stageName].count,
                },
            }));
        } catch (err) {
            console.error(`Error loading more leads for stage "${stageName}"`, err);
            setStageData(prev => ({ ...prev, [stageName]: { ...prev[stageName], loading: false } }));
        }
    }, []);

    const handleDragOver = (e) => e.preventDefault();

    const handleDrop = async (e, targetStageName) => {
        e.preventDefault();
        const leadId = e.dataTransfer.getData("leadId");
        if (targetStageName.toLowerCase() === "lost") {
            setPendingLostLeadId(leadId);
            setLostReason("");
            setLostModalOpen(true);
            return;
        }
        performStageUpdate(leadId, targetStageName);
    };

    const performStageUpdate = async (leadId, targetStageName, additionalPayload = {}) => {
        const previousStageData = stageDataRef.current;
        let movedLead = null;
        let sourceStageName = null;
        for (const [name, data] of Object.entries(previousStageData)) {
            const found = (data.leads || []).find(l => l.id.toString() === leadId);
            if (found) { movedLead = found; sourceStageName = name; break; }
        }
        if (!movedLead || sourceStageName === targetStageName) return;

        setStageData(prev => ({
            ...prev,
            [sourceStageName]: {
                ...prev[sourceStageName],
                leads: prev[sourceStageName].leads.filter(l => l.id.toString() !== leadId),
                count: Math.max(0, (prev[sourceStageName].count || 1) - 1),
            },
            [targetStageName]: {
                ...prev[targetStageName],
                leads: [{ ...movedLead, stage: targetStageName }, ...(prev[targetStageName]?.leads || [])],
                count: (prev[targetStageName]?.count || 0) + 1,
            },
        }));

        try {
            await updateLead(leadId, { stage: targetStageName, ...additionalPayload });
        } catch (error) {
            console.error("Failed to update stage", error);
            setStageData(previousStageData);
            // A StageValidationRule (or other backend validation) blocked the
            // move — revert the optimistic update above and tell the user why.
            Swal.fire('Cannot move lead', error.message || 'The stage change was rejected.', 'error');
        }
    };

    const handleLostSubmit = () => {
        if (!lostReason.trim()) return;
        performStageUpdate(pendingLostLeadId, "Lost", { lost_reason: lostReason });
        setLostModalOpen(false);
        setPendingLostLeadId(null);
    };

    if (loading && !Object.keys(stageData).length) {
        return (
            <div className="p-10 text-center" style={{ color: "#6b6560", fontFamily: '"Source Sans 3", Arial, sans-serif' }}>
                Loading board...
            </div>
        );
    }

    if (!pipelines.length) {
        return (
            <div className="flex flex-col items-center justify-center p-10 h-full" style={{ fontFamily: '"Source Sans 3", Arial, sans-serif' }}>
                <div className="text-center mb-8">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: "#2E2A26" }}>No active pipeline found</h3>
                    <p className="text-sm mb-6" style={{ color: "#9b948e" }}>Configure your first pipeline to start managing leads.</p>
                    <Link
                        to="/pipeline"
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        style={{ backgroundColor: "#5E6A43", color: "#FBF7EF" }}
                    >
                        Manage Pipelines
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex flex-col h-full w-full overflow-hidden relative group/board"
            style={{ fontFamily: '"Source Sans 3", Arial, sans-serif' }}
        >
            {/* Pipeline selector toolbar */}
            <div
                className="px-5 py-2.5 flex items-center gap-3 shrink-0"
                style={{ borderBottom: "1px solid #D8D2C4", backgroundColor: "#FBF7EF" }}
            >
                <span
                    className="text-[10px] uppercase tracking-widest font-bold shrink-0"
                    style={{ color: "#9b948e" }}
                >
                    Active Pipeline
                </span>
                <div className="relative">
                    <select
                        value={selectedPipelineId || ""}
                        onChange={(e) => setSelectedPipelineId(e.target.value)}
                        className="appearance-none pl-3 pr-7 py-1.5 rounded-full text-xs font-semibold focus:outline-none cursor-pointer transition-colors"
                        style={{
                            border: "1px solid #D8D2C4",
                            backgroundColor: "#F2EBDD",
                            color: "#2E2A26",
                            minWidth: "200px",
                        }}
                    >
                        {pipelines.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <ChevronRight
                        size={13}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none rotate-90"
                        style={{ color: "#9b948e" }}
                    />
                </div>

                <label className="flex items-center gap-1.5 shrink-0 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={myLeadsOnly}
                        onChange={(e) => setMyLeadsOnly(e.target.checked)}
                        className="h-3.5 w-3.5 rounded cursor-pointer"
                        style={{ accentColor: "#5E6A43" }}
                    />
                    <span className="text-xs font-semibold" style={{ color: "#2E2A26" }}>My Leads</span>
                </label>

                <div className="relative w-[220px]">
                    <Search
                        size={13}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: "#9b948e" }}
                    />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search leads by name..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-full text-xs focus:outline-none transition-colors"
                        style={{ border: "1px solid #D8D2C4", backgroundColor: "#FBF7EF", color: "#2E2A26" }}
                    />
                </div>
            </div>

            {/* Scroll buttons */}
            <button
                onClick={scrollLeft}
                className="absolute left-2 top-1/2 z-20 h-9 w-9 flex items-center justify-center rounded-full opacity-0 group-hover/board:opacity-100 transition-opacity"
                style={{ backgroundColor: "#FBF7EF", border: "1px solid #D8D2C4", color: "#5E6A43", boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
            >
                <ChevronLeft size={18} />
            </button>
            <button
                onClick={scrollRight}
                className="absolute right-2 top-1/2 z-20 h-9 w-9 flex items-center justify-center rounded-full opacity-0 group-hover/board:opacity-100 transition-opacity"
                style={{ backgroundColor: "#FBF7EF", border: "1px solid #D8D2C4", color: "#5E6A43", boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
            >
                <ChevronRight size={18} />
            </button>

            {/* Kanban columns */}
            <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto pb-4 px-4 h-full mt-3 scroll-smooth"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#D8D2C4 transparent" }}
            >
                {stages.map((stage) => (
                    <StageColumn
                        key={stage.name}
                        stage={stage}
                        data={stageData[stage.name]}
                        onLoadMore={() => loadMoreForStage(stage.name)}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        salesUsers={salesUsers}
                        clientsById={clientsById}
                        onDragStart={(e, l) => e.dataTransfer.setData("leadId", l.id)}
                        onLeadClick={onLeadClick}
                    />
                ))}
            </div>

            {/* Lost reason modal */}
            <Modal
                isOpen={lostModalOpen}
                onClose={() => { setLostModalOpen(false); setPendingLostLeadId(null); }}
                title="Reason for Losing Opportunity"
                showFooter={false}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="lost_reason">Please provide a reason to mark this opportunity as lost.</Label>
                        <Textarea
                            id="lost_reason"
                            value={lostReason}
                            onChange={(e) => setLostReason(e.target.value)}
                            placeholder="e.g., Budget constraints, chose competitor..."
                            className="min-h-[100px]"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={() => { setLostModalOpen(false); setPendingLostLeadId(null); }}>
                            Cancel
                        </Button>
                        <Button onClick={handleLostSubmit} disabled={!lostReason.trim()}>
                            Confirm
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
