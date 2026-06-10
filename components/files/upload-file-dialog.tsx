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
import { uploadFile } from "@/lib/actions/files"
import type { Client } from "@/lib/actions/clients"
import type { Project } from "@/lib/actions/projects"

export function UploadFileDialog({
  projects,
  clients,
}: {
  projects: Project[]
  clients: Client[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full">Upload file</Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload file</DialogTitle>
        </DialogHeader>
        <form
          ref={formRef}
          onSubmit={async (e) => {
            e.preventDefault()
            setLoading(true)
            setError("")

            const result = await uploadFile(new FormData(e.currentTarget))

            if (result?.success) {
              formRef.current?.reset()
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
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              name="file"
              type="file"
              required
              className="rounded-xl bg-[#f7f7f5]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project_id">Project (optional)</Label>
            <Select name="project_id">
              <SelectTrigger id="project_id" className="w-full rounded-xl bg-[#f7f7f5]">
                <SelectValue placeholder="No project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No project</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_id">Client (optional)</Label>
            <Select name="client_id">
              <SelectTrigger id="client_id" className="w-full rounded-xl bg-[#f7f7f5]">
                <SelectValue placeholder="No client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No client</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full rounded-full" disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
