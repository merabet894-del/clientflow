import type { User } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/server"
import { PLAN_LIMITS } from "@/lib/billing"
import { createSalesLead } from "./sales-leads"

export type Agency = {
  id: string
  owner_id: string
  name: string
  website: string | null
  contact_email: string | null
  created_at: string
  plan?: string | null
  subscription_status?: string | null
  trial_ends_at?: string | null
  current_period_end?: string | null
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
  max_clients?: number | null
  max_projects?: number | null
  max_team_members?: number | null
  max_storage_mb?: number | null
  plan_interest?: string | null
}

export type DashboardStats = {
  activeClients: number
  openProjects: number
  totalProjects: number
  waitingApprovals: number
  filesShared: number
  feedbackCount: number
  approvalCount: number
  portalLinksCount: number
  agencyId: string | null
}

export type RecentProject = {
  id: string
  name: string
  status: string | null
  created_at: string
  updated_at: string
  portal_token: string
  portal_shared_at: string | null
  clients: { name: string } | null
  file_count: number
  approval_count: number
  pending_approval_count: number
}

export type ActivityItem = {
  id: string
  text: string
  timestamp: string
  type: "comment" | "approval" | "file"
}

export type FeedbackPreview = {
  id: string
  body: string
  created_at: string
  author_name: string | null
  project_id: string
  project_name: string
  client_name: string | null
}

export type ApprovalPreview = {
  id: string
  title: string
  status: string
  created_at: string
  project_id: string
  project_name: string
  client_name: string | null
}

export type DashboardOverview = {
  stats: DashboardStats
  recentProjects: RecentProject[]
  recentActivity: ActivityItem[]
  feedbackPreview: FeedbackPreview[]
  approvalPreview: ApprovalPreview[]
}

export type DashboardSidebarBadges = {
  overview: number
  clients: number
  projects: number
  approvals: number
  files: number
  settings: number
}

export type DashboardShellNotification = {
  id: string
  title: string
  description: string
  tone: "success" | "error" | "info" | "warning"
  source: "client"
  type: "feedback" | "approval" | "changes_requested" | "portal_view" | "file_view"
  entityId?: string
  projectId?: string
  clientId?: string
  targetHref: string
  href: string
  label: string
  count?: number
  createdAt: string
  read?: boolean
}

export type DashboardSidebarState = {
  badges: DashboardSidebarBadges
  notifications: DashboardShellNotification[]
  hasPortalLink: boolean
}

const emptyStats: DashboardStats = {
  activeClients: 0,
  openProjects: 0,
  totalProjects: 0,
  waitingApprovals: 0,
  filesShared: 0,
  feedbackCount: 0,
  approvalCount: 0,
  portalLinksCount: 0,
  agencyId: null,
}

const emptySidebarState: DashboardSidebarState = {
  badges: {
    overview: 0,
    clients: 0,
    projects: 0,
    approvals: 0,
    files: 0,
    settings: 0,
  },
  notifications: [],
  hasPortalLink: false,
}

function isAttentionProjectStatus(status: string | null) {
  return [
    "blocked",
    "waiting approval",
    "waiting_approval",
    "client feedback",
    "needs changes",
    "needs_changes",
  ].includes(status ?? "")
}

function isActiveProjectStatus(status: string | null) {
  return !["completed", "archived"].includes(status ?? "in_progress")
}

function getActiveProjectCount(
  projects: { id: string; status: string | null }[],
  signalProjectIds: Set<string> = new Set()
) {
  const activeByStatus = projects.filter((project) => isActiveProjectStatus(project.status)).length
  if (activeByStatus > 0) return activeByStatus

  return projects.filter((project) => {
    const status = project.status ?? "in_progress"
    return status !== "archived" && signalProjectIds.has(project.id)
  }).length
}

async function fetchAgencyByOwnerId(ownerId: string, client?: SupabaseClient): Promise<Agency | null> {
  const db = client ?? await createClient()
  const { data } = await db
    .from("agencies")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: true })
    .limit(25)

  const agencies = (data ?? []) as Agency[]
  if (agencies.length <= 1) return agencies[0] ?? null

  const agencyIds = agencies.map((a) => a.id)
  const [clients, projects, files] = await Promise.all([
    db
      .from("clients")
      .select("agency_id")
      .in("agency_id", agencyIds),
    db
      .from("projects")
      .select("agency_id")
      .in("agency_id", agencyIds),
    db
      .from("files")
      .select("agency_id")
      .in("agency_id", agencyIds),
  ])
  const scores = new Map<string, number>()
  for (const id of agencyIds) scores.set(id, 0)
  for (const row of clients.data ?? []) scores.set(row.agency_id, (scores.get(row.agency_id) ?? 0) + 1)
  for (const row of projects.data ?? []) scores.set(row.agency_id, (scores.get(row.agency_id) ?? 0) + 1)
  for (const row of files.data ?? []) scores.set(row.agency_id, (scores.get(row.agency_id) ?? 0) + 1)

  return agencies
    .slice()
    .sort((a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0))[0]
}

function serializeSupabaseError(error: unknown) {
  if (!error) return null
  return {
    name: error instanceof Error ? error.name : undefined,
    message: error instanceof Error ? error.message : (error as any)?.message,
    code: (error as any)?.code,
    details: (error as any)?.details,
    hint: (error as any)?.hint,
    status: (error as any)?.status,
    statusCode: (error as any)?.statusCode,
    raw: String(error),
    keys: typeof error === "object" && error ? Object.getOwnPropertyNames(error) : [],
  }
}

async function getOrCreateAgencyByUserId(
  userId: string,
  fallbackName: string,
  fallbackEmail: string | null,
  planInterest?: string | null,
  client?: SupabaseClient
): Promise<Agency> {
  const db = client ?? await createClient()

  const existing = await fetchAgencyByOwnerId(userId, db)
  if (existing) return existing

  const starterLimits = PLAN_LIMITS.starter
  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()

  const { error: insertError } = await db
    .from("agencies")
    .insert({
      owner_id: userId,
      name: fallbackName,
      contact_email: fallbackEmail,
      plan: "starter",
      subscription_status: "trialing",
      trial_ends_at: trialEndsAt,
      max_clients: starterLimits.max_clients,
      max_projects: starterLimits.max_projects,
      max_team_members: starterLimits.max_team_members,
      max_storage_mb: starterLimits.max_storage_mb,
      plan_interest: planInterest || null,
    })

  if (!insertError) {
    const created = await fetchAgencyByOwnerId(userId, db)
    if (!created) throw new Error("Agency was created but could not be retrieved.")
    if (planInterest && ["pro", "agency"].includes(planInterest)) {
      createSalesLead({
        email: fallbackEmail || undefined,
        plan_interest: planInterest,
        source: "pricing",
        user_id: userId,
        agency_id: created.id,
      }).catch(() => {})
    }
    return created
  }

  if (insertError.code === "23505") {
    const retried = await fetchAgencyByOwnerId(userId, db)
    if (retried) return retried
  }

  const serialized = serializeSupabaseError(insertError)
  throw new Error(
    `Could not create agency workspace: ${serialized?.message || serialized?.code || "unknown error"}`
  )
}

export async function getOrCreateAgency(
  user: User,
  options?: { name?: string; email?: string | null; client?: SupabaseClient }
): Promise<Agency> {
  const agencyName =
    options?.name ||
    user.user_metadata?.agency_name ||
    "ClientFlow Agency"
  const contactEmail = options?.email ?? user.email ?? null
  const planInterest = (user.user_metadata?.plan_interest as string) || null

  return getOrCreateAgencyByUserId(user.id, agencyName, contactEmail, planInterest, options?.client)
}

export async function getCurrentAgency(): Promise<Agency | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  return fetchAgencyByOwnerId(user.id, supabase)
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

  return getOrCreateAgency(user, { name, email, client: supabase })
}

export async function ensureAgencyForCurrentUser(): Promise<Agency | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  return await getOrCreateAgency(user, { client: supabase })
}

export async function getDashboardStats(agencyId?: string): Promise<DashboardStats> {
  if (!agencyId) {
    try {
      const a = await ensureAgencyForCurrentUser()
      if (a) agencyId = a.id
    } catch { /* fail safe */ }
  }
  if (!agencyId) return emptyStats

  const supabase = await createClient()
  const { data: projectRows } = await supabase
    .from("projects")
    .select("id, status, portal_token")
    .eq("agency_id", agencyId)

  const allProjects = (projectRows ?? []) as { id: string; status: string | null; portal_token: string | null }[]
  const projectIds = allProjects.map((p) => p.id)
  const portalLinksCount = allProjects.filter((p) => Boolean(p.portal_token)).length
  const [
    { count: clientsCount },
    { count: totalProjectsCount },
    { count: waitingApprovalsCount },
    { count: filesCount },
    { count: feedbackCount },
    { count: approvalCount },
    projectFilesData,
    projectCommentsData,
    projectApprovalsData,
  ] = await Promise.all([
    supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("agency_id", agencyId),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("agency_id", agencyId),
    projectIds.length > 0
      ? supabase
          .from("approvals")
          .select("*", { count: "exact", head: true })
          .in("project_id", projectIds)
          .in("status", ["pending", "waiting approval"])
      : { count: 0 },
    supabase
      .from("files")
      .select("*", { count: "exact", head: true })
      .eq("agency_id", agencyId),
    projectIds.length > 0
      ? supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .in("project_id", projectIds)
          .eq("author_type", "client")
      : { count: 0 },
    projectIds.length > 0
      ? supabase
          .from("approvals")
          .select("*", { count: "exact", head: true })
          .in("project_id", projectIds)
      : { count: 0 },
    projectIds.length > 0
      ? supabase
          .from("files")
          .select("project_id")
          .eq("agency_id", agencyId)
          .in("project_id", projectIds)
      : { data: [] },
    projectIds.length > 0
      ? supabase
          .from("comments")
          .select("project_id")
          .in("project_id", projectIds)
      : { data: [] },
    projectIds.length > 0
      ? supabase
          .from("approvals")
          .select("project_id")
          .in("project_id", projectIds)
      : { data: [] },
  ])

  const signalProjectIds = new Set<string>()
  for (const file of projectFilesData.data ?? []) {
    const raw = file as { project_id: string | null }
    if (raw.project_id) signalProjectIds.add(raw.project_id)
  }
  for (const comment of projectCommentsData.data ?? []) {
    const raw = comment as { project_id: string | null }
    if (raw.project_id) signalProjectIds.add(raw.project_id)
  }
  for (const approval of projectApprovalsData.data ?? []) {
    const raw = approval as { project_id: string | null }
    if (raw.project_id) signalProjectIds.add(raw.project_id)
  }
  const openProjects = getActiveProjectCount(allProjects, signalProjectIds)

  return {
    activeClients: clientsCount ?? 0,
    openProjects,
    totalProjects: totalProjectsCount ?? 0,
    waitingApprovals: waitingApprovalsCount ?? 0,
    filesShared: filesCount ?? 0,
    feedbackCount: feedbackCount ?? 0,
    approvalCount: approvalCount ?? 0,
    portalLinksCount,
    agencyId: agencyId ?? null,
  }
}

export async function getDashboardSidebarState(agencyId?: string): Promise<DashboardSidebarState> {
  if (!agencyId) {
    try {
      const a = await ensureAgencyForCurrentUser()
      if (a) agencyId = a.id
    } catch { /* fail safe */ }
  }
  if (!agencyId) return emptySidebarState

  const supabase = await createClient()
  const { data: projectRows } = await supabase
    .from("projects")
    .select("id, name, status, created_at, updated_at, portal_token, portal_shared_at, clients(name)")
    .eq("agency_id", agencyId)

  const projects = ((projectRows ?? []) as unknown as Omit<RecentProject, "file_count" | "approval_count" | "pending_approval_count">[]).map((project) => ({
    ...project,
    file_count: 0,
    approval_count: 0,
    pending_approval_count: 0,
  }))
  const projectIds = projects.map((project) => project.id)

  const [
    { count: pendingApprovalsCount },
    unreadNotificationsData,
  ] = await Promise.all([
    projectIds.length > 0
      ? supabase
          .from("approvals")
          .select("*", { count: "exact", head: true })
          .in("project_id", projectIds)
          .in("status", ["pending", "waiting approval", "waiting_approval"])
      : { count: 0 },
    supabase
      .from("notifications")
      .select("id, project_id, client_id, type, title, message, target_href, is_read, created_at")
      .eq("agency_id", agencyId)
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(20),
  ])

  const notifications: DashboardShellNotification[] = (unreadNotificationsData.data ?? []).map((item) => {
    const raw = item as {
      id: string
      project_id: string | null
      client_id: string | null
      type: DashboardShellNotification["type"]
      title: string
      message: string
      target_href: string
      is_read: boolean
      created_at: string
    }
    const tone =
      raw.type === "approval"
        ? "success"
        : raw.type === "changes_requested"
          ? "warning"
          : "info"
    const label =
      raw.type === "approval"
        ? "Approved"
        : raw.type === "changes_requested"
          ? "Changes"
          : raw.type === "feedback"
            ? "Feedback"
            : "Portal"

    return {
      id: raw.id,
      title: raw.title,
      description: raw.message,
      tone,
      source: "client",
      type: raw.type,
      projectId: raw.project_id ?? undefined,
      clientId: raw.client_id ?? undefined,
      targetHref: raw.target_href,
      href: raw.target_href,
      label,
      createdAt: raw.created_at,
      read: raw.is_read,
    }
  })

  const unreadProjectNotifications = notifications.filter((notification) =>
    notification.type === "feedback" || notification.type === "changes_requested"
  ).length
  const unreadApprovalNotifications = notifications.filter((notification) =>
    notification.type === "approval"
  ).length

  return {
    badges: {
      overview: 0,
      clients: 0,
      projects: unreadProjectNotifications,
      approvals: Math.max(pendingApprovalsCount ?? 0, unreadApprovalNotifications),
      files: 0,
      settings: 0,
    },
    notifications: notifications.slice(0, 10),
    hasPortalLink: projects.some((project) => Boolean(project.portal_token)),
  }
}

export async function getDashboardOverview(agencyId?: string): Promise<DashboardOverview> {
  if (!agencyId) {
    try {
      const a = await ensureAgencyForCurrentUser()
      if (a) agencyId = a.id
    } catch { /* fail safe */ }
  }
  if (!agencyId) {
    return {
      stats: emptyStats,
      recentProjects: [],
      recentActivity: [],
      feedbackPreview: [],
      approvalPreview: [],
    }
  }

  const supabase = await createClient()
  const { data: projectRows } = await supabase
    .from("projects")
    .select("id, status, portal_token")
    .eq("agency_id", agencyId)

  const allProjects = (projectRows ?? []) as { id: string; status: string | null; portal_token: string | null }[]
  const projectIds = allProjects.map((p) => p.id)
  const portalLinksCount = allProjects.filter((p) => Boolean(p.portal_token)).length
  const [
    { count: clientsCount },
    { count: totalProjectsCount },
    { count: waitingApprovalsCount },
    { count: filesCount },
    { count: feedbackCount },
    { count: approvalCount },
    recentProjectsData,
    recentCommentsData,
    recentApprovalsData,
    recentFilesData,
    projectFilesData,
    projectApprovalsData,
    feedbackPreviewData,
    approvalPreviewData,
  ] = await Promise.all([
    supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("agency_id", agencyId),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("agency_id", agencyId),
    projectIds.length > 0
      ? supabase
          .from("approvals")
          .select("*", { count: "exact", head: true })
          .in("project_id", projectIds)
          .in("status", ["pending", "waiting approval", "waiting_approval"])
      : { count: 0 },
    supabase
      .from("files")
      .select("*", { count: "exact", head: true })
      .eq("agency_id", agencyId),
    projectIds.length > 0
      ? supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .in("project_id", projectIds)
          .eq("author_type", "client")
      : { count: 0 },
    projectIds.length > 0
      ? supabase
          .from("approvals")
          .select("*", { count: "exact", head: true })
          .in("project_id", projectIds)
      : { count: 0 },
    supabase
      .from("projects")
      .select("id, name, status, created_at, updated_at, portal_token, portal_shared_at, clients(name)")
      .eq("agency_id", agencyId)
      .order("updated_at", { ascending: false })
      .limit(10),
    projectIds.length > 0
      ? supabase
          .from("comments")
          .select("id, body, created_at, author_name, project_id, projects(name)")
          .in("project_id", projectIds)
          .eq("author_type", "client")
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
    supabase
      .from("files")
      .select("id, name, created_at, projects(name), clients(name)")
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false })
      .limit(10),
    projectIds.length > 0
      ? supabase
          .from("files")
          .select("id, project_id")
          .eq("agency_id", agencyId)
          .in("project_id", projectIds)
      : { data: [] },
    projectIds.length > 0
      ? supabase
          .from("approvals")
          .select("id, status, project_id")
          .in("project_id", projectIds)
      : { data: [] },
    projectIds.length > 0
      ? supabase
          .from("comments")
          .select("id, body, created_at, author_name, project_id, projects(name, clients(name))")
          .in("project_id", projectIds)
          .eq("author_type", "client")
          .order("created_at", { ascending: false })
          .limit(5)
      : { data: [] },
    projectIds.length > 0
      ? supabase
          .from("approvals")
          .select("id, title, status, created_at, project_id, projects(name, clients(name))")
          .in("project_id", projectIds)
          .in("status", ["pending", "waiting approval", "waiting_approval", "needs changes", "needs_changes"])
          .order("created_at", { ascending: false })
          .limit(5)
      : { data: [] },
  ])

  const fileCounts = new Map<string, number>()
  for (const file of projectFilesData.data ?? []) {
    const raw = file as { project_id: string | null }
    if (raw.project_id) fileCounts.set(raw.project_id, (fileCounts.get(raw.project_id) ?? 0) + 1)
  }

  const approvalCounts = new Map<string, number>()
  const pendingApprovalCounts = new Map<string, number>()
  const signalProjectIds = new Set<string>()
  for (const approval of projectApprovalsData.data ?? []) {
    const raw = approval as { project_id: string; status: string }
    approvalCounts.set(raw.project_id, (approvalCounts.get(raw.project_id) ?? 0) + 1)
    signalProjectIds.add(raw.project_id)
    if (raw.status === "pending" || raw.status === "waiting approval" || raw.status === "waiting_approval") {
      pendingApprovalCounts.set(raw.project_id, (pendingApprovalCounts.get(raw.project_id) ?? 0) + 1)
    }
  }

  const recentProjects = ((recentProjectsData.data ?? []) as unknown as Omit<RecentProject, "file_count" | "approval_count" | "pending_approval_count">[]).map((project) => ({
    ...project,
    file_count: fileCounts.get(project.id) ?? 0,
    approval_count: approvalCounts.get(project.id) ?? 0,
    pending_approval_count: pendingApprovalCounts.get(project.id) ?? 0,
  }))
  const feedbackPreview: FeedbackPreview[] = []
  const approvalPreview: ApprovalPreview[] = []

  const activity: ActivityItem[] = []

  for (const c of recentCommentsData.data ?? []) {
    const raw = c as unknown as { id: string; body: string; created_at: string; author_name: string | null; projects: { name: string } | null }
    const projectName = raw.projects?.name ?? "a project"
    activity.push({
      id: `comment-${raw.id}`,
      text: `Feedback received on ${projectName}`,
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
        text: `Approval completed for ${projectName}`,
        timestamp: raw.created_at,
        type: "approval",
      })
    }
  }

  for (const f of recentFilesData.data ?? []) {
    const raw = f as unknown as {
      id: string
      created_at: string
      projects: { name: string } | null
      clients: { name: string } | null
    }
    const projectName = raw.projects?.name ?? raw.clients?.name ?? "the workspace"
    activity.push({
      id: `file-${raw.id}`,
      text: `Deliverable uploaded to ${projectName}`,
      timestamp: raw.created_at,
      type: "file",
    })
  }

  for (const c of feedbackPreviewData.data ?? []) {
    const raw = c as unknown as {
      id: string
      body: string
      created_at: string
      author_name: string | null
      project_id: string
      projects: { name: string; clients: { name: string } | null } | null
    }
    signalProjectIds.add(raw.project_id)
    feedbackPreview.push({
      id: raw.id,
      body: raw.body,
      created_at: raw.created_at,
      author_name: raw.author_name,
      project_id: raw.project_id,
      project_name: raw.projects?.name ?? "Untitled project",
      client_name: raw.projects?.clients?.name ?? null,
    })
  }

  for (const a of approvalPreviewData.data ?? []) {
    const raw = a as unknown as {
      id: string
      title: string | null
      status: string
      created_at: string
      project_id: string
      projects: { name: string; clients: { name: string } | null } | null
    }
    approvalPreview.push({
      id: raw.id,
      title: raw.title ?? "Approval request",
      status: raw.status,
      created_at: raw.created_at,
      project_id: raw.project_id,
      project_name: raw.projects?.name ?? "Untitled project",
      client_name: raw.projects?.clients?.name ?? null,
    })
  }

  const seenActivity = new Set<string>()
  const dedupedActivity = activity
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .filter((item) => {
      const key = `${item.type}:${item.text}`
      if (seenActivity.has(key)) return false
      seenActivity.add(key)
      return true
    })
  for (const file of projectFilesData.data ?? []) {
    const raw = file as { project_id: string | null }
    if (raw.project_id) signalProjectIds.add(raw.project_id)
  }
  const openProjects = getActiveProjectCount(allProjects, signalProjectIds)

  return {
    stats: {
      activeClients: clientsCount ?? 0,
      openProjects,
      totalProjects: totalProjectsCount ?? 0,
      waitingApprovals: waitingApprovalsCount ?? 0,
      filesShared: filesCount ?? 0,
      feedbackCount: feedbackCount ?? 0,
      approvalCount: approvalCount ?? 0,
      portalLinksCount,
      agencyId: agencyId ?? null,
    },
    recentProjects,
    recentActivity: dedupedActivity.slice(0, 5),
    feedbackPreview,
    approvalPreview,
  }
}
