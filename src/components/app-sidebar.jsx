"use client"

import { React, useEffect, useRef, useState } from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
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

  const [rolId, setRolId] = useState([]);

  /* const RoleLoad = async () => {
    const response = await getRolId(user?.rol_id);
    setRolId(response?.data || {});
  }; */

  const [empresaId, setEmpresaId] = useState([]);

  /* const EnterpriseLoad = async () => {
    const response = await getEmpresaId(user?.empresa_id);
    setEmpresaId(response?.data || {});
  }; */

  const data = {
    user: {
      name: user?.usuario,
      profile_name: user?.nombre || '',
      rol: rolId[0]?.nombre_rol || '',
      empresa: empresaId[0]?.nombre || '',
      avatar: '',
      id_rol: user?.rol_id || '',
      data_empresa: empresaId[0] || {},
      data_rol: rolId[0] || {},
      //avatar: "/avatars/Logo2.jpeg",
    }
  }

  //todo recuperar el rolid de la sesion del usuario
  const userRole = {
    rolId: user?.rol_id,
  };

  useEffect(() => {
    MenuLoad(userRole);
    RoleLoad();
    EnterpriseLoad();
  }, []);

  //console.log(menuRef.current);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser user={data.user} />
      </SidebarHeader>
      <hr className="dark:border-novo-bordes-terciario-variante4 border-novo-bordes-primary-variante2" />

      <SidebarContent>
        <NavMain items={menuRef.current} />
      </SidebarContent>

      <hr className="dark:border-novo-bordes-terciario-variante4 border-novo-bordes-primary-variante2" />
      <SidebarFooter>
        <NavUserFooter user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
