import Link from "next/link"
import {
  ArrowUpRight,
  BadgeCheck,
  CircleAlert,
  Clock3,
  FolderKanban,
  MessageSquare,
  Send,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DashboardPageHeader,
  DashboardPanel,
  EmptyState,
  MetricCard,
} from "@/components/dashboard/dashboard-ui"
import { ensureAgencyForCurrentUser } from "@/lib/actions/workspace"
import { getApprovals, getApprovalStats, type ApprovalWithProject } from "@/lib/actions/approvals"
import { cn } from "@/lib/utils"

type ApprovalsPageProps = {
  searchParams?: Promise<{ status?: string | string[] }>
}

const statusTabs = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "needs-changes", label: "Needs changes" },
]

function normalizeStatus(status: string) {
  if (status === "approved") return "approved"
  if (status === "client feedback" || status === "needs changes" || status === "needs_changes") return "needs-changes"
  return "pending"
}

function formatStatus(status: string) {
  if (status === "approved") return "Approved"
  if (status === "pending" || status === "waiting approval") return "Waiting approval"
  if (status === "client feedback" || status === "needs changes" || status === "needs_changes") return "Needs changes"
  return status
}

function getStatusClass(status: string) {
  if (status === "approved") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (status === "client feedback" || status === "needs changes" || status === "needs_changes") return "border-blue-200 bg-blue-50 text-blue-700"
  if (status === "pending" || status === "waiting approval") return "border-amber-200 bg-amber-50 text-amber-700"
  return "border-black/15 bg-white text-black"
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

function getStatusFilter(params?: { status?: string | string[] }) {
  const raw = Array.isArray(params?.status) ? params?.status[0] : params?.status
  return statusTabs.some((tab) => tab.value === raw) ? raw ?? "all" : "all"
}

function getTabHref(status: string) {
  return status === "all" ? "/dashboard/approvals" : `/dashboard/approvals?status=${status}`
}

function getNextAction(approval: ApprovalWithProject) {
  const status = normalizeStatus(approval.status)
  if (status === "pending") return "Follow up with client"
  if (status === "needs-changes") return "Resolve feedback"
  return "Review approval"
}

function getApprovalPriority(status: string) {
  const normalized = normalizeStatus(status)
  if (normalized === "needs-changes") return 0
  if (normalized === "pending") return 1
  return 2
}

const workflowSteps = [
  {
    step: "1",
    title: "Deliverable uploaded",
    description: "A file is linked to a project workspace.",
  },
  {
    step: "2",
    title: "Approval requested",
    description: "The client reviews the work in their portal.",
  },
  {
    step: "3",
    title: "Decision tracked",
    description: "Approved work and requested changes stay attached to the project.",
  },
]

export default async function ApprovalsPage({ searchParams }: ApprovalsPageProps) {
  const agency = await ensureAgencyForCurrentUser().catch(() => null)
  const agencyId = agency?.id
  const [approvals, stats, params] = await Promise.all([
    getApprovals(agencyId),
    getApprovalStats(agencyId),
    searchParams,
  ])
  const statusFilter = getStatusFilter(params)
  const visibleApprovals = approvals
    .filter((approval) =>
      statusFilter === "all" ? true : normalizeStatus(approval.status) === statusFilter
    )
    .sort((a, b) => {
      const priorityDiff = getApprovalPriority(a.status) - getApprovalPriority(b.status)
      if (priorityDiff !== 0) return priorityDiff
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const tabCounts = {
    all: approvals.length,
    pending: approvals.filter((a) => normalizeStatus(a.status) === "pending").length,
    approved: approvals.filter((a) => normalizeStatus(a.status) === "approved").length,
    "needs-changes": approvals.filter((a) => normalizeStatus(a.status) === "needs-changes").length,
  }

  return (
    <>
      <DashboardPageHeader
        badge="Approval workflow"
        title="Approvals"
        description="Track client decisions, follow up on pending reviews, and resolve requested changes."
        actions={
          <Button asChild className="rounded-full">
            <Link href="/dashboard/projects">
              <FolderKanban className="size-4" />
              Request from project
            </Link>
          </Button>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Waiting approval"
          value={stats.waitingApproval}
          description="Pending client decision"
          icon={Clock3}
          tone="warning"
        />
        <MetricCard
          label="Approved this month"
          value={stats.approvedThisMonth}
          description="Completed decisions"
          icon={BadgeCheck}
          tone="success"
        />
        <MetricCard
          label="Needs changes"
          value={stats.feedbackRequested}
          description="Feedback requested"
          icon={MessageSquare}
          tone="info"
        />
        <MetricCard
          label="Average approval time"
          value={stats.averageApprovalTime}
          description="From request to decision"
          icon={CircleAlert}
          tone="muted"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <DashboardPanel
          title="Approval queue"
          description="Every client decision grouped by workflow state."
        >
          <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
            {statusTabs.map((tab) => (
              <Link
                key={tab.value}
                href={getTabHref(tab.value)}
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

          {approvals.length === 0 ? (
            <EmptyState
              icon={Send}
              title="No approval requests yet"
              description="Upload a deliverable on a project, then request approval from the project workspace."
              action={
                <Button asChild className="rounded-full">
                  <Link href="/dashboard/projects">Go to projects</Link>
                </Button>
              }
            />
          ) : visibleApprovals.length === 0 ? (
            <EmptyState
              compact
              icon={BadgeCheck}
              title="No approvals in this status"
              description="Switch tabs to see the rest of the approval queue."
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {visibleApprovals.map((item) => (
                <Link
                  key={item.id}
                  href={item.projects ? `/dashboard/projects/${item.projects.id}?tab=approvals` : "/dashboard/approvals"}
                  className={cn(
                    "group rounded-2xl border bg-[#fafafa] p-4 transition-colors hover:bg-[#f4f4f2]",
                    normalizeStatus(item.status) === "approved"
                      ? "border-black/10"
                      : "border-amber-200/80 bg-amber-50/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Badge
                        variant="outline"
                        className={`rounded-full ${getStatusClass(item.status)}`}
                      >
                        {formatStatus(item.status)}
                      </Badge>
                      {normalizeStatus(item.status) !== "approved" ? (
                        <Badge variant="outline" className="ml-2 rounded-full border-black/10 bg-white text-black/65">
                          Needs action
                        </Badge>
                      ) : null}
                      <h3 className="mt-3 font-semibold">{item.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.projects?.name ?? "Unknown project"} · {item.projects?.clients?.name ?? "No client"}
                      </p>
                    </div>
                    <ArrowUpRight className="size-4 shrink-0 text-black/35 transition-colors group-hover:text-black" />
                  </div>
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-black/[0.06]">
                      <p className="text-xs text-muted-foreground">Sent</p>
                      <p className="mt-1 font-medium">{formatDate(item.created_at)}</p>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-black/[0.06]">
                      <p className="text-xs text-muted-foreground">Next action</p>
                      <p className="mt-1 font-medium">{getNextAction(item)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </DashboardPanel>

        <div className="space-y-6">
          <DashboardPanel
            title="How approvals work"
            description="The delivery loop for client decisions."
          >
            <div className="space-y-4">
              {workflowSteps.map((step) => (
                <div key={step.step} className="flex gap-4 rounded-xl bg-[#f4f4f2] p-4">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-black text-sm font-medium text-white">
                    {step.step}
                  </div>
                  <div>
                    <p className="font-medium">{step.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </DashboardPanel>

          <DashboardPanel
            title="Follow-up focus"
            description="What should happen next."
          >
            {tabCounts.pending === 0 && tabCounts["needs-changes"] === 0 ? (
              <EmptyState
                compact
                icon={BadgeCheck}
                title="No follow-ups needed"
                description="Pending approvals and requested changes will appear here."
              />
            ) : (
              <div className="space-y-3">
                {approvals
                  .filter((item) => normalizeStatus(item.status) !== "approved")
                  .slice(0, 5)
                  .map((item) => (
                    <div key={item.id} className="rounded-xl bg-[#f4f4f2] p-4 text-sm leading-6">
                      <span className="font-medium">{item.projects?.name ?? "A project"}</span>
                      <span className="text-muted-foreground"> · {getNextAction(item)}</span>
                    </div>
                  ))}
              </div>
            )}
          </DashboardPanel>
        </div>
      </div>
    </>
  )
}
