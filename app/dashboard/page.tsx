import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  FileUp,
  Files,
  FolderKanban,
  MessageSquare,
  Plus,
  Send,
  UserPlus,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DashboardPageHeader,
  DashboardPanel,
  EmptyState,
  MetricCard,
} from "@/components/dashboard/dashboard-ui"
import {
  ensureAgencyForCurrentUser,
  getDashboardOverview,
  type ActivityItem,
  type ApprovalPreview,
  type FeedbackPreview,
  type RecentProject,
} from "@/lib/actions/workspace"
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist-client"
import { getSetupSteps } from "@/lib/setup-progress"
import { cn } from "@/lib/utils"

function formatStatus(status: string | null) {
  const value = status ?? "active"
  switch (value) {
    case "active": return "In progress"
    case "waiting approval": return "Waiting approval"
    case "waiting_approval": return "Waiting approval"
    case "client feedback": return "Needs changes"
    case "needs changes": return "Needs changes"
    case "needs_changes": return "Needs changes"
    case "completed": return "Completed"
    case "approved": return "Completed"
    case "blocked": return "Blocked"
    default: return value.charAt(0).toUpperCase() + value.slice(1)
  }
}

function getStatusClass(status: string | null) {
  if (status === "completed" || status === "approved") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (status === "waiting approval" || status === "waiting_approval") return "border-amber-200 bg-amber-50 text-amber-700"
  if (status === "client feedback" || status === "needs changes" || status === "needs_changes") return "border-blue-200 bg-blue-50 text-blue-700"
  if (status === "blocked") return "border-rose-200 bg-rose-50 text-rose-700"
  return "border-black/15 bg-white text-black"
}

function isPendingApproval(status: string | null) {
  return status === "pending" || status === "waiting approval" || status === "waiting_approval"
}

function isNeedsChanges(status: string | null) {
  return status === "client feedback" || status === "needs changes" || status === "needs_changes"
}

function isActiveProject(project: RecentProject) {
  return !["completed", "archived"].includes(project.status ?? "in_progress")
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

function getActivityIcon(type: ActivityItem["type"]) {
  if (type === "approval") return BadgeCheck
  if (type === "file") return Files
  return MessageSquare
}

type PriorityCardData = {
  kind: "feedback" | "approval" | "changes" | "files-ready" | "no-files" | "healthy"
  title: string
  description: string
  href: string
  action: string
  meta?: string
  icon: LucideIcon
  tone: "warning" | "info" | "success" | "neutral"
}

type QueueRow = {
  id: string
  label: string
  count: number
  href: string
  description: string
  tone: "warning" | "info" | "error" | "neutral"
}

function plural(count: number, singular: string, pluralLabel = `${singular}s`) {
  return count === 1 ? singular : pluralLabel
}

function formatMeta(projectName: string, clientName?: string | null) {
  return clientName ? `${projectName} - ${clientName}` : projectName
}

function getLatestFeedback(feedback: FeedbackPreview[]) {
  return feedback[0] ?? null
}

function getFeedbackHref(item?: FeedbackPreview | null) {
  return item?.project_id
    ? `/dashboard/projects/${item.project_id}?tab=feedback`
    : "/dashboard/projects?status=needs-changes"
}

function getLatestApproval(approvals: ApprovalPreview[]) {
  return approvals[0] ?? null
}

function getTodayPriority(
  feedback: FeedbackPreview[],
  approvals: ApprovalPreview[],
  projects: RecentProject[]
): PriorityCardData {
  const pendingApprovals = approvals.filter((approval) => isPendingApproval(approval.status))
  const changesRequested = approvals.filter((approval) => isNeedsChanges(approval.status))
  const filesReady = projects.filter((project) =>
    isActiveProject(project) && project.file_count > 0 && project.approval_count === 0
  )
  const projectsWithoutFiles = projects.filter((project) =>
    isActiveProject(project) && project.file_count === 0
  )

  if (feedback.length > 0) {
    const latest = getLatestFeedback(feedback)
    return {
      kind: "feedback",
      title: `${feedback.length} feedback ${plural(feedback.length, "item")} need reply`,
      description: "Review client notes before requesting the next approval.",
      href: getFeedbackHref(latest),
      action: "Review feedback",
      meta: latest ? formatMeta(latest.project_name, latest.client_name) : undefined,
      icon: MessageSquare,
      tone: "info",
    }
  }

  if (pendingApprovals.length > 0) {
    const latest = getLatestApproval(pendingApprovals)
    return {
      kind: "approval",
      title: `${pendingApprovals.length} ${plural(pendingApprovals.length, "approval")} ${pendingApprovals.length === 1 ? "is" : "are"} waiting`,
      description: "Follow up on client approval so delivery can keep moving.",
      href: "/dashboard/approvals",
      action: "Review approvals",
      meta: latest ? formatMeta(latest.project_name, latest.client_name) : undefined,
      icon: Clock3,
      tone: "warning",
    }
  }

  if (changesRequested.length > 0) {
    const latest = getLatestApproval(changesRequested)
    return {
      kind: "changes",
      title: `${changesRequested.length} change ${plural(changesRequested.length, "request")} need review`,
      description: "Review requested changes and prepare the next client update.",
      href: latest ? `/dashboard/projects/${latest.project_id}?tab=feedback` : "/dashboard/projects",
      action: "Review changes",
      meta: latest ? formatMeta(latest.project_name, latest.client_name) : undefined,
      icon: MessageSquare,
      tone: "warning",
    }
  }

  if (filesReady.length > 0) {
    const project = filesReady[0]
    return {
      kind: "files-ready",
      title: filesReady.length === 1 ? "Files ready for approval" : `${filesReady.length} projects are ready for approval`,
      description: "Share the portal with your client or request approval on the latest deliverable.",
      href: `/dashboard/projects/${project.id}?tab=approvals`,
      action: "Request approval",
      meta: formatMeta(project.name, project.clients?.name),
      icon: Send,
      tone: "warning",
    }
  }

  if (projectsWithoutFiles.length > 0) {
    const project = projectsWithoutFiles[0]
    return {
      kind: "no-files",
      title: "Upload a deliverable to continue",
      description: "Add the first client-facing file so the project can move toward review.",
      href: "/dashboard/files",
      action: "Upload deliverable",
      meta: formatMeta(project.name, project.clients?.name),
      icon: FileUp,
      tone: "neutral",
    }
  }

  return {
    kind: "healthy",
    title: "Workspace looks healthy",
    description: "No feedback, approvals, or delivery blockers need action right now.",
    href: "/dashboard/projects",
    action: "View projects",
    icon: CheckCircle2,
    tone: "success",
  }
}

function getAttentionQueue(feedback: FeedbackPreview[], approvals: ApprovalPreview[], projects: RecentProject[]) {
  const pendingApprovals = approvals.filter((approval) => isPendingApproval(approval.status))
  const changesRequested = approvals.filter((approval) => isNeedsChanges(approval.status))
  const blockedProjects = projects.filter((project) => project.status === "blocked")
  const filesReady = projects.filter((project) =>
    isActiveProject(project) && project.file_count > 0 && project.approval_count === 0
  )
  const projectsWithoutFiles = projects.filter((project) =>
    isActiveProject(project) && project.file_count === 0
  )

  const allRows: QueueRow[] = [
    {
      id: "feedback",
      label: "Feedback queue",
      count: feedback.length,
      href: getFeedbackHref(feedback[0]),
      description: "Client notes to review",
      tone: "info",
    },
    {
      id: "approvals",
      label: "Approvals waiting",
      count: pendingApprovals.length,
      href: "/dashboard/approvals",
      description: "Client decisions pending",
      tone: "warning",
    },
    {
      id: "changes",
      label: "Changes requested",
      count: changesRequested.length,
      href: changesRequested[0] ? `/dashboard/projects/${changesRequested[0].project_id}?tab=feedback` : "/dashboard/projects",
      description: "Approval feedback to resolve",
      tone: "warning",
    },
    {
      id: "blocked",
      label: "Blocked projects",
      count: blockedProjects.length,
      href: "/dashboard/projects?status=attention",
      description: "Delivery work that cannot progress",
      tone: "error",
    },
    {
      id: "files-ready",
      label: "Files ready for approval",
      count: filesReady.length,
      href: filesReady[0] ? `/dashboard/projects/${filesReady[0].id}?tab=approvals` : "/dashboard/projects",
      description: "Uploaded files without an approval request",
      tone: "warning",
    },
    {
      id: "no-files",
      label: "Projects without deliverables",
      count: projectsWithoutFiles.length,
      href: "/dashboard/files",
      description: "Active projects with no uploaded files",
      tone: "neutral",
    },
  ]

  const rows = allRows.filter((row) => row.count > 0)

  return {
    rows,
    total: rows.reduce((sum, row) => sum + row.count, 0),
  }
}

const priorityToneClass = {
  warning: "border-amber-200/80 bg-amber-50/50 text-amber-800",
  info: "border-blue-200/70 bg-blue-50/45 text-blue-800",
  success: "border-emerald-200/70 bg-emerald-50/55 text-emerald-800",
  neutral: "border-black/10 bg-[#f7f7f5] text-black",
}

const queueToneClass = {
  warning: "bg-amber-50/60 text-amber-800 ring-amber-100",
  info: "bg-blue-50/55 text-blue-800 ring-blue-100",
  error: "bg-rose-50/55 text-rose-800 ring-rose-100",
  neutral: "bg-[#f4f4f2] text-black/65 ring-black/[0.06]",
}

export default async function DashboardPage() {
  const agency = await ensureAgencyForCurrentUser().catch(() => null)
  const agencyId = agency?.id
  const overview = await getDashboardOverview(agencyId)
  const { stats, recentProjects, recentActivity, feedbackPreview, approvalPreview } = overview
  const setupSteps = getSetupSteps(stats, recentProjects)
  const setupProgress = setupSteps.filter(Boolean).length
  const setupComplete = setupProgress === setupSteps.length
  const hasAnyActivity = stats.totalProjects > 0 || stats.filesShared > 0 || recentActivity.length > 0

  const todayPriority = getTodayPriority(feedbackPreview, approvalPreview, recentProjects)
  const attentionQueue = getAttentionQueue(feedbackPreview, approvalPreview, recentProjects)

  const statCards = [
    { label: "Active projects", value: stats.openProjects, description: "Currently in delivery", icon: FolderKanban, tone: "neutral" as const },
    { label: "Waiting approvals", value: stats.waitingApprovals, description: "Needs client action", icon: Clock3, tone: "warning" as const },
    { label: "Feedback items", value: stats.feedbackCount, description: "Comments to review", icon: MessageSquare, tone: "info" as const },
    { label: "Delivered files", value: stats.filesShared, description: "Shared deliverables", icon: Files, tone: "muted" as const },
  ]

  const quickActions = [
    { label: "New project", href: "/dashboard/projects", icon: Plus },
    { label: "Add client", href: "/dashboard/clients", icon: UserPlus },
    { label: "Upload deliverable", href: "/dashboard/files", icon: FileUp },
    { label: "View approvals", href: "/dashboard/approvals", icon: Send },
  ]

  if (!setupComplete) {
    return (
      <>
        <DashboardPageHeader
          badge="Workspace setup"
          title="Dashboard"
          description="Start with a real client delivery loop. The command center appears as your workspace gains live data."
          actions={
            setupProgress === 0 ? (
              <Button asChild className="rounded-full">
                <Link href="/dashboard/clients">
                  <UserPlus className="size-4" />
                  Add client
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="rounded-full bg-white">
                <Link href="/dashboard/projects">
                  <FolderKanban className="size-4" />
                  View setup work
                </Link>
              </Button>
            )
          }
        />

        <div className="mt-8">
          <OnboardingChecklist stats={stats} projects={recentProjects} />
        </div>

        {setupProgress === 0 ? (
          <DashboardPanel
            className="mt-6"
            title="What appears here next"
            description="ClientFlow keeps the dashboard quiet until there is real workspace activity."
          >
            <div className="grid gap-3 md:grid-cols-3">
              {[
                {
                  title: "Project pipeline",
                  description: "Appears after you create your first project.",
                  icon: FolderKanban,
                },
                {
                  title: "Deliverables",
                  description: "Appears after files are uploaded to the workspace.",
                  icon: Files,
                },
                {
                  title: "Client review",
                  description: "Appears after feedback or approval records exist.",
                  icon: BadgeCheck,
                },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="rounded-xl bg-[#f7f7f5] p-4 ring-1 ring-black/[0.06]">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-white text-black/50 ring-1 ring-black/[0.06]">
                      <Icon className="size-4" />
                    </div>
                    <p className="mt-4 text-sm font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </DashboardPanel>
        ) : null}

        {setupProgress > 0 && hasAnyActivity ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            {recentProjects.length > 0 ? (
              <DashboardPanel
                title="Project preview"
                description="Real projects appear here as setup progresses."
                action={
                  <Button asChild variant="outline" className="rounded-full bg-white">
                    <Link href="/dashboard/projects">Open projects</Link>
                  </Button>
                }
              >
                <div className="space-y-3">
                  {recentProjects.slice(0, 3).map((project) => (
                    <Link
                      key={project.id}
                      href={`/dashboard/projects/${project.id}`}
                      className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-[#fafafa] p-4 transition-colors hover:bg-[#f4f4f2] sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">{project.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {project.clients?.name ?? "No client"} - updated {formatDate(project.updated_at)}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`shrink-0 rounded-full ${getStatusClass(project.status)}`}
                      >
                        {formatStatus(project.status)}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </DashboardPanel>
            ) : null}

            {recentActivity.length > 0 ? (
              <DashboardPanel
                title="Recent activity"
                description="Only real workspace activity appears here."
              >
                <ActivityList items={recentActivity} />
              </DashboardPanel>
            ) : null}
          </div>
        ) : null}
      </>
    )
  }

  return (
    <>
      <DashboardPageHeader
        badge="Agency command center"
        title="Dashboard"
        description="See active delivery, waiting client decisions, feedback, and the next agency action."
        actions={
          <>
            <Button asChild variant="outline" className="rounded-full bg-white">
              <Link href="/dashboard/files">
                <FileUp className="size-4" />
                Upload deliverable
              </Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/dashboard/projects">
                <Plus className="size-4" />
                New project
              </Link>
            </Button>
          </>
        }
      />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <DashboardPanel
            title="Today&apos;s priority"
            description="The single most important thing to handle next."
          >
            <TodayPriorityCard priority={todayPriority} />
          </DashboardPanel>

          <DashboardPanel
            title="Needs attention"
            description="A compact action queue without repeating the priority card."
            action={
              <Button asChild variant="outline" className="h-9 rounded-full bg-white">
                <Link href="/dashboard/projects">View pipeline</Link>
              </Button>
            }
          >
            {attentionQueue.total === 0 ? (
              <EmptyState
                compact
                icon={CheckCircle2}
                title="Nothing needs attention."
                description="Feedback, approvals, and delivery blockers will appear here when they need action."
              />
            ) : (
              <div className="divide-y divide-black/[0.06] rounded-2xl border border-black/10 bg-[#fafafa]">
                {attentionQueue.rows.map((row) => (
                  <AttentionQueueRow key={row.id} row={row} />
                ))}
              </div>
            )}
          </DashboardPanel>
        </div>

        <div className="space-y-6">
          <DashboardPanel
            title="Quick actions"
            description="Common delivery moves."
          >
            <div className="grid gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Button
                    key={action.label}
                    asChild
                    variant="outline"
                    className="h-11 justify-start rounded-xl bg-[#f7f7f5] px-3 text-left"
                  >
                    <Link href={action.href}>
                      <Icon className="size-4" />
                      <span className="text-sm font-medium">{action.label}</span>
                    </Link>
                  </Button>
                )
              })}
            </div>
          </DashboardPanel>

          <DashboardPanel
            title="Activity timeline"
            description="Recent workspace history."
          >
            {recentActivity.length === 0 ? (
              <EmptyState
                compact
                icon={Activity}
                title="No activity yet"
                description="Delivered files, approvals, and feedback will appear here."
              />
            ) : (
              <ActivityList items={recentActivity} />
            )}
          </DashboardPanel>
        </div>
      </div>
    </>
  )
}

function TodayPriorityCard({ priority }: { priority: PriorityCardData }) {
  const Icon = priority.icon

  return (
    <div className={cn("rounded-2xl border p-5", priorityToneClass[priority.tone])}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/85 text-current ring-1 ring-black/[0.06]">
              <Icon className="size-4" />
            </div>
            <Badge variant="outline" className="rounded-full border-black/10 bg-white/80 text-black/60">
              {priority.kind === "healthy" ? "Healthy" : "Next action"}
            </Badge>
          </div>
          <h3 className="mt-5 text-xl font-semibold tracking-tight text-black">
            {priority.title}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/65">
            {priority.description}
          </p>
          {priority.meta ? (
            <p className="mt-3 text-xs font-medium text-black/45">{priority.meta}</p>
          ) : null}
        </div>

        <Button asChild className="shrink-0 rounded-full">
          <Link href={priority.href}>
            {priority.action}
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

function AttentionQueueRow({ row }: { row: QueueRow }) {
  return (
    <Link
      href={row.href}
      className="flex items-center justify-between gap-4 px-4 py-3 transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-white"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-black">{row.label} - {row.count}</p>
          <Badge
            variant="outline"
            className={cn("rounded-full border-0 text-[11px] ring-1", queueToneClass[row.tone])}
          >
            {row.count === 1 ? "1 item" : `${row.count} items`}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{row.description}</p>
      </div>
      <ArrowUpRight className="size-4 shrink-0 text-black/35" />
    </Link>
  )
}

function ActivityList({ items }: { items: ActivityItem[] }) {
  return (
    <div className="space-y-4">
      {items.slice(0, 5).map((item) => {
        const Icon = getActivityIcon(item.type)
        return (
          <div key={item.id} className="flex gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#f4f4f2] text-black/45 ring-1 ring-black/[0.06]">
              <Icon className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm leading-6 text-black/75">{item.text}</p>
              <p className="text-xs text-muted-foreground">{formatDate(item.timestamp)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
