import { createClient } from "@/lib/supabase/server"

export type Agency = {
  id: string
  owner_id: string
  name: string
  website: string | null
  contact_email: string | null
  created_at: string
}

export type DashboardStats = {
  activeClients: number
  openProjects: number
  waitingApprovals: number
  filesShared: number
}

export type RecentProject = {
  id: string
  name: string
  status: string
  updated_at: string
  clients: { name: string } | null
}

export type ActivityItem = {
  id: string
  text: string
  timestamp: string
  type: "comment" | "approval"
}

export type DashboardOverview = {
  stats: DashboardStats
  recentProjects: RecentProject[]
  recentActivity: ActivityItem[]
}

export async function getCurrentAgency(): Promise<Agency | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("agencies")
    .select("*")
    .eq("owner_id", user.id)
    .single()

  return data
}

export async function createAgencyForCurrentUser(
  name?: string,
  email?: string
): Promise<Agency> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const agencyName = name || user.user_metadata?.agency_name || "ClientFlow Agency"
  const contactEmail = email || user.email || null

  const { data, error } = await supabase
    .from("agencies")
    .insert({
      owner_id: user.id,
      name: agencyName,
      contact_email: contactEmail,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function ensureAgencyForCurrentUser(): Promise<Agency | null> {
  try {
    const existing = await getCurrentAgency()
    if (existing) return existing
    return await createAgencyForCurrentUser()
  } catch {
    return null
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { activeClients: 0, openProjects: 0, waitingApprovals: 0, filesShared: 0 }

  const { data: agency } = await supabase
    .from("agencies")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!agency) return { activeClients: 0, openProjects: 0, waitingApprovals: 0, filesShared: 0 }

  const { data: projectRows } = await supabase
    .from("projects")
    .select("id")
    .eq("agency_id", agency.id)

  const projectIds = (projectRows ?? []).map((p) => p.id)

  const [
    { count: clientsCount },
    { count: projectsCount },
    { count: approvalsCount },
    { count: filesCount },
  ] = await Promise.all([
    supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("agency_id", agency.id)
      .eq("status", "active"),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("agency_id", agency.id)
      .neq("status", "completed"),
    projectIds.length > 0
      ? supabase
          .from("approvals")
          .select("*", { count: "exact", head: true })
          .in("project_id", projectIds)
          .eq("status", "pending")
      : { count: 0 },
    supabase
      .from("files")
      .select("*", { count: "exact", head: true })
      .eq("agency_id", agency.id),
  ])

  return {
    activeClients: clientsCount ?? 0,
    openProjects: projectsCount ?? 0,
    waitingApprovals: approvalsCount ?? 0,
    filesShared: filesCount ?? 0,
  }
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { stats: { activeClients: 0, openProjects: 0, waitingApprovals: 0, filesShared: 0 }, recentProjects: [], recentActivity: [] }
  }

  const { data: agency } = await supabase
    .from("agencies")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!agency) {
    return { stats: { activeClients: 0, openProjects: 0, waitingApprovals: 0, filesShared: 0 }, recentProjects: [], recentActivity: [] }
  }

  const { data: projectRows } = await supabase
    .from("projects")
    .select("id")
    .eq("agency_id", agency.id)

  const projectIds = (projectRows ?? []).map((p) => p.id)

  const [
    { count: clientsCount },
    { count: projectsCount },
    { count: approvalsCount },
    { count: filesCount },
    recentProjectsData,
    recentCommentsData,
    recentApprovalsData,
  ] = await Promise.all([
    supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("agency_id", agency.id)
      .eq("status", "active"),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("agency_id", agency.id)
      .neq("status", "completed"),
    projectIds.length > 0
      ? supabase
          .from("approvals")
          .select("*", { count: "exact", head: true })
          .in("project_id", projectIds)
          .eq("status", "pending")
      : { count: 0 },
    supabase
      .from("files")
      .select("*", { count: "exact", head: true })
      .eq("agency_id", agency.id),
    supabase
      .from("projects")
      .select("id, name, status, updated_at, clients(name)")
      .eq("agency_id", agency.id)
      .order("updated_at", { ascending: false })
      .limit(10),
    projectIds.length > 0
      ? supabase
          .from("comments")
          .select("id, body, created_at, author_name, project_id, projects(name)")
          .in("project_id", projectIds)
          .order("created_at", { ascending: false })
          .limit(5)
      : { data: [] },
    projectIds.length > 0
      ? supabase
          .from("approvals")
          .select("id, status, created_at, project_id, projects(name)")
          .in("project_id", projectIds)
          .order("created_at", { ascending: false })
          .limit(5)
      : { data: [] },
  ])

  const recentProjects = (recentProjectsData.data ?? []) as unknown as RecentProject[]

  const activity: ActivityItem[] = []

  for (const c of recentCommentsData.data ?? []) {
    const raw = c as unknown as { id: string; body: string; created_at: string; author_name: string | null; projects: { name: string } | null }
    const projectName = raw.projects?.name ?? "a project"
    activity.push({
      id: `comment-${raw.id}`,
      text: `${raw.author_name ?? "Client"} left feedback on ${projectName}`,
      timestamp: raw.created_at,
      type: "comment",
    })
  }

  for (const a of recentApprovalsData.data ?? []) {
    const raw = a as unknown as { id: string; status: string; created_at: string; projects: { name: string } | null }
    if (raw.status === "approved") {
      const projectName = raw.projects?.name ?? "a project"
      activity.push({
        id: `approval-${raw.id}`,
        text: `${projectName} was approved`,
        timestamp: raw.created_at,
        type: "approval",
      })
    }
  }

  activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return {
    stats: {
      activeClients: clientsCount ?? 0,
      openProjects: projectsCount ?? 0,
      waitingApprovals: approvalsCount ?? 0,
      filesShared: filesCount ?? 0,
    },
    recentProjects,
    recentActivity: activity.slice(0, 10),
  }
}
