"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, FolderKanban, BadgeCheck, Files, Settings, ChevronLeft, ChevronRight } from "lucide-react"
import { ClientFlowLogo } from "@/components/brand/clientflow-logo"

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clients", href: "/dashboard/clients", icon: Users },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Approvals", href: "/dashboard/approvals", icon: BadgeCheck },
  { label: "Files", href: "/dashboard/files", icon: Files },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved === "true") setCollapsed(true)
  }, [])

  useEffect(() => {
    if (mounted) localStorage.setItem("sidebar-collapsed", String(collapsed))
  }, [collapsed, mounted])

  function isActive(href: string) {
    if (href === "#") return false
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={`hidden shrink-0 border-r border-black/[0.10] bg-white/70 py-6 transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto ${
        collapsed ? "w-20 px-3" : "w-72 px-5"
      }`}
    >
      <div className={`flex items-center ${collapsed ? "flex-col gap-3" : "justify-between gap-2 px-1"}`}>
        {collapsed ? (
          <>
            <ClientFlowLogo variant="icon" height={28} />
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              title="Expand sidebar"
              className="flex size-7 items-center justify-center rounded-lg text-black/30 transition-colors hover:bg-[#f1f1ef] hover:text-black"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        ) : (
          <>
            <ClientFlowLogo variant="compact" height={28} />
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
              className="flex size-7 items-center justify-center rounded-lg text-black/30 transition-colors hover:bg-[#f1f1ef] hover:text-black"
            >
              <ChevronLeft className="size-4" />
            </button>
          </>
        )}
      </div>

      <nav className={`mt-10 space-y-1 text-sm ${collapsed ? "flex flex-col items-center" : ""}`}>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.label}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center rounded-xl transition-colors ${
                collapsed
                  ? "justify-center p-3"
                  : "gap-3 px-4 py-3"
              } ${
                active
                  ? "bg-black text-white"
                  : "text-muted-foreground hover:bg-[#f1f1ef] hover:text-black"
              }`}
            >
              <Icon className="size-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
