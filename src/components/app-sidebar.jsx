"use client"

import { React, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useMenu } from "@/hooks/useMenu"
import { NavUserFooter } from "./nav-user-footer"
import { useAuth } from "@/context/AuthContext"

// This is sample data.

export function AppSidebar({
  ...props
}) {

  const { MenuLoad, menu, menuRef } = useMenu();
  const { user } = useAuth();
  const location = useLocation();
  const isDashboardActive = location.pathname === "/";

  const data = {
    user: {
      name: user?.username,
      profile_name: user?.username || '',
      rol: user?.groups?.[0] || '',
      avatar: '',
      id_rol: user?.groups?.[0] || '',
      email: user?.email
    }
  }

  useEffect(() => {
    MenuLoad();
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser user={data.user} />
      </SidebarHeader>
      <hr className="dark:border-codex-bordes-terciario-variante4 border-codex-bordes-primary-variante2" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard" isActive={isDashboardActive}>
                  <Link to="/">
                    <div className="flex items-center group-data-[collapsible=icon]:hover:bg-codex-bordes-primary-variante2 group-data-[collapsible=icon]:dark:hover:bg-codex-bordes-terciario-variante5 group-data-[collapsible=icon]:rounded-sm">
                      <LayoutDashboard className="size-5 text-codex-iconos-primary dark:text-codex-iconos-terciario-variante2" />
                    </div>
                    <span className="dark:text-white">Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {menu.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <NavMain items={group.items} />
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <hr className="dark:border-codex-bordes-terciario-variante4 border-codex-bordes-primary-variante2" />
      <SidebarFooter>
        <NavUserFooter user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
