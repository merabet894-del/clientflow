"use server"

import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import { ensureAgencyForCurrentUser } from "./workspace"
import { revalidatePath } from "next/cache"

export async function requestApproval(projectId: string) {
  let agency: Awaited<ReturnType<typeof ensureAgencyForCurrentUser>> = null
  try { agency = await ensureAgencyForCurrentUser() } catch (e) { return { success: false, error: e instanceof Error ? e.message : "Could not set up your workspace." } }
  if (!agency) return { success: false, error: "Not authenticated." }

  const supabase = await createSupabaseClient()

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, status")
    .eq("id", projectId)
    .eq("agency_id", agency.id)
    .single()

  if (!project) return { success: false, error: "Project not found." }
  if (project.status === "completed" || project.status === "approved") {
    return { success: false, error: "This project is already completed." }
  }

  const { count: fileCount } = await supabase
    .from("files")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId)

  if (!fileCount || fileCount === 0) {
    return { success: false, error: "Upload a file before requesting approval." }
  }

  const { data: existingApproval, error: existingApprovalError } = await supabase
    .from("approvals")
    .select("id")
    .eq("project_id", project.id)
    .in("status", ["pending", "waiting approval", "waiting_approval"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingApprovalError) {
    return { success: false, error: "Failed to check approval status." }
  }

  if (!existingApproval) {
    const { error: insertError } = await supabase.from("approvals").insert({
      project_id: project.id,
      title: `${project.name} approval`,
      status: "pending",
    })

    if (insertError) {
      return { success: false, error: "Failed to create approval request." }
    }
  }

  const { error: updateError } = await supabase
    .from("projects")
    .update({ status: "waiting approval", progress: 70 })
    .eq("id", project.id)

  if (updateError) {
    return { success: false, error: "Approval created but status update failed." }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/approvals")
  revalidatePath("/dashboard/projects")
  revalidatePath(`/dashboard/projects/${project.id}`)
  return {
    success: true,
    message: existingApproval
      ? "Approval request is already waiting for the client."
      : "Approval request sent. The client can now review it in the portal.",
  }
}
