import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { API_URL, getHeaders } from "@/services/api";
import { Magnet, Building2, Receipt, Laptop, ArrowUpRight } from "lucide-react";

const fetchCount = async (endpoint) => {
    const res = await fetch(`${API_URL}/${endpoint}/?page_size=1`, { headers: getHeaders() });
    if (!res.ok) return null;
    const data = await res.json();
    return data.count ?? null;
};

// Brand Manual accent configs per card
const CARD_ACCENTS = {
    Leads:    { bar: "#F29B6B", badge: { bg: "#FFDCC8", text: "#2E2A26" }, link: "#F29B6B", icon: { bg: "#F29B6B" } },
    Clients:  { bar: "#5E6A43", badge: { bg: "#e8edde", text: "#5E6A43" }, link: "#5E6A43", icon: { bg: "#5E6A43" } },
    Invoices: { bar: "#B8C76A", badge: { bg: "#f0f4dc", text: "#5E6A43" }, link: "#8f9a3e", icon: { bg: "#B8C76A" } },
    Assets:   { bar: "#D8D2C4", badge: { bg: "#F2EBDD", text: "#6b6560" }, link: "#6b6560", icon: { bg: "#6b6560" } },
};

const StatCard = ({ title, count, icon: Icon, href, loading, navigate }) => {
    const accent = CARD_ACCENTS[title] ?? CARD_ACCENTS.Assets;

    return (
        <div
            className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
            style={{
                backgroundColor: "#F2EBDD",
                border: "1px solid #D8D2C4",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(46,42,38,0.06)",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 24px rgba(46,42,38,0.12)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(46,42,38,0.06)"}
            onClick={() => navigate(href)}
        >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: accent.bar }} />

            <div className="relative p-6 flex flex-col gap-5 pt-7">
                {/* Icon + badge */}
                <div className="flex items-start justify-between">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: accent.icon.bg }}
                    >
                        <Icon className="h-5 w-5" style={{ color: "#FBF7EF" }} />
                    </div>
                    <span
                        className="text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: accent.badge.bg, color: accent.badge.text, border: `1px solid ${accent.bar}30` }}
                    >
                        Active
                    </span>
                </div>

                {/* Count */}
                <div>
                    <p
                        className="text-xs font-semibold uppercase tracking-widest mb-1.5"
                        style={{ color: "#6b6560", fontFamily: '"Source Sans 3", Arial, sans-serif' }}
                    >
                        {title}
                    </p>
                    {loading ? (
                        <div className="h-10 w-24 rounded animate-pulse" style={{ backgroundColor: "#D8D2C4" }} />
                    ) : (
                        <span
                            className="text-4xl font-bold"
                            style={{ color: "#2E2A26", fontFamily: '"Source Sans 3", Arial, sans-serif', letterSpacing: "-0.02em" }}
                        >
                            {count ?? "—"}
                        </span>
                    )}
                </div>

                {/* View all */}
                <div
                    className="flex items-center gap-1.5 text-xs font-semibold pt-3 group-hover:gap-2.5 transition-all"
                    style={{
                        color: accent.link,
                        borderTop: "1px solid #D8D2C4",
                        fontFamily: '"Source Sans 3", Arial, sans-serif',
                    }}
                >
                    <span>View all</span>
                    <ArrowUpRight className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                </div>
            </div>
        </div>
    );
};

export const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [counts, setCounts] = useState({ leads: null, clients: null, invoices: null, assets: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const [leads, clients, invoices, assets] = await Promise.allSettled([
                fetchCount("leads"), fetchCount("clients"), fetchCount("invoices"), fetchCount("assets"),
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

    const cards = [
        { title: "Leads",    count: counts.leads,    icon: Magnet,   href: "/lead" },
        { title: "Clients",  count: counts.clients,  icon: Building2, href: "/client" },
        { title: "Invoices", count: counts.invoices,  icon: Receipt,  href: "/invoice" },
        { title: "Assets",   count: counts.assets,   icon: Laptop,   href: "/asset" },
    ];

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    return (
        <div className="h-full flex flex-col w-full transition-colors duration-300" style={{ backgroundColor: "#FBF7EF" }}>

            {/* Page header */}
            <header
                className="sticky top-0 z-30 w-full px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{
                    backgroundColor: "rgba(251,247,239,0.85)",
                    borderBottom: "1px solid #D8D2C4",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                }}
            >
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1
                            className="text-2xl font-semibold"
                            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontStyle: "italic", color: "#2E2A26", letterSpacing: "-0.01em" }}
                        >
                            Dashboard
                        </h1>
                        <span
                            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest rounded-full px-2 py-0.5"
                            style={{ backgroundColor: "#e8edde", border: "1px solid #B8C76A", color: "#5E6A43" }}
                        >
                            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#B8C76A" }} />
                            Live
                        </span>
                    </div>
                    <p className="text-sm mt-0.5" style={{ color: "#6b6560", fontFamily: '"Source Sans 3", Arial, sans-serif' }}>
                        {greeting},{" "}
                        <span className="font-semibold" style={{ color: "#2E2A26" }}>{user?.username || "User"}</span>
                        {user?.groups?.[0] && <span style={{ color: "#9b948e" }}> · {user.groups[0]}</span>}
                    </p>
                </div>
                <p
                    className="text-xs hidden sm:block"
                    style={{ color: "#D8D2C4", fontFamily: '"Source Sans 3", Arial, sans-serif', letterSpacing: "0.04em" }}
                >
                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
            </header>

            {/* Content */}
            <div className="flex-1 p-6 space-y-5">
                <p
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "#9b948e", fontFamily: '"Source Sans 3", Arial, sans-serif' }}
                >
                    Overview
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {cards.map((card) => (
                        <StatCard key={card.title} {...card} loading={loading} navigate={navigate} />
                    ))}
                </div>
            </div>
        </div>
    );
};
