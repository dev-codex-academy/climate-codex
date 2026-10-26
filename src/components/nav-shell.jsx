import { Link } from "react-router-dom"
import * as Icons from "lucide-react"
import { LogOut, Moon, Monitor, Sparkles, Sun, Settings, CircleUserRound } from "lucide-react"

import { useAuth } from "@/context/AuthContext"
import { UseTheme } from "@/components/UseTheme"
import { matches } from "@/hooks/useShellNav"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const GROUP_ICONS = {
  "CRM": "Users",
  "Billing / Inventory": "Receipt",
  "Assets": "Laptop",
  "Mentoring": "GraduationCap",
  "AI": "Bot",
  "Admin": "SlidersHorizontal",
}

const FONT = "var(--font-body)"


function RailButton({ to, label, icon, active }) {
  const Icon = Icons[icon] ?? Icons.Circle
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to={to}
          aria-label={label}
          aria-current={active ? "page" : undefined}
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl transition-all"
          style={active
            ? { background: "var(--c-brand)", color: "var(--c-on-dark)", boxShadow: "0 6px 18px color-mix(in srgb, var(--c-brand) 45%, transparent)" }
            : { color: "var(--c-muted)" }}
          onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--glass-hover)" }}
          onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent" }}
        >
          <Icon className="size-5" />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={10}>{label}</TooltipContent>
    </Tooltip>
  )
}

export function NavRail({ menu, activeGroup, onDashboard }) {
  return (
    <nav
      aria-label="Main"
      className="glass fixed left-3 top-3 bottom-3 z-30 hidden w-[60px] flex-col items-center gap-1.5 overflow-y-auto rounded-[30px] py-3 md:flex"
      style={{ scrollbarWidth: "none" }}
    >
      <Link to="/" aria-label="Home" className="mb-1 flex size-10 shrink-0 items-center justify-center">
        <img src="/favicon.png?v=2" alt="CodeX" className="size-8 object-contain" />
      </Link>
      <div className="mb-1 h-px w-7 shrink-0" style={{ background: "var(--glass-border)" }} />
      <RailButton to="/" label="Dashboard" icon="LayoutDashboard" active={onDashboard} />
      {menu.map(group => (
        <RailButton
          key={group.label}
          to={group.items[0].url}
          label={group.label}
          icon={GROUP_ICONS[group.label] ?? "Circle"}
          active={!onDashboard && activeGroup?.label === group.label}
        />
      ))}
    </nav>
  )
}

const THEMES = {
  light: { label: "Light", icon: Sun },
  dark: { label: "Dark", icon: Moon },
  system: { label: "System", icon: Monitor },
}

function UserMenu() {
  const { user, logout } = useAuth()
  const [theme, setTheme] = UseTheme()
  const ThemeIcon = (THEMES[theme] || THEMES.system).icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account and theme"
          className="flex h-9 items-center gap-2 rounded-full pl-1 pr-3 transition-colors"
          style={{ color: "var(--c-ink)", fontFamily: FONT }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--glass-hover)" }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
        >
          <span className="flex size-7 items-center justify-center rounded-full" style={{ background: "var(--c-brand)" }}>
            <CircleUserRound className="size-4" style={{ color: "var(--c-on-dark)" }} />
          </span>
          <span className="hidden max-w-[120px] truncate text-sm font-semibold lg:block">{user?.username}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="min-w-56 rounded-2xl p-1.5">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-semibold" style={{ color: "var(--c-ink)" }}>{user?.username}</p>
          <p className="truncate text-xs" style={{ color: "var(--c-muted)" }}>{user?.email}</p>
          <p className="text-xs font-semibold" style={{ color: "var(--c-brand)" }}>{user?.groups?.[0]}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(THEMES).map(([key, { label, icon: Icon }]) => (
          <DropdownMenuItem key={key} onSelect={() => setTheme(key)} className="cursor-pointer gap-2 rounded-xl"
            style={{ color: theme === key ? "var(--c-brand)" : "var(--c-ink)", fontFamily: FONT }}>
            <Icon className="size-4" /> {label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer rounded-xl" style={{ color: "var(--c-ink)" }}>
          <Link to="/faq" className="flex items-center gap-2"><Sparkles className="size-4" style={{ color: "var(--c-brand)" }} /> FAQ</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer rounded-xl" style={{ color: "var(--c-ink)" }}>
          <Link to="/apidocs" className="flex items-center gap-2"><Settings className="size-4" style={{ color: "var(--c-brand)" }} /> API Docs</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); logout() }} className="cursor-pointer gap-2 rounded-xl" style={{ color: "var(--c-danger)" }}>
          <LogOut className="size-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function NavTopBar({ activeGroup, pathname, onDashboard }) {
  return (
    <header className="sticky top-0 z-20 hidden items-center gap-3 px-4 pb-3 pt-3 md:flex">
      <div className="glass flex h-12 shrink-0 items-center rounded-full px-5">
        <span className="text-sm font-bold tracking-tight" style={{ color: "var(--c-ink)", fontFamily: FONT }}>
          {onDashboard ? "Dashboard" : (activeGroup?.label ?? "Codex CRM")}
        </span>
      </div>

      {activeGroup && !onDashboard && (
        <nav aria-label={`${activeGroup.label} sections`} className="glass flex h-12 min-w-0 items-center gap-1 overflow-x-auto rounded-full p-1.5" style={{ scrollbarWidth: "none" }}>
          {activeGroup.items.map(item => {
            const Icon = Icons[item.icon] ?? Icons.Circle
            const active = matches(pathname, item.url)
            return (
              <Link
                key={item.url}
                to={item.url}
                aria-current={active ? "page" : undefined}
                className="flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors"
                style={active
                  ? { background: "var(--c-brand)", color: "var(--c-on-dark)", fontFamily: FONT }
                  : { color: "var(--c-muted)", fontFamily: FONT }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--glass-hover)" }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent" }}
              >
                <Icon className="size-4" /> {item.title}
              </Link>
            )
          })}
        </nav>
      )}

      <div className="glass ml-auto flex h-12 shrink-0 items-center rounded-full p-1.5">
        <UserMenu />
      </div>
    </header>
  )
}
