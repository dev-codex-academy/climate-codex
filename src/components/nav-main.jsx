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

const OLIVE = "var(--c-brand)";
const ACTIVE_BORDER = "3px solid var(--c-brand)";

export function NavMain({ items }) {
  const location = useLocation();

  return (
    <SidebarMenu>
      {items.map((item) => {
        const Icon = Icons[item.icon] ?? Icons.Circle;
        const hasSubItems = item.items && item.items.length > 0;

        if (!hasSubItems) {
          const isActive = location.pathname === item.url ||
            location.pathname.startsWith(item.url + "/");

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                style={isActive ? {
                  backgroundColor: "var(--sidebar-accent)",
                  borderLeft: ACTIVE_BORDER,
                  borderRadius: "0 4px 4px 0",
                } : {}}
              >
                <a
                  href={item.url || "#"}
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {item.icon && (
                    <Icon
                      className="size-4"
                      style={{ color: isActive ? OLIVE : undefined }}
                    />
                  )}
                  <span className="font-medium text-foreground">{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        }

        return (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={item.title}
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {item.icon && (
                    <div className="flex items-center">
                      <div
                        className="p-1 rounded group-data-[collapsible=icon]:hidden"
                        style={{ backgroundColor: "color-mix(in srgb, var(--c-brand) 12%, transparent)" }}
                      >
                        <Icon className="size-4" style={{ color: OLIVE }} />
                      </div>
                      <Icon
                        className="size-4 hidden group-data-[collapsible=icon]:block"
                        style={{ color: OLIVE }}
                      />
                    </div>
                  )}
                  <span className="line-clamp-1 font-medium text-foreground">
                    {item.title}
                  </span>
                  <ChevronRight
                    className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-muted-foreground"
                  />
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
                            className="flex items-center px-3 py-2 rounded transition-all"
                            style={{
                              color: isActive ? OLIVE : undefined,
                              backgroundColor: isActive ? "var(--sidebar-accent)" : "transparent",
                              fontFamily: 'var(--font-body)',
                              fontWeight: isActive ? 600 : 400,
                              borderLeft: isActive ? `2px solid ${OLIVE}` : "2px solid transparent",
                            }}
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
        );
      })}
    </SidebarMenu>
  );
}
