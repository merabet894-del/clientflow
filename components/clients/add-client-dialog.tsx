"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClientFormAction } from "@/lib/actions/create-client"

type PlanGate = {
  disabled?: boolean
  message?: string
  usageLabel?: string
}

export function AddClientDialog({ planGate }: { planGate?: PlanGate }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  const openDialog = () => {
    if (planGate?.disabled) return
    setDialogKey((key) => key + 1)
    setOpen(true)
  }

  return (
    <>
      <Button type="button" className="rounded-full" onClick={openDialog} disabled={planGate?.disabled}>
        Add client
      </Button>
      {planGate?.disabled ? (
        <p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground">
          {planGate.message}
        </p>
      ) : null}
      <Dialog open={open} onOpenChange={setOpen}>
        {open && (
          <AddClientDialogForm
            key={dialogKey}
            planGate={planGate}
            onCreated={() => {
              setOpen(false)
              router.refresh()
            }}
          />
        )}
      </Dialog>
    </>
  )
}

function AddClientDialogForm({ onCreated, planGate }: { onCreated: () => void; planGate?: PlanGate }) {
  const [state, formAction, isPending] = useActionState(createClientFormAction, null)
  const [clientName, setClientName] = useState("")
  const [nameError, setNameError] = useState("")
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success && state.clientId) {
      formRef.current?.reset()
      onCreated()
    }
  }, [onCreated, state?.clientId, state?.success])

  return (
    <DialogContent className="gap-0 overflow-hidden rounded-3xl border border-black/10 bg-white p-0 shadow-2xl shadow-black/10 sm:max-w-[520px]">
      <DialogHeader className="border-b border-black/[0.06] px-6 pb-5 pt-6">
        <DialogTitle className="text-xl font-semibold tracking-tight">Add client</DialogTitle>
        <DialogDescription className="max-w-md leading-6">
          Create a client record to start managing projects, files, and approvals.
          {planGate?.usageLabel ? ` Current usage: ${planGate.usageLabel}.` : ""}
        </DialogDescription>
      </DialogHeader>
      <form
        ref={formRef}
        action={formAction}
        noValidate
        onSubmit={(event) => {
          if (!clientName.trim()) {
            event.preventDefault()
            setNameError("Client name is required.")
          }
        }}
        className="space-y-5 px-6 py-6"
      >
          {state?.error && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
              {state.error}
            </div>
          )}

          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="name" className="text-sm font-medium text-black">Client name</Label>
              <span className="text-xs text-muted-foreground">Required</span>
            </div>
            <Input
              id="name"
              name="name"
              value={clientName}
              onChange={(event) => {
                setClientName(event.target.value)
                if (nameError) setNameError("")
              }}
              placeholder="Acme Creative"
              required
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? "name-error" : "name-help"}
              className="h-11 rounded-xl border-black/10 bg-[#f7f7f5] px-3.5 placeholder:text-black/35 focus-visible:border-black/30 focus-visible:ring-black/10"
            />
            {nameError ? (
              <p id="name-error" className="text-xs leading-5 text-rose-700">{nameError}</p>
            ) : (
              <p id="name-help" className="text-xs leading-5 text-muted-foreground">
                Use the client or organization name your team will recognize.
              </p>
            )}
          </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="email" className="text-sm font-medium text-black">Email</Label>
              <span className="text-xs text-muted-foreground">Optional</span>
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="maya@acme.co"
              className="h-11 rounded-xl border-black/10 bg-[#f7f7f5] px-3.5 placeholder:text-black/35 focus-visible:border-black/30 focus-visible:ring-black/10"
            />
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="company" className="text-sm font-medium text-black">Company</Label>
              <span className="text-xs text-muted-foreground">Optional</span>
            </div>
            <Input
              id="company"
              name="company"
              placeholder="Acme Studio"
              className="h-11 rounded-xl border-black/10 bg-[#f7f7f5] px-3.5 placeholder:text-black/35 focus-visible:border-black/30 focus-visible:ring-black/10"
            />
          </div>
          </div>

          <DialogFooter className="-mx-6 -mb-6 mt-6 border-t border-black/[0.06] bg-[#fbfbfa] px-6 py-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="h-10 rounded-full bg-white px-5">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="h-10 rounded-full px-5 shadow-sm" disabled={isPending}>
              {isPending ? "Creating client..." : "Create client"}
            </Button>
          </DialogFooter>
      </form>
    </DialogContent>
  )
}
