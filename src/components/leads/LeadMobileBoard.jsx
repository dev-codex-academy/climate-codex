import React, { useEffect, useRef, useState } from "react";
import { LeadCardMobile } from "./LeadCardMobile";

// Mobile replacement for the desktop Kanban: a single-stage list with
// horizontally scrollable stage chips instead of side-by-side columns —
// a horizontal-scrolling multi-column board doesn't translate well to a
// narrow viewport (each column ends up clipped and unreadable).
//
// Reads the same per-stage `stageData` the desktop board's StageColumn
// paginates independently (see LeadBoard.jsx) instead of a flat leads
// array, so counts and "load more" behave identically on both — a stage
// past the first page isn't silently invisible on mobile only.
export const LeadMobileBoard = ({ stages, stageData, onLoadMore, salesUsers, clientsById, onLeadClick, onChangeStage }) => {
    const [activeStage, setActiveStage] = useState(stages[0]?.name);
    const [sentinelNode, setSentinelNode] = useState(null);
    const [scrollNode, setScrollNode] = useState(null);
    const onLoadMoreRef = useRef(onLoadMore);
    onLoadMoreRef.current = onLoadMore;

    useEffect(() => {
        if (stages.length && !stages.some(s => s.name === activeStage)) {
            setActiveStage(stages[0].name);
        }
    }, [stages, activeStage]);

    useEffect(() => {
        if (!sentinelNode || !scrollNode || !activeStage) return;
        const observer = new IntersectionObserver(
            (entries) => { if (entries[0].isIntersecting) onLoadMoreRef.current(activeStage); },
            { root: scrollNode, threshold: 0.1 }
        );
        observer.observe(sentinelNode);
        return () => observer.disconnect();
    }, [sentinelNode, scrollNode, activeStage]);

    if (!stages.length) return null;

    const current = stageData?.[activeStage] || { leads: [], loading: false, hasMore: false, count: 0 };
    const currentLeads = current.leads || [];
    const initialLoad = currentLeads.length === 0 && current.loading;

    return (
        <div className="flex flex-col h-full w-full overflow-hidden" style={{ fontFamily: '"Source Sans 3", Arial, sans-serif' }}>
            {/* Stage chips */}
            <div
                className="flex gap-2 overflow-x-auto px-4 py-3 shrink-0"
                style={{ scrollbarWidth: "none", borderBottom: "1px solid #D8D2C4" }}
            >
                {stages.map(stage => {
                    const isActive = stage.name === activeStage;
                    const stageColor = stage.color || "#5E6A43";
                    const count = stageData?.[stage.name]?.count ?? 0;
                    return (
                        <button
                            key={stage.name}
                            onClick={() => setActiveStage(stage.name)}
                            className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer"
                            style={{
                                backgroundColor: isActive ? stageColor : "#F2EBDD",
                                color: isActive ? "#FBF7EF" : "#2E2A26",
                                border: `1px solid ${isActive ? stageColor : "#D8D2C4"}`,
                            }}
                        >
                            <span
                                className="h-1.5 w-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: isActive ? "#FBF7EF" : stageColor }}
                            />
                            {stage.name}
                            <span
                                className="text-[10px] font-bold px-1.5 rounded-full tabular-nums"
                                style={{ backgroundColor: isActive ? "rgba(251,247,239,0.25)" : "rgba(94,106,67,0.12)" }}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Cards list for the active stage */}
            <div ref={setScrollNode} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {initialLoad && (
                    <div className="h-20 flex items-center justify-center text-[10px] uppercase tracking-widest font-bold" style={{ color: "#9b948e" }}>
                        Loading...
                    </div>
                )}
                {!initialLoad && currentLeads.length === 0 && (
                    <div
                        className="h-28 flex flex-col items-center justify-center rounded-xl"
                        style={{ border: "1.5px dashed #D8D2C4" }}
                    >
                        <p className="text-xs uppercase tracking-widest font-bold" style={{ color: "#9b948e" }}>
                            Empty Stage
                        </p>
                        <p className="text-[11px] mt-1 opacity-60" style={{ color: "#9b948e" }}>
                            No leads here yet
                        </p>
                    </div>
                )}
                {currentLeads.map(lead => (
                    <LeadCardMobile
                        key={lead.id}
                        lead={lead}
                        stages={stages}
                        salesUsers={salesUsers}
                        clientsById={clientsById}
                        onClick={() => onLeadClick?.(lead)}
                        onChangeStage={onChangeStage}
                    />
                ))}
                {current.hasMore && <div ref={setSentinelNode} className="h-4" />}
                {current.loading && currentLeads.length > 0 && (
                    <div className="text-center py-2 text-[10px] uppercase tracking-widest font-bold" style={{ color: "#9b948e" }}>
                        Loading more...
                    </div>
                )}
            </div>
        </div>
    );
};
