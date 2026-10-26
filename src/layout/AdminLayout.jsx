import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
    useSidebar
} from "@/components/ui/sidebar"
import { Outlet, useLocation } from "react-router-dom"
import { NavRail, NavTopBar } from "@/components/nav-shell"
import { useShellNav } from "@/hooks/useShellNav"

const routeLabels = {
    "/": "Dashboard", "/lead": "Leads", "/client": "Clients",
    "/contact": "Contacts", "/service": "Services", "/invoice": "Invoices",
    "/inventory": "Inventory", "/asset": "Assets", "/assetassignment": "Asset Assignments",
    "/pipeline": "Pipelines", "/attribute": "Attributes", "/category": "Categories",
    "/catalogue": "Catalogue", "/followup": "Follow-ups", "/webhook": "Webhooks", "/cohort": "Cohorts",
    "/my-availability": "My Availability", "/my-mentorships": "My Mentorships", "/mentor-overview": "Mentor Availability",
    "/apidocs": "API Docs", "/faq": "FAQ",
};

function getPageTitle(pathname) {
    const base = "/" + pathname.split("/")[1];
    return routeLabels[base] ?? null;
}

function AdminLayoutContent() {
    const { setOpen, open, isMobile } = useSidebar()
    const location = useLocation()
    const pageTitle = getPageTitle(location.pathname)
    const nav = useShellNav()

    // Desktop: floating glass rail (menu groups) + top bar (items of the active group).
    // Mobile keeps the original slide-over sidebar and its compact header.
    return (
        <>
            <div className="app-backdrop" aria-hidden="true" />
            {isMobile ? <AppSidebar /> : <NavRail {...nav} />}
            <SidebarInset
                onClick={() => { if (open && isMobile) setOpen(false) }}
                style={{ backgroundColor: "transparent", zIndex: 10 }}
                className="min-w-0 md:pl-[84px]"
            >
                {isMobile ? (
                    <header
                        className="flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear"
                        style={{
                            backgroundColor: "color-mix(in srgb, var(--c-surface) 80%, transparent)",
                            borderBottom: "1px solid var(--c-border)",
                            backdropFilter: "blur(10px)",
                            WebkitBackdropFilter: "blur(10px)",
                        }}
                    >
                        <div className="flex items-center gap-3 px-4 w-full">
                            <SidebarTrigger
                                className="-ml-1 transition-all rounded"
                                style={{ backgroundColor: "var(--c-brand)", color: "var(--c-on-dark)" }}
                                onClick={(e) => e.stopPropagation()}
                            />
                            <Separator orientation="vertical" className="data-[orientation=vertical]:h-4" style={{ backgroundColor: "var(--c-border)" }} />
                            {pageTitle && (
                                <span className="text-sm font-medium" style={{ color: "var(--c-hint)", fontFamily: 'var(--font-body)' }}>
                                    {pageTitle}
                                </span>
                            )}
                        </div>
                    </header>
                ) : (
                    <NavTopBar {...nav} />
                )}

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0 min-w-0 overflow-hidden">
                    <Outlet />
                </div>
            </SidebarInset>
        </>
    )
}

export default function AdminLayout() {
    return (
        <SidebarProvider defaultOpen={false}>
            <AdminLayoutContent />
        </SidebarProvider>
    )
}
