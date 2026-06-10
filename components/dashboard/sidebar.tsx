"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Clients", href: "/dashboard/clients" },
  { label: "Projects", href: "/dashboard/projects" },
  { label: "Approvals", href: "/dashboard/approvals" },
  { label: "Files", href: "/dashboard/files" },
  { label: "Settings", href: "/dashboard/settings" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // Supabase may not be configured yet
    }
    router.push("/auth")
  }

  function isActive(href: string) {
    if (href === "#") return false
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  return (
    <aside className="hidden w-72 shrink-0 border-r bg-white/70 px-5 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-sm font-semibold text-white">
          C
        </div>
        <span className="text-lg font-semibold tracking-tight">ClientFlow</span>
      </div>

      <nav className="mt-10 space-y-1 text-sm">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`block rounded-xl px-4 py-3 ${
              isActive(item.href)
                ? "bg-black text-white"
                : "text-muted-foreground hover:bg-[#f1f1ef] hover:text-black"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto border-t pt-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f1f1ef] text-xs font-medium">
            CA
          </div>
          <div className="flex-1 truncate">
            <p className="font-medium">ClientFlow Agency</p>
            <p className="text-xs text-muted-foreground">hello@clientflow.co</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-3 w-full rounded-xl px-4 py-2.5 text-left text-sm text-muted-foreground hover:bg-[#f1f1ef] hover:text-black"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
