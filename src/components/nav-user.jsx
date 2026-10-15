import { CircleUserRound, LogOut, Settings, Sparkles } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthContext";

const AvatarIcon = () => (
  <div
    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
    style={{ backgroundColor: "var(--c-brand)" }}
  >
    <CircleUserRound className="h-5 w-5" style={{ color: "var(--c-on-dark)" }} />
  </div>
);

export function NavUser({ user }) {
  const { isMobile, open } = useSidebar();
  const isCollapsed = !open && !isMobile;
  const { logout } = useAuth();

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {isCollapsed ? (
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg mx-auto transition-colors cursor-pointer"
                style={{ backgroundColor: "transparent" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--c-brand-pale)"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <AvatarIcon />
              </button>
            ) : (
              <SidebarMenuButton
                size="lg"
                className="cursor-pointer my-1 rounded-lg transition-colors"
                style={{ backgroundColor: "transparent" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--c-brand-pale)"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <AvatarIcon />
                <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                  <span className="truncate font-semibold" style={{ color: "var(--c-ink)" }}>{user.name}</span>
                  <span className="truncate text-xs" style={{ color: "var(--c-muted)" }}>{user.email}</span>
                  <span className="text-xs font-semibold" style={{ color: "var(--c-brand)" }}>CodeX</span>
                </div>
                <Settings className="shrink-0 size-4" style={{ color: "var(--c-hint)" }} />
              </SidebarMenuButton>
            )}
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            style={{ backgroundColor: "var(--c-surface)", border: "1px solid var(--c-border)" }}
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-2 py-2">
                <AvatarIcon size={8} />
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold text-sm" style={{ color: "var(--c-ink)" }}>{user.profile_name}</span>
                  <span className="truncate text-xs" style={{ color: "var(--c-brand)" }}>{user.rol}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator style={{ backgroundColor: "var(--c-border)" }} />

            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer" style={{ color: "var(--c-ink)" }}>
                <a href="/faq" className="w-full flex items-center gap-2">
                  <Sparkles className="size-4" style={{ color: "var(--c-brand)" }} />
                  FAQ
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" style={{ color: "var(--c-ink)" }}>
                <a href="/apidocs" className="w-full flex items-center gap-2">
                  <Settings className="size-4" style={{ color: "var(--c-brand)" }} />
                  API Docs
                </a>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator style={{ backgroundColor: "var(--c-border)" }} />

            <DropdownMenuItem
              onSelect={handleLogout}
              className="cursor-pointer"
              style={{ color: "#c0392b" }}
            >
              <LogOut className="size-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
