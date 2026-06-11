"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
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
import { Upload, X } from "lucide-react"

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
}: {
  projects: Project[]
  clients: Client[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((file: File | null) => {
    setSelectedFile(file)
    setError("")
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    handleFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
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
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedFile || !selectedProjectId) return
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const result = await uploadFile(formData)

    if (result?.success) {
      formRef.current?.reset()
      setSelectedFile(null)
      setSelectedProjectId("")
      setOpen(false)
      router.refresh()
    } else {
      setError(result?.error ?? "Something went wrong")
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full">Upload file</Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload file</DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="project_id">Project</Label>
            <Select
              name="project_id"
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
              required
            >
              <SelectTrigger id="project_id" className="w-full rounded-xl bg-[#f7f7f5]">
                <SelectValue placeholder="Choose a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs leading-5 text-muted-foreground">
              Choose the project this file belongs to. Project files appear in the client portal.
            </p>
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

          <div className="space-y-2">
            <Label>File</Label>
            <input
              ref={fileInputRef}
              name="file"
              type="file"
              onChange={handleInputChange}
              className="hidden"
            />
            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors ${
                  dragOver
                    ? "border-black bg-[#F0EFE9]"
                    : "border-black/15 bg-[#f7f7f5] hover:border-black/30"
                }`}
              >
                <Upload className="mb-3 size-8 text-black/30" />
                <p className="text-sm font-medium text-black">Drop your file here</p>
                <p className="mt-1 text-xs text-black/40">or click to browse</p>
                <p className="mt-4 text-[11px] text-black/30">
                  PDF, images, videos, and project files supported
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-[#f7f7f5] p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-black">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-black/40">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="flex size-7 items-center justify-center rounded-full bg-white text-black/40 hover:bg-black/5 hover:text-black/70"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full rounded-full"
            disabled={!selectedFile || !selectedProjectId || loading}
          >
            {loading ? "Uploading..." : "Upload file"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
