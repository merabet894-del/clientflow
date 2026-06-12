"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createProject } from "@/lib/actions/create-project"
import type { Client } from "@/lib/actions/clients"

type PlanGate = {
  disabled?: boolean
  message?: string
  usageLabel?: string
}

export function AddProjectDialog({ clients, planGate }: { clients: Client[]; planGate?: PlanGate }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [name, setName] = useState("")
  const [selectedClientId, setSelectedClientId] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; client_id?: string }>({})
  const formRef = useRef<HTMLFormElement>(null)
  const hasClients = clients.length > 0
  const disabledByPlan = Boolean(planGate?.disabled)

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="rounded-full" disabled={disabledByPlan}>New project</Button>
        </DialogTrigger>
        <DialogContent className="gap-0 overflow-hidden rounded-3xl border border-black/10 bg-white p-0 shadow-2xl shadow-black/10 sm:max-w-[560px]">
        <DialogHeader className="border-b border-black/[0.06] px-6 pb-5 pt-6">
          <DialogTitle className="text-xl font-semibold tracking-tight">New project</DialogTitle>
          <DialogDescription className="max-w-md leading-6">
            Set up a project workspace for deliverables, feedback, and approvals.
            {planGate?.usageLabel ? ` Current usage: ${planGate.usageLabel}.` : ""}
          </DialogDescription>
        </DialogHeader>
        <form
          ref={formRef}
          noValidate
          onSubmit={async (e) => {
            e.preventDefault()
            if (loading) return

            const form = new FormData(e.currentTarget)
            const client_id = form.get("client_id") as string
            const nextErrors: { name?: string; client_id?: string } = {}

            if (!name.trim()) {
              nextErrors.name = "Project name is required."
            }

            if (!hasClients) {
              nextErrors.client_id = "Create a client before starting a project."
            } else if (!client_id || client_id === "none") {
              nextErrors.client_id = "Select the client this project belongs to."
            }

            if (Object.keys(nextErrors).length > 0) {
              const message = nextErrors.client_id ?? nextErrors.name ?? "Complete the required fields."
              setFieldErrors(nextErrors)
              setError(message)
              return
            }

            setLoading(true)
            setError("")
            setFieldErrors({})

            const result = await createProject(form)

            if (result?.success) {
              formRef.current?.reset()
              setName("")
              setSelectedClientId("")
              setLoading(false)
              setOpen(false)
              router.refresh()
            } else {
              const message = result?.error ?? "Something went wrong"
              setError(message)
              setLoading(false)
            }
          }}
          className="space-y-5 px-6 py-6"
        >
          {error && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
              {error}
            </div>
          )}

          {disabledByPlan ? (
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
              {planGate?.message}
            </div>
          ) : null}

          {!hasClients ? (
            <div className="rounded-2xl border border-black/[0.08] bg-[#f7f7f5] p-4">
              <p className="text-sm font-medium text-black">A client is required first.</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Projects are organized around client portals, so create a client record before starting a workspace.
              </p>
              <Button asChild variant="outline" className="mt-3 h-9 rounded-full bg-white px-4">
                <Link href="/dashboard/clients">Add client</Link>
              </Button>
            </div>
          ) : null}

          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="name" className="text-sm font-medium text-black">Project name</Label>
              <span className="text-xs text-muted-foreground">Required</span>
            </div>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                if (fieldErrors.name) setFieldErrors((current) => ({ ...current, name: undefined }))
              }}
              placeholder="Website relaunch"
              required
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "project-name-error" : "project-name-help"}
              className="h-11 rounded-xl border-black/10 bg-[#f7f7f5] px-3.5 placeholder:text-black/35 focus-visible:border-black/30 focus-visible:ring-black/10"
            />
            {fieldErrors.name ? (
              <p id="project-name-error" className="text-xs leading-5 text-rose-700">{fieldErrors.name}</p>
            ) : (
              <p id="project-name-help" className="text-xs leading-5 text-muted-foreground">
                Use a clear delivery name your team and client can recognize.
              </p>
            )}
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="client_id" className="text-sm font-medium text-black">Client</Label>
              <span className="text-xs text-muted-foreground">Required</span>
            </div>
            <Select
              name="client_id"
              value={selectedClientId}
              onValueChange={(value) => {
                setSelectedClientId(value)
                if (fieldErrors.client_id) setFieldErrors((current) => ({ ...current, client_id: undefined }))
              }}
              disabled={!hasClients}
            >
              <SelectTrigger
                id="client_id"
                aria-invalid={Boolean(fieldErrors.client_id)}
                aria-describedby={fieldErrors.client_id ? "client-error" : "client-help"}
                className="h-11 w-full rounded-xl border-black/10 bg-[#f7f7f5] px-3.5 focus-visible:border-black/30 focus-visible:ring-black/10"
              >
                <SelectValue placeholder={hasClients ? "Choose a client" : "Create a client first"} />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-black/10">
                {hasClients ? (
                  clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No clients yet
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {fieldErrors.client_id ? (
              <p id="client-error" className="text-xs leading-5 text-rose-700">{fieldErrors.client_id}</p>
            ) : (
              <p id="client-help" className="text-xs leading-5 text-muted-foreground">
                The selected client will see project updates through their portal.
              </p>
            )}
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="description" className="text-sm font-medium text-black">Description</Label>
              <span className="text-xs text-muted-foreground">Optional</span>
            </div>
            <Textarea
              id="description"
              name="description"
              placeholder="Briefly outline the deliverables, review rhythm, or approval expectations."
              className="min-h-28 resize-none rounded-xl border-black/10 bg-[#f7f7f5] px-3.5 py-3 placeholder:text-black/35 focus-visible:border-black/30 focus-visible:ring-black/10"
            />
          </div>

          <p className="rounded-2xl bg-[#f7f7f5] px-4 py-3 text-xs leading-5 text-muted-foreground">
            Progress updates automatically as files are shared and approvals are completed.
          </p>

          <DialogFooter className="-mx-6 -mb-6 mt-6 border-t border-black/[0.06] bg-[#fbfbfa] px-6 py-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="h-10 rounded-full bg-white px-5">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="h-10 rounded-full px-5 shadow-sm" disabled={loading || !hasClients || disabledByPlan}>
              {loading ? "Creating project..." : "Create project"}
            </Button>
          </DialogFooter>
        </form>
        </DialogContent>
      </Dialog>
      {disabledByPlan ? (
        <p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground">
          {planGate?.message}
        </p>
      ) : null}
    </>
  )
}
