"use client"

import { useState, useEffect } from "react"
import { ClientFlowLogo } from "@/components/brand/clientflow-logo"
import { createClient } from "@/lib/supabase/client"

const NAV_LINKS = [
  { label: "Features",     href: "#platform" },
  { label: "How it Works", href: "#workflow" },
  { label: "Pricing",      href: "#pricing" },
  { label: "Demo",         href: "#demo" },
]

const NAV_STYLE = {
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  background: "rgba(245,244,240,0.30)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)",
} as const

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
    })
  }, [])

  const close = () => setOpen(false)

  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-3xl">

        <nav
          className="flex items-center justify-between px-5 py-3 rounded-2xl border border-black/[0.06]"
          style={NAV_STYLE}
        >
          <a href="/">
            <ClientFlowLogo variant="compact" height={28} />
          </a>

          <div className="hidden md:flex items-center gap-7" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                className="text-[11px] text-black/60 hover:text-black transition-colors duration-200 tracking-wide"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <a
                href="/dashboard"
                className="text-[11px] px-4 py-2 rounded-full bg-[#111] text-white hover:bg-[#333] transition-all duration-200 tracking-wide"
                style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
              >
                Go dashboard
              </a>
            ) : (
              <>
                <a
                  href="/auth"
                  className="text-[11px] px-4 py-2 rounded-full border border-black/10 text-black/60 hover:text-black hover:border-black/20 hover:bg-black/[0.03] transition-all duration-200 tracking-wide"
                  style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                >
                  Sign in
                </a>
                <a
                  href="/auth"
                  className="text-[11px] px-4 py-2 rounded-full bg-[#111] text-white hover:bg-[#333] transition-all duration-200 tracking-wide"
                  style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                >
                  START FREE
                </a>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen(v => !v)}
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] rounded-lg hover:bg-black/[0.04] transition-colors"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <span
              className="block h-px bg-black/60 transition-all duration-300 origin-center"
              style={{
                width: "18px",
                transform: open ? "translateY(6px) rotate(45deg)" : "none",
              }}
            />
            <span
              className="block h-px bg-black/60 transition-all duration-300"
              style={{
                width: "18px",
                opacity: open ? 0 : 1,
                transform: open ? "scaleX(0)" : "none",
              }}
            />
            <span
              className="block h-px bg-black/60 transition-all duration-300 origin-center"
              style={{
                width: "18px",
                transform: open ? "translateY(-6px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </nav>

        <div
          className="md:hidden mt-2 overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: open ? "500px" : "0px", opacity: open ? 1 : 0 }}
        >
          <div
            className="rounded-2xl border border-black/[0.06] px-2 py-2 flex flex-col"
            style={NAV_STYLE}
          >
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                onClick={close}
                className="px-4 py-3 text-sm text-black/60 hover:text-black hover:bg-black/[0.03] rounded-xl transition-colors tracking-wide"
                style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 px-2 pb-2 flex flex-col gap-2">
              {isLoggedIn ? (
                <a
                  href="/dashboard"
                  onClick={close}
                  className="block w-full text-center text-[11px] px-4 py-2.5 rounded-full bg-[#111] text-white hover:bg-[#333] transition-all duration-200 tracking-wide"
                  style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                >
                  Go dashboard
                </a>
              ) : (
                <>
                  <a
                    href="/auth"
                    onClick={close}
                    className="block w-full text-center text-[11px] px-4 py-2.5 rounded-full border border-black/10 text-black/60 hover:text-black hover:border-black/20 hover:bg-black/[0.03] transition-all duration-200 tracking-wide"
                    style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                  >
                    Sign in
                  </a>
                  <a
                    href="/auth"
                    onClick={close}
                    className="block w-full text-center text-[11px] px-4 py-2.5 rounded-full bg-[#111] text-white hover:bg-[#333] transition-all duration-200 tracking-wide"
                    style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                  >
                    START FREE
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
