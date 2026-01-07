import {
  Sun, Moon, Monitor, ChevronsUpDown
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
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
import { UseTheme } from "./UseTheme";

export function NavUserFooter({
  user
}) {
  const { isMobile } = useSidebar();

  const { logout } = useAuth();

  const handleLogout = async (e) => {
    console.log('cerrando desde funcion');
    e.preventDefault();
    await logout();
  }

  const [darkMode, setDarkMode] = UseTheme()

  const themeOptions = {
    system: { label: "System", icon: <Monitor className="size-4" /> },
    light: { label: "Light", icon: <Sun className="size-4" /> },
    dark: { label: "Dark", icon: <Moon className="size-4" /> },
  }

  const currentTheme = themeOptions[darkMode] || themeOptions.system

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lgv2"
              className='data-[state=open]:bg-codex-botones-primary-variante1 data-[state=open]:text-codex-texto-primary data-[state=open]:border data-[state=open]:border-codex-bordes-primary-variante2
              dark:data-[state=open]:bg-codex-botones-terciario-variante5 dark:data-[state=open]:text-codex-texto-terciario-variante1 dark:data-[state=open]:border-codex-bordes-terciario
              cursor-pointer
              hover:bg-codex-botones-primary-variante1 hover:text-codex-texto-primary hover:border hover:border-codex-bordes-primary-variante2
              dark:hover:bg-codex-botones-terciario-variante5 dark:hover:text-codex-texto-terciario-variante1 dark:hover:border-codex-bordes-terciario
             group-data-[collapsible=icon]:border-0! 
              '
            >
              {currentTheme.icon}
              <span className="ml-2">{currentTheme.label}</span>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-48 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {Object.entries(themeOptions).map(([key, { label, icon }]) => (
              <DropdownMenuItem
                key={key}
                onSelect={() => setDarkMode(key)}
                className={`flex items-center gap-2 cursor-pointer ${darkMode === key ? "dark:bg-codex-botones-terciario-variante4 dark:text-codex-texto-terciario-variante1 bg-codex-botones-primary-variante2 text-codex-texto-primary-variante3" : " "
                  }`}
              >
                {icon}
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
