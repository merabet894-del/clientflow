"use server"

import { createClient as createSupabaseClient } from "@/lib/supabase/server"

export async function submitPortalFeedback(token: string, _prev: unknown, formData: FormData) {
  const supabase = await createSupabaseClient()
  const body = formData.get("feedback") as string

  if (!body?.trim()) {
    return { success: false, message: "Feedback cannot be empty." }
  }

  const { data: rawProject, error: projectError } = await supabase
    .from("projects")
    .select("id, clients(name)")
    .eq("portal_token", token)
    .single()

  if (projectError || !rawProject) {
    return { success: false, message: "Project not found." }
  }

  const project = rawProject as unknown as { id: string; clients: { name: string } | null }

  const { error } = await supabase.from("comments").insert({
    project_id: project.id,
    author_type: "client",
    author_name: project.clients?.name ?? "Client",
    body: body.trim(),
  })

  if (error) {
    return { success: false, message: "Failed to submit feedback. Please try again." }
  }

  return { success: true, message: "Feedback sent. The agency can review it in the dashboard." }
}

export async function approvePortalProject(token: string, _prev: unknown, _formData: FormData) {
  const supabase = await createSupabaseClient()

  const { data: rawProject, error: projectError } = await supabase
    .from("projects")
    .select("id, name")
    .eq("portal_token", token)
    .single()

  if (projectError || !rawProject) {
    return { success: false, message: "Project not found." }
  }

  const project = rawProject as { id: string; name: string }

  const { error: insertError } = await supabase.from("approvals").insert({
    project_id: project.id,
    title: `${project.name} approval`,
    status: "approved",
    approved_at: new Date().toISOString(),
  })

  if (insertError) {
    return { success: false, message: "Failed to submit approval. Please try again." }
  }

  const { error: updateError } = await supabase
    .from("projects")
    .update({ status: "completed", progress: 100 })
    .eq("id", project.id)

  if (updateError) {
    return { success: false, message: "Approval recorded but status update failed." }
  }

  return { success: true, message: "Approved. The agency has been notified." }
}
