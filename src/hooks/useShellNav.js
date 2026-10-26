import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { useMenu } from "@/hooks/useMenu"

const STORAGE_KEY = "nav_group"

export const matches = (pathname, url) => pathname === url || pathname.startsWith(url + "/")

// Menu groups drive the left rail; the items of the active group drive the top bar.
// The group follows the current route, and is remembered for pages that belong to none
// (the dashboard, FAQ, API docs).
export function useShellNav() {
  const { MenuLoad, menu } = useMenu()
  const { pathname } = useLocation()
  const [remembered, setRemembered] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || "" } catch { return "" }
  })

  useEffect(() => { MenuLoad() }, [])

  const routeGroup = menu.find(g => g.items.some(i => matches(pathname, i.url)))?.label
  const activeLabel = routeGroup || (menu.some(g => g.label === remembered) ? remembered : menu[0]?.label)

  useEffect(() => {
    if (routeGroup && routeGroup !== remembered) {
      setRemembered(routeGroup)
      try { localStorage.setItem(STORAGE_KEY, routeGroup) } catch { /* private mode */ }
    }
  }, [routeGroup, remembered])

  return { menu, pathname, activeGroup: menu.find(g => g.label === activeLabel), onDashboard: pathname === "/" }
}
