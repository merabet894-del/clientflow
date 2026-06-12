"use server"

import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import { ensureAgencyForCurrentUser, type Agency } from "./workspace"
import { formatFileSize, getFileType } from "@/lib/utils/files"
import { revalidatePath } from "next/cache"
import { bytesToMb, wouldExceedLimit } from "@/lib/billing"
import { getBillingOverview } from "./billing"

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

export async function getFiles(agencyId?: string): Promise<FileRecord[]> {
  if (!agencyId) {
    try { const a = await ensureAgencyForCurrentUser(); if (a) agencyId = a.id } catch { /* fail safe */ }
  }
  if (!agencyId) return []

  const supabase = await createSupabaseClient()
  const { data } = await supabase
    .from("files")
    .select("*, projects(name), clients(name)")
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: false })

  return (data ?? []) as unknown as FileRecord[]
}

export async function uploadFile(formData: FormData) {
  let agency: Agency | null = null
  try { agency = await ensureAgencyForCurrentUser() } catch (e) { return { success: false, error: e instanceof Error ? e.message : "Could not set up workspace." } }
  if (!agency) return { success: false, error: "Not authenticated." }

  const supabase = await createSupabaseClient()
  const file = formData.get("file") as File | null

  if (!file || file.size === 0) {
    return { success: false, error: "No file selected." }
  }

  const billing = await getBillingOverview()
  const uploadedMb = bytesToMb(file.size)
  if (billing && wouldExceedLimit(
    billing.usage.storageMb,
    uploadedMb,
    billing.limits.max_storage_mb
  )) {
    return {
      success: false,
      error: `${billing.planName} storage is full. Upgrade to upload more deliverables.`,
    }
  }

  const projectId = formData.get("project_id") as string | null
  const clientId = formData.get("client_id") as string | null

  if (!projectId || projectId === "none") {
    return { success: false, error: "Choose a project before uploading." }
  }

  const normalizedClientId = clientId && clientId !== "none" ? clientId : null
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
  const filePath = `${agency.id}/${projectId}/${Date.now()}-${safeName}`

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
    client_id: normalizedClientId,
    name: file.name,
    type: getFileType(file.name),
    size: formatFileSize(file.size),
    url: filePath,
  })

  if (insertError) {
    return { success: false, error: "File uploaded but metadata save failed." }
  }

  if (projectId) {
    const { data: project } = await supabase
      .from("projects")
      .select("progress")
      .eq("id", projectId)
      .single()

    const currentProgress = project?.progress ?? 0
    if (currentProgress < 40) {
      await supabase
        .from("projects")
        .update({ progress: 40 })
        .eq("id", projectId)
    }

    revalidatePath(`/dashboard/projects/${projectId}`)
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/files")
  return { success: true }
}

export async function getProjectFiles(projectId: string, agencyId?: string) {
  if (!agencyId) {
    try { const a = await ensureAgencyForCurrentUser(); if (a) agencyId = a.id } catch { /* fail safe */ }
  }
  if (!agencyId) return []

  const supabase = await createSupabaseClient()
  const { data } = await supabase
    .from("files")
    .select("id, name, type, size, url, created_at")
    .eq("agency_id", agencyId)
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
