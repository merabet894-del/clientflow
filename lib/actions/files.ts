"use server"

import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import { ensureAgencyForCurrentUser } from "./workspace"
import { formatFileSize, getFileType } from "@/lib/utils/files"
import { revalidatePath } from "next/cache"

export type FileRecord = {
  id: string
  agency_id: string
  project_id: string | null
  client_id: string | null
  name: string
  type: string | null
  size: string | null
  url: string | null
  created_at: string
  projects: { name: string } | null
  clients: { name: string } | null
}

export async function getFiles(): Promise<FileRecord[]> {
  const agency = await ensureAgencyForCurrentUser()
  if (!agency) return []

  const supabase = await createSupabaseClient()
  const { data } = await supabase
    .from("files")
    .select("*, projects(name), clients(name)")
    .eq("agency_id", agency.id)
    .order("created_at", { ascending: false })

  return (data ?? []) as unknown as FileRecord[]
}

export async function uploadFile(formData: FormData) {
  const agency = await ensureAgencyForCurrentUser()
  if (!agency) return { success: false, error: "Not authenticated." }

  const supabase = await createSupabaseClient()
  const file = formData.get("file") as File | null

  if (!file || file.size === 0) {
    return { success: false, error: "No file selected." }
  }

  const projectId = formData.get("project_id") as string | null
  const clientId = formData.get("client_id") as string | null
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
  const filePath = `${agency.id}/${projectId || "general"}/${Date.now()}-${safeName}`

  const arrayBuffer = await file.arrayBuffer()

  const { error: storageError } = await supabase.storage
    .from("clientflow-files")
    .upload(filePath, arrayBuffer, {
      contentType: file.type || "application/octet-stream",
    })

  if (storageError) {
    return { success: false, error: "Upload failed. Please try again." }
  }

  const { error: insertError } = await supabase.from("files").insert({
    agency_id: agency.id,
    project_id: projectId || null,
    client_id: clientId || null,
    name: file.name,
    type: getFileType(file.name),
    size: formatFileSize(file.size),
    url: filePath,
  })

  if (insertError) {
    return { success: false, error: "File uploaded but metadata save failed." }
  }

  revalidatePath("/dashboard/files")
  return { success: true }
}

export async function getProjectFiles(projectId: string) {
  const agency = await ensureAgencyForCurrentUser()
  if (!agency) return []

  const supabase = await createSupabaseClient()
  const { data } = await supabase
    .from("files")
    .select("id, name, type, size, url, created_at")
    .eq("agency_id", agency.id)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })

  return (data ?? []) as unknown as FileRecord[]
}

export async function getFileSignedUrl(storagePath: string) {
  const supabase = await createSupabaseClient()
  const { data } = await supabase.storage
    .from("clientflow-files")
    .createSignedUrl(storagePath, 60)

  if (!data) return null
  return data.signedUrl
}
