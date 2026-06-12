"use server"

import { revalidatePath } from "next/cache"
import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import { createClientNotification } from "@/lib/actions/notifications"

function isCompletedStatus(status: string) {
  return status === "completed" || status === "approved"
}

function isWaitingApprovalStatus(status: string) {
  return status === "waiting approval" || status === "waiting_approval"
}

export async function submitPortalFeedback(token: string, _prev: unknown, formData: FormData) {
  const supabase = await createSupabaseClient()
  const body = formData.get("feedback") as string

  if (!body?.trim()) {
    return { success: false, message: "Feedback cannot be empty." }
  }

  const { data: rawProject, error: projectError } = await supabase
    .from("projects")
    .select("id, agency_id, client_id, name, status, clients(name)")
    .eq("portal_token", token)
    .single()

  if (projectError || !rawProject) {
    return { success: false, message: "Project not found." }
  }

  const project = rawProject as unknown as {
    id: string
    agency_id: string
    client_id: string | null
    name: string
    status: string
    clients: { name: string } | null
  }

  if (isCompletedStatus(project.status)) {
    return { success: false, message: "This project is already completed." }
  }

  if (!isWaitingApprovalStatus(project.status)) {
    return { success: false, message: "The agency will request feedback or approval when the deliverable is ready." }
  }

  const { error: commentError } = await supabase.from("comments").insert({
    project_id: project.id,
    author_type: "client",
    author_name: project.clients?.name ?? "Client",
    body: body.trim(),
  })

  if (commentError) {
    return { success: false, message: "Failed to submit feedback. Please try again." }
  }

  await supabase
    .from("projects")
    .update({ status: "client feedback", progress: 70 })
    .eq("id", project.id)

  await createClientNotification({
    agencyId: project.agency_id,
    projectId: project.id,
    clientId: project.client_id,
    type: "feedback",
    title: "Feedback received",
    message: `${project.clients?.name ?? "Client"} left feedback on ${project.name}`,
    targetHref: `/dashboard/projects/${project.id}?tab=feedback`,
  })

  revalidatePath(`/portal/${token}`)
  revalidatePath("/dashboard")
  revalidatePath(`/dashboard/projects/${project.id}`)

  return { success: true, message: "Your feedback was sent to the agency." }
}

export async function approvePortalProject(token: string, _prev: unknown, _formData: FormData) {
  const supabase = await createSupabaseClient()

  const { data: rawProject, error: projectError } = await supabase
    .from("projects")
    .select("id, agency_id, client_id, name, status")
    .eq("portal_token", token)
    .single()

  if (projectError || !rawProject) {
    return { success: false, message: "Project not found." }
  }

  const project = rawProject as {
    id: string
    agency_id: string
    client_id: string | null
    name: string
    status: string
  }

  if (isCompletedStatus(project.status)) {
    return { success: false, message: "This project is already completed." }
  }

  if (!isWaitingApprovalStatus(project.status)) {
    return { success: false, message: "This project is not ready for approval yet." }
  }

  const [{ count: fileCount }, { data: existingApprovals }] = await Promise.all([
    supabase
      .from("files")
      .select("*", { count: "exact", head: true })
      .eq("project_id", project.id),
    supabase
      .from("approvals")
      .select("id")
      .eq("project_id", project.id)
      .in("status", ["pending", "waiting approval", "waiting_approval"])
      .order("created_at", { ascending: false }),
  ])

  if (!fileCount || fileCount === 0) {
    return { success: false, message: "No files shared yet. The agency will upload deliverables here." }
  }

  const approvalIds = (existingApprovals ?? []).map((approval) => approval.id)

  if (approvalIds.length === 0) {
    return { success: false, message: "No pending approval request found." }
  }

  const { error: updateApprovalError } = await supabase
    .from("approvals")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .in("id", approvalIds)

  if (updateApprovalError) {
    return { success: false, message: "Failed to update approval. Please try again." }
  }

  const { error: updateError } = await supabase
    .from("projects")
    .update({ status: "completed", progress: 100 })
    .eq("id", project.id)

  if (updateError) {
    return { success: false, message: "Approval recorded but status update failed." }
  }

  await createClientNotification({
    agencyId: project.agency_id,
    projectId: project.id,
    clientId: project.client_id,
    type: "approval",
    title: "Approval completed",
    message: `${project.name} was approved by the client`,
    targetHref: `/dashboard/projects/${project.id}?tab=approvals`,
  })

  revalidatePath(`/portal/${token}`)
  revalidatePath("/dashboard")
  revalidatePath(`/dashboard/projects/${project.id}`)

  return { success: true, message: "Approved. The agency has been notified." }
}
