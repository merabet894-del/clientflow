import Link from "next/link"
import {
  ArrowUpRight,
  Clock3,
  FolderKanban,
  MessageSquare,
  Search,
  TrendingUp,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DashboardPageHeader,
  DashboardPanel,
  EmptyState,
  MetricCard,
} from "@/components/dashboard/dashboard-ui"
import { ensureAgencyForCurrentUser } from "@/lib/actions/workspace"
import { getProjects, type Project } from "@/lib/actions/projects"
import { getClients } from "@/lib/actions/clients"
import { AddProjectDialog } from "@/components/projects/add-project-dialog"
import { cn } from "@/lib/utils"
import { getBillingOverview, getLimitMessage, getUsageLabel } from "@/lib/actions/billing"

type ProjectsPageProps = {
  searchParams?: Promise<{ q?: string | string[]; status?: string | string[] }>
}

const statusTabs = [
  { value: "all", label: "All" },
  { value: "attention", label: "Needs attention" },
  { value: "in-progress", label: "In progress" },
  { value: "waiting-approval", label: "Waiting approval" },
  { value: "needs-changes", label: "Needs changes" },
  { value: "completed", label: "Completed" },
]

function normalizeStatus(status: string) {
  if (status === "completed" || status === "approved") return "completed"
  if (status === "waiting approval" || status === "waiting_approval") return "waiting-approval"
  if (status === "client feedback" || status === "needs changes" || status === "needs_changes") return "needs-changes"
  return "in-progress"
}

function getStatusClass(status: string) {
  if (status === "completed" || status === "approved") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (status === "waiting approval" || status === "waiting_approval") return "border-amber-200 bg-amber-50 text-amber-700"
  if (status === "client feedback" || status === "needs changes" || status === "needs_changes") return "border-blue-200 bg-blue-50 text-blue-700"
  return "border-black/15 bg-white text-black"
}

function formatStatus(status: string) {
  switch (status) {
    case "active": return "In progress"
    case "waiting approval":
    case "waiting_approval": return "Waiting approval"
    case "client feedback":
    case "needs changes":
    case "needs_changes": return "Needs changes"
    case "completed":
    case "approved": return "Completed"
    default: return status.charAt(0).toUpperCase() + status.slice(1)
  }
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

function getQuery(params?: { q?: string | string[] }) {
  const raw = Array.isArray(params?.q) ? params?.q[0] : params?.q
  return raw?.trim() ?? ""
}

function getStatusFilter(params?: { status?: string | string[] }) {
  const raw = Array.isArray(params?.status) ? params?.status[0] : params?.status
  return statusTabs.some((tab) => tab.value === raw) ? raw ?? "all" : "all"
}

function matchesProject(project: Project, query: string) {
  const q = query.toLowerCase()
  return [
    project.name,
    project.description,
    project.status,
    project.clients?.name,
    project.clients?.company,
    project.clients?.email,
  ]
    .filter(Boolean)
    .some((value) => value!.toLowerCase().includes(q))
}

function clampProgress(value: number) {
  return Math.max(0, Math.min(value, 100))
}

function getNextAction(project: Project) {
  const status = normalizeStatus(project.status)
  if (status === "waiting-approval") return "Follow up"
  if (status === "needs-changes") return "Reply to feedback"
  if (status === "completed") return "Review"
  if (project.progress < 40) return "Upload deliverable"
  return "Open workspace"
}

function getTabHref(status: string, query: string) {
  const params = new URLSearchParams()
  if (status !== "all") params.set("status", status)
  if (query) params.set("q", query)
  const suffix = params.toString()
  return suffix ? `/dashboard/projects?${suffix}` : "/dashboard/projects"
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const agency = await ensureAgencyForCurrentUser().catch(() => null)
  const agencyId = agency?.id
  const [projects, clients, billing, params] = await Promise.all([
    getProjects(agencyId),
    getClients(agencyId),
    getBillingOverview(agency),
    searchParams,
  ])
  const query = getQuery(params)
  const statusFilter = getStatusFilter(params)
  const visibleProjects = projects
    .filter((project) => (query ? matchesProject(project, query) : true))
    .filter((project) =>
      statusFilter === "all"
        ? true
        : statusFilter === "attention"
          ? ["waiting-approval", "needs-changes"].includes(normalizeStatus(project.status))
          : normalizeStatus(project.status) === statusFilter
    )

  const totalProjects = projects.length
  const activeProjects = projects.filter((p) => normalizeStatus(p.status) === "in-progress").length
  const waitingApproval = projects.filter((p) => normalizeStatus(p.status) === "waiting-approval").length
  const needsChanges = projects.filter((p) => normalizeStatus(p.status) === "needs-changes").length
  const completed = projects.filter((p) => normalizeStatus(p.status) === "completed").length
  const attentionProjects = projects.filter((p) =>
    ["waiting-approval", "needs-changes"].includes(normalizeStatus(p.status))
  )
  const averageProgress = totalProjects
    ? Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / totalProjects)
    : 0

  const tabCounts = {
    all: totalProjects,
    attention: attentionProjects.length,
    "in-progress": activeProjects,
    "waiting-approval": waitingApproval,
    "needs-changes": needsChanges,
    completed,
  }
  const projectPlanGate = billing
    ? {
        disabled: billing.reached.projects,
        message: getLimitMessage("projects", billing),
        usageLabel: getUsageLabel(billing.usage.projects, billing.limits.max_projects),
      }
    : undefined

  return (
    <>
      <DashboardPageHeader
        badge="Delivery pipeline"
        title="Projects"
        description="Manage agency work by delivery state, client blocker, approval queue, and next action."
        actions={<AddProjectDialog clients={clients} planGate={projectPlanGate} />}
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Active projects"
          value={activeProjects}
          description="In production"
          icon={FolderKanban}
        />
        <MetricCard
          label="Waiting approval"
          value={waitingApproval}
          description="Needs client review"
          icon={Clock3}
          tone="warning"
        />
        <MetricCard
          label="Needs changes"
          value={needsChanges}
          description="Feedback to resolve"
          icon={MessageSquare}
          tone="info"
        />
        <MetricCard
          label="Average progress"
          value={`${averageProgress}%`}
          description={`${completed} completed`}
          icon={TrendingUp}
          tone="success"
        />
      </div>

      <DashboardPanel
        className="mt-6"
        title="Project delivery pipeline"
        description="Filter by status and open the workspace that needs the next agency action."
        action={
          projects.length > 0 || query ? (
            <form action="/dashboard/projects" className="flex flex-col gap-2 sm:flex-row">
              {statusFilter !== "all" ? (
                <input type="hidden" name="status" value={statusFilter} />
              ) : null}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="q"
                  defaultValue={query}
                  placeholder="Search projects..."
                  className="h-10 w-full rounded-full bg-[#f7f7f5] pl-9 sm:w-72"
                />
              </div>
              <Button type="submit" variant="outline" className="rounded-full bg-white">
                Search
              </Button>
              {query ? (
                <Button asChild variant="ghost" className="rounded-full">
                  <Link href={getTabHref(statusFilter, "")}>Clear</Link>
                </Button>
              ) : null}
            </form>
          ) : null
        }
      >
        {attentionProjects.length > 0 ? (
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-black">
                {attentionProjects.length} project{attentionProjects.length === 1 ? "" : "s"} need attention
              </p>
              <p className="mt-1 text-sm leading-6 text-black/60">
                Waiting approvals and client feedback are grouped here so the next action is easier to find.
              </p>
            </div>
            <Button asChild variant="outline" className="shrink-0 rounded-full bg-white">
              <Link href={getTabHref("attention", query)}>Show attention items</Link>
            </Button>
          </div>
        ) : null}

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {statusTabs.map((tab) => (
            <Link
              key={tab.value}
              href={getTabHref(tab.value, query)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors",
                statusFilter === tab.value
                  ? "border-black bg-black text-white"
                  : "border-black/10 bg-[#f7f7f5] text-black/65 hover:bg-white"
              )}
            >
              {tab.label}
              <span className={cn(
                "rounded-full px-1.5 py-0.5 text-[11px]",
                statusFilter === tab.value ? "bg-white/15 text-white" : "bg-white text-black/50"
              )}>
                {tabCounts[tab.value as keyof typeof tabCounts]}
              </span>
            </Link>
          ))}
        </div>

        {projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects in the pipeline"
            description="Create your first project, assign a client, then upload deliverables for review."
            action={<AddProjectDialog clients={clients} planGate={projectPlanGate} />}
          />
        ) : visibleProjects.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No projects match this view"
            description="Try another status tab or search term."
            action={
              <Button asChild variant="outline" className="rounded-full bg-white">
                <Link href="/dashboard/projects">Reset view</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {visibleProjects.map((project) => {
              const progress = clampProgress(project.progress)
              const status = normalizeStatus(project.status)
              const blocked = status === "waiting-approval" || status === "needs-changes"
              const attentionLabel =
                status === "needs-changes"
                  ? "Feedback"
                  : status === "waiting-approval"
                    ? "Waiting approval"
                    : null

              return (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}${status === "needs-changes" ? "?tab=feedback" : status === "waiting-approval" ? "?tab=approvals" : ""}`}
                  className={cn(
                    "group rounded-2xl border bg-[#fafafa] p-4 transition-colors hover:bg-[#f4f4f2]",
                    blocked ? "border-amber-200/80 bg-amber-50/30" : "border-black/10"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{project.name}</h3>
                        <Badge
                          variant="outline"
                          className={`rounded-full ${getStatusClass(project.status)}`}
                        >
                          {formatStatus(project.status)}
                        </Badge>
                        {attentionLabel ? (
                          <Badge variant="outline" className="rounded-full border-black/10 bg-white text-black/65">
                            {attentionLabel}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {project.clients?.name ?? "No client assigned"}
                        {project.clients?.company ? ` · ${project.clients.company}` : ""}
                      </p>
                    </div>
                    <ArrowUpRight className="size-4 shrink-0 text-black/35 transition-colors group-hover:text-black" />
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-black/[0.08]">
                      <div
                        className="h-full rounded-full bg-black"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                    <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-black/[0.06]">
                      <p className="text-xs text-muted-foreground">Last activity</p>
                      <p className="mt-1 font-medium">{formatDate(project.updated_at)}</p>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-black/[0.06] sm:col-span-2">
                      <p className="text-xs text-muted-foreground">Next action</p>
                      <p className="mt-1 font-medium">{getNextAction(project)}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </DashboardPanel>
    </>
  )
}
