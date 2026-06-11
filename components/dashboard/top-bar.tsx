"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Search, CircleHelp, Lightbulb, Settings, LogOut, LayoutDashboard, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

type Breadcrumb = { label: string; href?: string }

const pageLabels: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/clients": "Clients",
  "/dashboard/projects": "Projects",
  "/dashboard/approvals": "Approvals",
  "/dashboard/files": "Files",
  "/dashboard/settings": "Settings",
}

function getBreadcrumbs(pathname: string): Breadcrumb[] {
  const detailMatch = pathname.match(/^(\/dashboard\/(clients|projects))\/(.+)$/)
  if (detailMatch) {
    const type = detailMatch[2]
    const detailLabel = type === "clients" ? "Client detail" : "Project detail"
    const parentLabel = type === "clients" ? "Clients" : "Projects"
    const parentHref = `/dashboard/${type === "clients" ? "clients" : "projects"}`
    return [
      { label: "Dashboard", href: "/dashboard" },
      { label: parentLabel, href: parentHref },
      { label: detailLabel },
    ]
  }

  const label = pageLabels[pathname]
  if (!label) return [{ label: "Dashboard" }]
  if (pathname === "/dashboard") return [{ label: "Dashboard" }, { label }]
  return [
    { label: "Dashboard", href: "/dashboard" },
    { label },
  ]
}

export function TopBar() {
  const router = useRouter()
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumbs(pathname)

  async function handleSignOut() {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // Supabase may not be configured yet
    }
    router.push("/auth")
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-black/[0.10] bg-white/90 px-6 backdrop-blur-sm lg:px-8">
      <nav className="flex min-w-0 items-center gap-1.5 text-xs text-black/40 max-sm:hidden">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.label} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="size-3 shrink-0" />}
            {crumb.href ? (
              <Link href={crumb.href} className="transition-colors hover:text-black/70">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-black/80">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
      <span className="hidden max-sm:block text-xs font-medium text-black/60">
        {breadcrumbs[breadcrumbs.length - 1].label}
      </span>

      <div className="flex items-center gap-2 sm:gap-3">
        <a
          href="#"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-black/50 transition-colors hover:text-black/80"
        >
          Feedback
        </a>

        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-black/30" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-48 rounded-full border border-black/[0.08] bg-black/[0.03] pe-10 ps-9 text-xs text-[#111] placeholder:text-black/30 outline-none transition-colors focus:w-64 focus:border-black/20 focus:bg-white"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-black/[0.06] bg-white px-1.5 py-0.5 text-[10px] font-medium text-black/30">
            Ctrl K
          </kbd>
        </div>

        <button
          type="button"
          title="Help"
          className="flex size-9 items-center justify-center rounded-full border border-black/[0.08] text-black/40 transition-colors hover:border-black/15 hover:text-black/70"
        >
          <CircleHelp className="size-4" />
        </button>

        <button
          type="button"
          title="Advisor Center"
          className="flex size-9 items-center justify-center rounded-full border border-black/[0.08] text-black/40 transition-colors hover:border-black/15 hover:text-black/70"
        >
          <Lightbulb className="size-4" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              title="Account settings"
              className="flex size-9 items-center justify-center rounded-full border border-black/[0.08] text-black/40 transition-colors hover:border-black/15 hover:text-black/70"
            >
              <Settings className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
                <Settings className="size-4" />
                Account settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                <LayoutDashboard className="size-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
