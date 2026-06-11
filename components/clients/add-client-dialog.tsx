"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClientFormAction } from "@/lib/actions/create-client"

export function AddClientDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  const openDialog = () => {
    setDialogKey((key) => key + 1)
    setOpen(true)
  }

  return (
    <>
      <Button type="button" className="rounded-full" onClick={openDialog}>
        Add client
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        {open && (
          <AddClientDialogForm
            key={dialogKey}
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

function AddClientDialogForm({ onCreated }: { onCreated: () => void }) {
  const [state, formAction, isPending] = useActionState(createClientFormAction, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success && state.clientId) {
      formRef.current?.reset()
      onCreated()
    }
  }, [onCreated, state?.clientId, state?.success])

  return (
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add client</DialogTitle>
        </DialogHeader>
        <form
          ref={formRef}
          action={formAction}
          className="space-y-4"
        >
          {state?.error && (
            <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Client name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Agency client"
              required
              className="rounded-xl bg-[#f7f7f5]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="client@company.com"
              className="rounded-xl bg-[#f7f7f5]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              placeholder="Design studio"
              className="rounded-xl bg-[#f7f7f5]"
            />
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={isPending}>
            {isPending ? "Creating..." : "Add client"}
          </Button>
        </form>
      </DialogContent>
  )
}
