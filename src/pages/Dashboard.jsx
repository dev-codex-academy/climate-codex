import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { API_URL, getHeaders } from "@/services/api";
import { Magnet, Building2, Receipt, Laptop, ArrowRight } from "lucide-react";

const fetchCount = async (endpoint) => {
    const res = await fetch(`${API_URL}/${endpoint}/?page_size=1`, {
        headers: getHeaders(),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.count ?? null;
};

const StatCard = ({ title, count, icon: Icon, color, href, loading, navigate }) => (
    <div
        className="rounded-xl border border-codex-bordes-primary-variante2 dark:border-codex-bordes-terciario-variante4 bg-white/80 dark:bg-codex-fondo-secondary/60 p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.01]"
        onClick={() => navigate(href)}
    >
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
            <div className={`p-2 rounded-lg ${color}`}>
                <Icon className="h-4 w-4 text-white" />
            </div>
        </div>

        {loading ? (
            <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
        ) : (
            <span className="text-4xl font-bold tracking-tight text-codex-texto-secondary dark:text-codex-texto-terciario-variante1">
                {count ?? "—"}
            </span>
        )}

        <div className="flex items-center gap-1 text-xs text-codex-primary mt-auto font-medium">
            <span>View all</span>
            <ArrowRight className="h-3 w-3" />
        </div>
    </div>
);

export const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [counts, setCounts] = useState({ leads: null, clients: null, invoices: null, assets: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const [leads, clients, invoices, assets] = await Promise.allSettled([
                fetchCount("leads"),
                fetchCount("clients"),
                fetchCount("invoices"),
                fetchCount("assets"),
            ]);
            setCounts({
                leads: leads.status === "fulfilled" ? leads.value : null,
                clients: clients.status === "fulfilled" ? clients.value : null,
                invoices: invoices.status === "fulfilled" ? invoices.value : null,
                assets: assets.status === "fulfilled" ? assets.value : null,
            });
            setLoading(false);
        };
        load();
    }, []);

    const cards = [
        { title: "Leads", count: counts.leads, icon: Magnet, color: "bg-violet-500", href: "/lead" },
        { title: "Clients", count: counts.clients, icon: Building2, color: "bg-blue-500", href: "/client" },
        { title: "Invoices", count: counts.invoices, icon: Receipt, color: "bg-emerald-500", href: "/invoice" },
        { title: "Assets", count: counts.assets, icon: Laptop, color: "bg-orange-500", href: "/asset" },
    ];

    return (
        <div className="h-full flex flex-col w-full bg-codex-fondo-primary-variante1 dark:bg-codex-fondo-secondary-variante5/30 transition-colors duration-300">
            <header className="sticky top-0 z-30 w-full border-b border-codex-bordes-primary-variante2 dark:border-codex-bordes-terciario-variante4 bg-white/70 dark:bg-codex-fondo-secondary/70 backdrop-blur-md px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-codex-texto-secondary dark:text-codex-texto-terciario-variante1">
                        Dashboard
                    </h1>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <span className="flex h-2 w-2 rounded-full bg-codex-primary animate-pulse" />
                        Welcome back, {user?.username || "User"}
                        {user?.groups?.[0] ? ` · ${user.groups[0]}` : ""}
                    </p>
                </div>
            </header>

            <div className="flex-1 p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {cards.map((card) => (
                        <StatCard key={card.title} {...card} loading={loading} navigate={navigate} />
                    ))}
                </div>
            </div>
        </div>
    );
};
