import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CircleUserRound,
  Cog,
  CreditCard,
  LogOut,
  Settings,
  Sparkles,
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

export function NavUser({
  user
}) {
  const { isMobile } = useSidebar();

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
            <SidebarMenuButton
              size="lg"
              className='data-[state=open]:bg-codex-botones-primary-variante1 data-[state=open]:text-codex-texto-primary data-[state=open]:border data-[state=open]:border-codex-bordes-primary-variante2
              dark:data-[state=open]:bg-codex-botones-terciario-variante5 dark:data-[state=open]:text-codex-texto-terciario-variante1 dark:data-[state=open]:border-codex-bordes-terciario
              cursor-pointer
              hover:bg-codex-botones-primary-variante1 hover:text-codex-texto-primary hover:border hover:border-codex-bordes-primary-variante2 group-data-[collapsible=icon]:hover:border-0
              dark:hover:bg-codex-botones-terciario-variante5 dark:hover:text-codex-texto-terciario-variante1 dark:hover:border-codex-bordes-terciario
                my-1
              '>
              <div className="flex items-start gap-2 group-data-[collapsible=icon]:items-center">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg"><CircleUserRound /></AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-codex-texto-secondary-variante5 dark:text-codex-texto-terciario-variante2">{user.rol}</span>
                  <span className="truncate text-xs text-gray-400 dark:text-codex-texto-secondary-variante2">{user.empresa}</span>
                </div>
              </div>

              <Settings className="ml-auto size-4 " />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg"><CircleUserRound /></AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-medium text-sm">{user.profile_name}</span>
                  <span className="truncate text-xs">{user.rol}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* {user.id_rol === 1 && (
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <a href="/cuenta" className="w-full flex items-center gap-2">
                  <BadgeCheck />
                  Cuenta
                  </a>
                  
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard />
                  Billetera
                </DropdownMenuItem>
              </DropdownMenuGroup>

            )} */}

            <DropdownMenuGroup>
              <DropdownMenuItem>
                <a href="/cuenta" className="w-full flex items-center gap-2">
                  <BadgeCheck />
                  Account
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href="/faq" className="w-full flex items-center gap-2">
                  <Sparkles />
                  FAQ
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href="/api" className="w-full flex items-center gap-2">
                  <Settings />
                  API Docs
                </a>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout}>
              <LogOut />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
