import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
    useSidebar
} from "@/components/ui/sidebar"
import { Outlet } from "react-router-dom"

function AdminLayoutContent() {
    const { setOpen, open, isMobile } = useSidebar()

    return (
        <>
            <AppSidebar />
            <SidebarInset onClick={() => {
                if (open && !isMobile) setOpen(false)
            }}>
                <header className="flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" onClick={(e) => e.stopPropagation()} />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
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
