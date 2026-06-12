"use client"

import { Suspense, useActionState, useCallback } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { ClientFlowLogo } from "@/components/brand/clientflow-logo"
import { submitSalesLead } from "@/lib/actions/sales-leads"

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] tracking-widest font-sans text-black/40 bg-black/[0.04]">
      {children}
    </span>
  )
}

export default function ContactSalesPage() {
  return (
    <Suspense>
      <ContactSalesForm />
    </Suspense>
  )
}

function ContactSalesForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planParam = searchParams.get("plan")
  const isPro = planParam === "pro"
  const defaultPlan = planParam === "agency" ? "Custom" : isPro ? "Pro" : "Pro"
  const [state, formAction, isPending] = useActionState(submitSalesLead, null)

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push("/")
    }
  }, [router])

  return (
    <div className="bg-[#F5F4F0] text-[#111] min-h-screen font-sans antialiased">
      <header className="relative z-50 flex items-center justify-between px-6 py-4 md:px-12 lg:px-20">
        <Link href="/">
          <ClientFlowLogo variant="compact" height={28} />
        </Link>
        <Link
          href={isPro ? "/auth?plan=starter" : "/auth"}
          className="text-xs tracking-widest text-black/40 hover:text-black/70 transition-colors"
        >
          START FREE
        </Link>
      </header>

      <main className="px-6 pb-16 md:px-12 lg:px-20">
        <div className="mx-auto max-w-xl">
          <button
            type="button"
            onClick={goBack}
            className="mb-4 flex items-center gap-1.5 text-xs tracking-widest text-black/30 hover:text-black/60 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="15 18 9 12 15 6"/></svg>
            GO BACK
          </button>

          <div className="mb-1">
            <Tag>{isPro ? "PRO ACCESS" : "CONTACT SALES"}</Tag>
          </div>
          <h1 className="mt-3 text-3xl font-light tracking-tight md:text-4xl">
            {isPro ? "Request Pro access" : "Talk to us about ClientFlow"}
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-6 text-black/50">
            {isPro
              ? "Tell us about your agency and we'll help you get set up with Pro."
              : "Tell us about your agency workflow and we'll help you choose the right plan."}
          </p>

          {state?.success ? (
            <div className="mt-8 rounded-2xl border border-black/10 bg-white p-10 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-600"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p className="mt-5 text-xl font-medium">{state.message}</p>
              <p className="mt-2 text-sm text-black/50">We review every inquiry and will follow up shortly.</p>
              <Link href={isPro ? "/auth?plan=starter" : "/"}>
                <button className="mt-8 rounded-full border border-black/10 px-6 py-2.5 text-sm tracking-widest text-black/60 transition-all hover:border-black/25 hover:text-black">
                  {isPro ? "START FREE TRIAL" : "BACK HOME"}
                </button>
              </Link>
            </div>
          ) : (
            <form action={formAction} className="mt-6 space-y-4">
              <input type="hidden" name="plan_interest" value={defaultPlan} />
              <input type="hidden" name="source" value="pricing" />

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-black/50 tracking-wide">Name</span>
                  <input
                    name="name"
                    placeholder="Your name"
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-black/25 focus:border-black/25"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-black/50 tracking-wide">Work email *</span>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="you@agency.com"
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-black/25 focus:border-black/25"
                  />
                </label>
              </div>

              <label className="space-y-1.5">
                <span className="text-xs font-medium text-black/50 tracking-wide">Agency / company</span>
                <input
                  name="company"
                  placeholder="Agency name"
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-black/25 focus:border-black/25"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-black/50 tracking-wide">Plan interest</span>
                  <select
                    name="plan_interest"
                    defaultValue={defaultPlan}
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-black outline-none transition-all focus:border-black/25"
                  >
                    <option value="Pro">Pro</option>
                    <option value="Custom">Custom</option>
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-black/50 tracking-wide">Team size</span>
                  <input
                    name="team_size"
                    placeholder="e.g. 5"
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-black/25 focus:border-black/25"
                  />
                </label>
              </div>

              <label className="space-y-1.5">
                <span className="text-xs font-medium text-black/50 tracking-wide">Number of clients</span>
                <input
                  name="clients_count"
                  placeholder="e.g. 20"
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-black/25 focus:border-black/25"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-medium text-black/50 tracking-wide">Message (optional)</span>
                <textarea
                  name="message"
                  rows={3}
                  placeholder="Tell us about your workflow and what you need..."
                  className="w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-black/25 focus:border-black/25"
                />
              </label>

              {state?.message && (
                <p className="text-sm text-rose-600">{state.message}</p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-xl bg-[#111] py-3 text-sm tracking-widest text-white transition-all hover:bg-[#333] disabled:opacity-50"
              >
                {isPending ? "SENDING..." : "CONTACT SALES"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
