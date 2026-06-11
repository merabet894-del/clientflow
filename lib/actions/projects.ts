import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import { ensureAgencyForCurrentUser } from "./workspace"

export type Project = {
  id: string
  agency_id: string
  client_id: string | null
  name: string
  description: string | null
  status: string
  progress: number
  portal_token: string
  created_at: string
  updated_at: string
  clients: { name: string; email: string | null; company: string | null } | null
}

function safeProgress(project: { status: string; progress: number | null }): number {
  if (project.status === "completed" || project.status === "approved") return 100
  if (project.status === "waiting approval" || project.status === "waiting_approval") return 70
  if (project.status === "client feedback" || project.status === "needs changes" || project.status === "needs_changes") return 70
  return project.progress ?? 10
}

export async function getProjects() {
  const agency = await ensureAgencyForCurrentUser()
  if (!agency) return []

  const supabase = await createSupabaseClient()
  const { data } = await supabase
    .from("projects")
    .select("*, clients(name, email, company)")
    .eq("agency_id", agency.id)
    .order("created_at", { ascending: false })

  return ((data ?? []) as (Omit<Project, "progress"> & { progress: number | null })[]).map((p) => ({
    ...p,
    progress: safeProgress(p),
  })) as Project[]
}

export async function getProjectById(id: string) {
  const agency = await ensureAgencyForCurrentUser()
  if (!agency) return null

  const supabase = await createSupabaseClient()
  const { data } = await supabase
    .from("projects")
    .select("*, clients(name, email, company, id)")
    .eq("id", id)
    .eq("agency_id", agency.id)
    .single()

  if (!data) return null

  const raw = data as unknown as { status: string; progress: number | null }
  return { ...data, progress: safeProgress(raw) } as Project
}

export type Comment = {
  id: string
  project_id: string
  author_type: string
  author_name: string | null
  body: string
  created_at: string
}

export async function getProjectsByClientId(clientId: string) {
  const agency = await ensureAgencyForCurrentUser()
  if (!agency) return []

  const supabase = await createSupabaseClient()
  const { data } = await supabase
    .from("projects")
    .select("*, clients(name, email, company)")
    .eq("agency_id", agency.id)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })

  return ((data ?? []) as (Omit<Project, "progress"> & { progress: number | null })[]).map((p) => ({
    ...p,
    progress: safeProgress(p),
  })) as Project[]
}

export type Approval = {
  id: string
  project_id: string
  title: string
  status: string
  feedback: string | null
  approved_at: string | null
  created_at: string
}

export async function getCommentsByProjectId(projectId: string) {
  const agency = await ensureAgencyForCurrentUser()
  if (!agency) return []

  const supabase = await createSupabaseClient()
  const { data } = await supabase
    .from("comments")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })

  return (data ?? []) as Comment[]
}

export async function getApprovalsByProjectId(projectId: string) {
  const agency = await ensureAgencyForCurrentUser()
  if (!agency) return []

  const supabase = await createSupabaseClient()
  const { data } = await supabase
    .from("approvals")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })

  return (data ?? []) as Approval[]
}
