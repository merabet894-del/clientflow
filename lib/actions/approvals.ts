import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import { ensureAgencyForCurrentUser } from "./workspace"

export type ApprovalWithProject = {
  id: string
  project_id: string
  title: string
  status: string
  feedback: string | null
  approved_at: string | null
  created_at: string
  projects: {
    id: string
    name: string
    status: string
    clients: { name: string } | null
  } | null
}

export type ApprovalStats = {
  waitingApproval: number
  approvedThisMonth: number
  feedbackRequested: number
  averageApprovalTime: string
}

export async function getApprovals(agencyId?: string) {
  if (!agencyId) {
    try { const a = await ensureAgencyForCurrentUser(); if (a) agencyId = a.id } catch { /* fail safe */ }
  }
  if (!agencyId) return []

  const supabase = await createSupabaseClient()

  const { data: projectRows } = await supabase
    .from("projects")
    .select("id")
    .eq("agency_id", agencyId)

  const projectIds = (projectRows ?? []).map((p) => p.id)
  if (projectIds.length === 0) return []

  const { data } = await supabase
    .from("approvals")
    .select("*, projects(id, name, status, clients(name))")
    .in("project_id", projectIds)
    .order("created_at", { ascending: false })

  return (data ?? []) as unknown as ApprovalWithProject[]
}

export async function getApprovalStats(agencyId?: string) {
  if (!agencyId) {
    try { const a = await ensureAgencyForCurrentUser(); if (a) agencyId = a.id } catch { /* fail safe */ }
  }
  if (!agencyId) {
    return { waitingApproval: 0, approvedThisMonth: 0, feedbackRequested: 0, averageApprovalTime: "-" }
  }

  const supabase = await createSupabaseClient()

  const { data: projectRows } = await supabase
    .from("projects")
    .select("id")
    .eq("agency_id", agencyId)

  const projectIds = (projectRows ?? []).map((p) => p.id)

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [{ count: waitingCount }, { count: approvedThisMonth }, { count: feedbackCount }] =
    await Promise.all([
      projectIds.length > 0
        ? supabase
            .from("approvals")
            .select("*", { count: "exact", head: true })
            .in("project_id", projectIds)
            .eq("status", "pending")
        : { count: 0 },
      projectIds.length > 0
        ? supabase
            .from("approvals")
            .select("*", { count: "exact", head: true })
            .in("project_id", projectIds)
            .eq("status", "approved")
            .gte("created_at", monthStart)
        : { count: 0 },
      supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("agency_id", agencyId)
        .eq("status", "client feedback"),
    ])

  return {
    waitingApproval: waitingCount ?? 0,
    approvedThisMonth: approvedThisMonth ?? 0,
    feedbackRequested: feedbackCount ?? 0,
    averageApprovalTime: "-",
  }
}
