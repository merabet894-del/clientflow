"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
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

export function AddProjectDialog({ clients }: { clients: Client[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const formRef = useRef<HTMLFormElement>(null)
  const hasClients = clients.length > 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full">New project</Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
        </DialogHeader>
        <form
          ref={formRef}
          onSubmit={async (e) => {
            e.preventDefault()
            if (loading) return

            const form = new FormData(e.currentTarget)
            const client_id = form.get("client_id") as string

            if (hasClients && (!client_id || client_id === "none")) {
              setError("Please select a client.")
              return
            }

            setLoading(true)
            setError("")

            const result = await createProject(form)

            if (result?.success) {
              formRef.current?.reset()
              setLoading(false)
              setOpen(false)
              router.refresh()
            } else {
              setError(result?.error ?? "Something went wrong")
              setLoading(false)
            }
          }}
          className="space-y-4"
        >
          {error && (
            <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Project name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Website redesign"
              required
              className="rounded-xl bg-[#f7f7f5]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_id">Client</Label>
            <Select
              name="client_id"
              defaultValue={hasClients ? undefined : "none"}
            >
              <SelectTrigger id="client_id" className="w-full rounded-xl bg-[#f7f7f5]">
                <SelectValue placeholder="Choose client" />
              </SelectTrigger>
              <SelectContent>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Brief project description..."
              className="min-h-20 rounded-2xl bg-[#f7f7f5]"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Progress updates automatically as files are shared and approvals are completed.
          </p>

          <Button type="submit" className="w-full rounded-full" disabled={loading}>
            {loading ? "Creating..." : "Create project"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
