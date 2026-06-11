import { createClient as createSupabaseClient } from "@/lib/supabase/server"

export type PortalProject = {
  id: string
  name: string
  description: string | null
  status: string
  progress: number
  portal_token: string
  clients: { name: string; email: string | null; company: string | null } | null
}

export type PortalFile = {
  id: string
  name: string
  type: string | null
  size: string | null
  created_at: string
}

export type PortalComment = {
  id: string
  author_name: string | null
  body: string
  created_at: string
}

export type PortalApproval = {
  id: string
  title: string
  status: string
  feedback: string | null
  approved_at: string | null
  created_at: string
}

function safeProgress(status: string, progress: number | null): number {
  if (status === "completed" || status === "approved") return 100
  if (status === "waiting approval") return 70
  if (status === "client feedback") return 70
  return progress ?? 10
}

export async function getProjectByPortalToken(token: string) {
  const supabase = await createSupabaseClient()
  const { data } = await supabase
    .from("projects")
    .select("id, name, description, status, progress, portal_token, clients(name, email, company)")
    .eq("portal_token", token)
    .single()

  if (!data) return null

  const raw = data as unknown as { status: string; progress: number | null; clients: { name: string; email: string | null; company: string | null } | null }
  return {
    ...raw,
    progress: safeProgress(raw.status, raw.progress),
  } as PortalProject
}

export async function getPortalPendingApproval(token: string): Promise<boolean> {
  const supabase = await createSupabaseClient()

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("portal_token", token)
    .single()

  if (!project) return false

  const { count } = await supabase
    .from("approvals")
    .select("*", { count: "exact", head: true })
    .eq("project_id", project.id)
    .eq("status", "pending")

  return (count ?? 0) > 0
}

export async function getPortalProjectFiles(token: string): Promise<PortalFile[]> {
  const supabase = await createSupabaseClient()

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("portal_token", token)
    .single()

  if (!project) return []

  const { data } = await supabase
    .from("files")
    .select("id, name, type, size, created_at")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })

  return (data ?? []) as PortalFile[]
}

export async function getPortalComments(token: string): Promise<PortalComment[]> {
  const supabase = await createSupabaseClient()

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("portal_token", token)
    .single()

  if (!project) return []

  const { data } = await supabase
    .from("comments")
    .select("id, author_name, body, created_at")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })

  return (data ?? []) as PortalComment[]
}

export async function getPortalApprovals(token: string): Promise<PortalApproval[]> {
  const supabase = await createSupabaseClient()

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("portal_token", token)
    .single()

  if (!project) return []

  const { data } = await supabase
    .from("approvals")
    .select("id, title, status, feedback, approved_at, created_at")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })

  return (data ?? []) as PortalApproval[]
}
