import Link from "next/link"
import { BadgeCheck, Clock3, FileUp, Files, FolderKanban, Plus, User } from "lucide-react"
import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DashboardPageHeader,
  DashboardPanel,
  DetailItem,
  EmptyState,
  MetricCard,
} from "@/components/dashboard/dashboard-ui"
import { ensureAgencyForCurrentUser } from "@/lib/actions/workspace"
import { getClientById } from "@/lib/actions/clients"
import { getProjectsByClientId, getCommentsByProjectId, getApprovalsByProjectId } from "@/lib/actions/projects"
import { getProjectFiles } from "@/lib/actions/files"

function formatStatus(status: string) {
  switch (status) {
    case "active": return "In progress"
    case "waiting approval": return "Waiting approval"
    case "client feedback": return "Needs changes"
    case "completed": return "Completed"
    case "approved": return "Completed"
    default: return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

function getProjectStatusClass(status: string) {
  if (status === "completed" || status === "approved") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (status === "waiting approval") return "border-amber-200 bg-amber-50 text-amber-700"
  if (status === "client feedback") return "border-blue-200 bg-blue-50 text-blue-700"
  return "border-black/15 bg-white text-black"
}

function formatClientStatus(status: string) {
  switch (status) {
    case "active": return "Active"
    case "needs_feedback": return "Needs feedback"
    case "needs attention": return "Needs attention"
    case "completed": return "Completed"
    default: return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

function getClientStatusClass(status: string) {
  if (status === "completed") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (status === "needs_feedback" || status === "needs attention") return "border-blue-200 bg-blue-50 text-blue-700"
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

function clampProgress(value: number) {
  return Math.max(0, Math.min(value, 100))
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const agency = await ensureAgencyForCurrentUser().catch(() => null)
  const agencyId = agency?.id
  const client = await getClientById(id, agencyId)

  if (!client) {
    notFound()
  }

  const projects = await getProjectsByClientId(id, agencyId)

  const activeProjects = projects.filter((p) => p.status !== "completed" && p.status !== "approved").length
  const waitingApprovals = projects.filter((p) => p.status === "waiting approval").length

  let totalFiles = 0
  const activityItems: { id: string; text: string; date: string }[] = []

  for (const project of projects) {
    const [comments, approvals, projectFiles] = await Promise.all([
      getCommentsByProjectId(project.id, agencyId),
      getApprovalsByProjectId(project.id, agencyId),
      getProjectFiles(project.id, agencyId),
    ])

    totalFiles += projectFiles.length

    for (const comment of comments) {
      activityItems.push({
        id: `comment-${comment.id}`,
        text: `${comment.author_name ?? comment.author_type} left feedback on ${project.name}`,
        date: comment.created_at,
      })
    }

    for (const approval of approvals) {
      activityItems.push({
        id: `approval-${approval.id}`,
        text: approval.approved_at
          ? `${approval.title} was approved on ${project.name}`
          : `${approval.title} is waiting approval on ${project.name}`,
        date: approval.approved_at ?? approval.created_at,
      })
    }

    for (const file of projectFiles) {
      activityItems.push({
        id: `file-${file.id}`,
        text: `${file.name} uploaded to ${project.name}`,
        date: file.created_at,
      })
    }
  }

  activityItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const recentActivity = activityItems.slice(0, 10)
  const lastActivity = activityItems[0]?.date ?? null

  return (
    <>
      <DashboardPageHeader
        badge="Client profile"
        title={client.name}
        description={`${client.company ?? "Client account"} · ${client.email ?? "No email on file"}`}
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

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Client status"
          value={
            <Badge
              variant="outline"
              className={`rounded-full ${getClientStatusClass(client.status)}`}
            >
              {formatClientStatus(client.status)}
            </Badge>
          }
          description="Account health"
          icon={User}
        />
        <MetricCard
          label="Active projects"
          value={activeProjects}
          description="Not completed yet"
          icon={FolderKanban}
        />
        <MetricCard
          label="Waiting approvals"
          value={waitingApprovals}
          description="Needs client action"
          icon={Clock3}
          tone="warning"
        />
        <MetricCard
          label="Shared files"
          value={totalFiles}
          description="Across linked projects"
          icon={Files}
          tone="muted"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <DashboardPanel
          title="Client projects"
          description="Projects linked to this client."
          action={
            <Button asChild variant="outline" className="rounded-full bg-white">
              <Link href="/dashboard/projects">View all</Link>
            </Button>
          }
        >
          {projects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No projects yet"
              description="Create a project for this client to start tracking deliverables."
              action={
                <Button asChild className="rounded-full">
                  <Link href="/dashboard/projects">New project</Link>
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Updated</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {projects.map((project) => {
                  const progress = clampProgress(project.progress)

                  return (
                    <TableRow key={project.id} className="hover:bg-[#f7f7f5]">
                      <TableCell className="font-medium">
                        <Link
                          href={`/dashboard/projects/${project.id}`}
                          className="hover:underline"
                        >
                          {project.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`rounded-full ${getProjectStatusClass(project.status)}`}
                        >
                          {formatStatus(project.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-32 items-center gap-3">
                          <div className="h-2 w-24 rounded-full bg-black/[0.08]">
                            <div
                              className="h-full rounded-full bg-black"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDate(project.updated_at)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </DashboardPanel>

        <div className="space-y-6">
          <DashboardPanel title="Client info">
            <div className="space-y-3">
              <DetailItem label="Contact" value={client.name} />
              <DetailItem label="Email" value={client.email ?? "-"} />
              <DetailItem label="Company" value={client.company ?? "-"} />
              <DetailItem label="Status" value={formatClientStatus(client.status)} />
              <DetailItem label="Last activity" value={lastActivity ? formatDate(lastActivity) : "-"} />
              <DetailItem label="Created" value={formatDate(client.created_at)} />
            </div>
          </DashboardPanel>

          <DashboardPanel
            title="Quick actions"
            description="Move this client workspace forward."
          >
            <div className="grid gap-3">
              {[
                { label: "Create project", href: "/dashboard/projects", icon: FolderKanban },
                { label: "Upload deliverable", href: "/dashboard/files", icon: FileUp },
                { label: "Review approvals", href: "/dashboard/approvals", icon: BadgeCheck },
              ].map((action) => {
                const Icon = action.icon
                return (
                  <Button
                    key={action.label}
                    asChild
                    variant="outline"
                    className="h-auto justify-start rounded-xl bg-[#f7f7f5] px-4 py-3"
                  >
                    <Link href={action.href}>
                      <Icon className="size-4" />
                      {action.label}
                    </Link>
                  </Button>
                )
              })}
            </div>
            <div className="mt-4 rounded-xl bg-[#f4f4f2] p-4 text-sm leading-6 text-muted-foreground">
              Project portal links are generated from individual project workspaces.
            </div>
          </DashboardPanel>
        </div>
      </div>

      <DashboardPanel
        className="mt-6"
        title="Recent activity"
        description="Latest updates from this client workspace."
      >
        {recentActivity.length === 0 ? (
          <EmptyState
            compact
            icon={User}
            title="No activity yet"
            description="Create a project and share files to start building the activity history."
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {recentActivity.map((item) => (
              <div key={item.id} className="rounded-xl bg-[#f4f4f2] p-4 text-sm leading-6">
                {item.text}
              </div>
            ))}
          </div>
        )}
      </DashboardPanel>
    </>
  )
}
