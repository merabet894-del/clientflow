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

export async function getProjectByPortalToken(token: string) {
  const supabase = await createSupabaseClient()
  const { data } = await supabase
    .from("projects")
    .select("id, name, description, status, progress, portal_token, clients(name, email, company)")
    .eq("portal_token", token)
    .single()

  return data as PortalProject | null
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
