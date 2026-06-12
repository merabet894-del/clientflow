"use client"

import { useState, useRef, useCallback } from "react"
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
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { FileText, Upload, X } from "lucide-react"

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function UploadFileDialog({
  projects,
  clients,
  planGate,
}: {
  projects: Project[]
  clients: Client[]
  planGate?: {
    disabled?: boolean
    message?: string
    usageLabel?: string
  }
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ project_id?: string; file?: string }>({})
  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hasProjects = projects.length > 0
  const disabledByPlan = Boolean(planGate?.disabled)

  const handleFileSelect = useCallback((file: File | null) => {
    setSelectedFile(file)
    setError("")
    setFieldErrors((current) => ({ ...current, file: undefined }))
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    handleFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (!hasProjects || disabledByPlan) return
    const file = e.dataTransfer.files?.[0] ?? null
    if (file) {
      handleFileSelect(file)
      if (fileInputRef.current) {
        const dt = new DataTransfer()
        dt.items.add(file)
        fileInputRef.current.files = dt.files
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!hasProjects || disabledByPlan) return
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setFieldErrors((current) => ({ ...current, file: "Select a deliverable to upload." }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const nextErrors: { project_id?: string; file?: string } = {}

    if (!hasProjects) {
      nextErrors.project_id = "Create a project before uploading files."
    } else if (disabledByPlan) {
      nextErrors.file = planGate?.message ?? "Storage limit reached."
    } else if (!selectedProjectId) {
      nextErrors.project_id = "Select the project this file belongs to."
    }

    if (!selectedFile) {
      nextErrors.file = "Select a deliverable to upload."
    }

    if (Object.keys(nextErrors).length > 0) {
      const message = nextErrors.project_id ?? nextErrors.file ?? "Choose a project and a file before uploading."
      setFieldErrors(nextErrors)
      setError(message)
      return
    }
    setLoading(true)
    setError("")
    setFieldErrors({})

    const formData = new FormData(e.currentTarget)
    const result = await uploadFile(formData)

    if (result?.success) {
      formRef.current?.reset()
      setSelectedFile(null)
      setSelectedProjectId("")
      setLoading(false)
      setOpen(false)
      router.refresh()
    } else {
      const message = result?.error ?? "Something went wrong"
      setError(message)
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="rounded-full" disabled={disabledByPlan}>Upload file</Button>
        </DialogTrigger>
        <DialogContent className="gap-0 overflow-hidden rounded-3xl border border-black/10 bg-white p-0 shadow-2xl shadow-black/10 sm:max-w-[600px]">
        <DialogHeader className="border-b border-black/[0.06] px-6 pb-5 pt-6">
          <DialogTitle className="text-xl font-semibold tracking-tight">Upload file</DialogTitle>
          <DialogDescription className="max-w-lg leading-6">
            Upload a deliverable and link it to a project so it can be shared with the client.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5 px-6 py-6">
          {error && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
              {error}
            </div>
          )}

          {disabledByPlan ? (
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
              {planGate?.message}
              {planGate?.usageLabel ? ` Current usage: ${planGate.usageLabel}.` : ""}
            </div>
          ) : null}

          {!hasProjects ? (
            <div className="rounded-2xl border border-black/[0.08] bg-[#f7f7f5] p-4">
              <p className="text-sm font-medium text-black">A project is required before upload.</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Deliverables need a project workspace so clients can review files in the right context.
              </p>
            </div>
          ) : null}

          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="project_id" className="text-sm font-medium text-black">Project</Label>
              <span className="text-xs text-muted-foreground">Required</span>
            </div>
            <Select
              name="project_id"
              value={selectedProjectId}
              onValueChange={(value) => {
                setSelectedProjectId(value)
                if (fieldErrors.project_id) setFieldErrors((current) => ({ ...current, project_id: undefined }))
              }}
              required
              disabled={!hasProjects || disabledByPlan}
            >
              <SelectTrigger
                id="project_id"
                aria-invalid={Boolean(fieldErrors.project_id)}
                aria-describedby={fieldErrors.project_id ? "project-error" : "project-help"}
                className="h-11 w-full rounded-xl border-black/10 bg-[#f7f7f5] px-3.5 focus-visible:border-black/30 focus-visible:ring-black/10"
              >
                <SelectValue placeholder={hasProjects ? "Choose a project" : "Create a project first"} />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-black/10">
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.project_id ? (
              <p id="project-error" className="text-xs leading-5 text-rose-700">{fieldErrors.project_id}</p>
            ) : (
              <p id="project-help" className="text-xs leading-5 text-muted-foreground">
                Project files appear in the client portal and project workspace.
              </p>
            )}
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="client_id" className="text-sm font-medium text-black">Client</Label>
              <span className="text-xs text-muted-foreground">Optional</span>
            </div>
            <Select name="client_id">
              <SelectTrigger id="client_id" className="h-11 w-full rounded-xl border-black/10 bg-[#f7f7f5] px-3.5 focus-visible:border-black/30 focus-visible:ring-black/10">
                <SelectValue placeholder="No direct client link" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-black/10">
                <SelectItem value="none">No direct client link</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="file-upload" className="text-sm font-medium text-black">File</Label>
              <span className="text-xs text-muted-foreground">Required</span>
            </div>
            <input
              id="file-upload"
              ref={fileInputRef}
              name="file"
              type="file"
              onChange={handleInputChange}
              className="hidden"
              disabled={!hasProjects}
              aria-describedby={fieldErrors.file ? "file-error" : "file-help"}
            />
            {!selectedFile ? (
              <div
                role="button"
                tabIndex={hasProjects && !disabledByPlan ? 0 : -1}
                onClick={() => {
                  if (hasProjects && !disabledByPlan) fileInputRef.current?.click()
                }}
                onKeyDown={(event) => {
                  if (hasProjects && !disabledByPlan && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault()
                    fileInputRef.current?.click()
                  }
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                aria-disabled={!hasProjects || disabledByPlan}
                className={`flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center transition-colors ${
                  !hasProjects || disabledByPlan
                    ? "cursor-not-allowed border-black/[0.08] bg-[#f7f7f5] opacity-60"
                    : dragOver
                      ? "cursor-copy border-black/40 bg-[#F0EFE9] ring-4 ring-black/[0.04]"
                      : "cursor-pointer border-black/15 bg-[#f7f7f5] hover:border-black/30 hover:bg-[#f3f3f0]"
                }`}
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-black/55 ring-1 ring-black/[0.06]">
                  <Upload className="size-5" />
                </div>
                <p className="mt-4 text-sm font-semibold text-black">Drop a deliverable here</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  or click to browse your files
                </p>
                <p id="file-help" className="mt-4 max-w-xs text-xs leading-5 text-black/45">
                  Supports PDFs, images, videos, documents, and project source files.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-[#f7f7f5] p-4 shadow-sm">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-black/60 ring-1 ring-black/[0.06]">
                  <FileText className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-black">
                    {selectedFile.name}
                  </p>
                  <p className="mt-0.5 text-xs text-black/45">
                    {formatFileSize(selectedFile.size)} ready to upload
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="flex size-8 items-center justify-center rounded-full bg-white text-black/45 ring-1 ring-black/[0.06] transition-colors hover:bg-black/5 hover:text-black/75"
                  aria-label="Remove selected file"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}
            {fieldErrors.file ? (
              <p id="file-error" className="text-xs leading-5 text-rose-700">{fieldErrors.file}</p>
            ) : null}
          </div>

          <DialogFooter className="-mx-6 -mb-6 mt-6 border-t border-black/[0.06] bg-[#fbfbfa] px-6 py-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="h-10 rounded-full bg-white px-5">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="h-10 rounded-full px-5 shadow-sm"
              disabled={loading || !hasProjects || disabledByPlan}
            >
              {loading ? "Uploading deliverable..." : "Upload deliverable"}
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
