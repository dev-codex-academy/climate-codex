import * as Icons from "lucide-react";
import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useLocation } from "react-router-dom";

export function NavMain({
  items
}) {

  const location = useLocation();
  return (
    <SidebarMenu>
      {items.map((item) => {
        const Icon = Icons[item.icon] ?? Icons.Circle;
        return (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon ?
                    <div className="flex items-center">
                      <div
                        className="
                          p-1 
                          bg-novo-botones-primary-variante2 
                          dark:bg-novo-botones-terciario-variante5 
                          rounded-md 
                          group-data-[collapsible=icon]:hidden
                        "
                      >
                        <Icon className="size-4 text-novo-iconos-primary dark:text-novo-iconos-terciario-variante2" />
                      </div>

                      <Icon
                        className="
                          size-4 
                          text-novo-iconos-primary 
                          dark:text-novo-iconos-terciario-variante2 
                          hidden 
                          group-data-[collapsible=icon]:block
                        "
                      />
                    </div>
                    : null
                  }
                  <span className="line-clamp-1">{item.title}</span>
                  <ChevronRight
                    className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => {
                    const isActive = location.pathname === subItem.url;

                    return (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a
                            href={subItem.url}
                            className={`flex items-center px-3 py-2 rounded-md transition
                            ${isActive ? "bg-novo-fondo-primary-variante1 dark:bg-novo-fondo-terciario-variante4" : ""}
                          `}
                          >
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              </CollapsibleContent>

            </SidebarMenuItem>
          </Collapsible>
        )
      })}
    </SidebarMenu>

  );
}
