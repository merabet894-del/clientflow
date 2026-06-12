"use client"

import { useState, useActionState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { submitSalesLead } from "@/lib/actions/sales-leads"

export function WaitlistDialog({ planName }: { planName: string }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(submitSalesLead, null)

  const buttonLabel = planName === "Starter" ? "Request Pro access" : "Request access"
  const title = planName === "Starter" ? "Request Pro access" : "Request plan access"

  if (state?.success) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full rounded-full">{buttonLabel}</Button>
        </DialogTrigger>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request sent</DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-600"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p className="mt-4 text-sm text-black/60">{state.message}</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full rounded-full">{buttonLabel}</Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            formData.set("source", "dashboard_billing")
            formData.set("plan_interest", planName === "Custom" ? "Custom" : planName)
            formAction(formData)
          }}
          className="space-y-4"
        >
          <p className="text-sm leading-6 text-muted-foreground">
            Pro is not self-serve yet. Submit your details and we&rsquo;ll help you get set up.
          </p>

          <label className="space-y-2 block">
            <span className="text-xs font-medium text-muted-foreground">Email *</span>
            <input
              name="email"
              type="email"
              required
              placeholder="you@agency.com"
              className="w-full rounded-xl border border-black/10 bg-[#f7f7f5] px-4 py-2.5 text-sm outline-none placeholder:text-black/25 focus:border-black/25"
            />
          </label>

          <label className="space-y-2 block">
            <span className="text-xs font-medium text-muted-foreground">Plan interest</span>
            <select
              name="plan_interest"
              defaultValue={planName === "Custom" ? "Custom" : "Pro"}
              className="w-full rounded-xl border border-black/10 bg-[#f7f7f5] px-4 py-2.5 text-sm outline-none focus:border-black/25"
            >
              <option value="Pro">Pro</option>
              <option value="Custom">Custom</option>
            </select>
          </label>

          {state?.message && (
            <p className="text-sm text-rose-600">{state.message}</p>
          )}

          <Button type="submit" disabled={isPending} className="w-full rounded-full">
            {isPending ? "Submitting..." : buttonLabel}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
