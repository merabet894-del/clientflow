import Link from "next/link"
import {
  ArrowUpRight,
  BadgeCheck,
  ClipboardCheck,
  Clock3,
  FileUp,
  Files,
  FolderKanban,
  MessageSquare,
  Send,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DashboardPageHeader,
  DashboardPanel,
  EmptyState,
} from "@/components/dashboard/dashboard-ui"
import { ensureAgencyForCurrentUser } from "@/lib/actions/workspace"
import { getProjectById, getCommentsByProjectId, getApprovalsByProjectId } from "@/lib/actions/projects"
import { getProjectFiles } from "@/lib/actions/files"
import { SharePortalPopover } from "@/components/dashboard/share-portal-popover"
import { RequestApprovalButton, ApprovalTabContent } from "@/components/dashboard/project-approval-button"

function formatStatus(status: string) {
  switch (status) {
    case "active": return "In progress"
    case "waiting approval":
    case "waiting_approval": return "Waiting approval"
    case "client feedback":
    case "needs changes":
    case "needs_changes": return "Needs changes"
    case "completed": return "Completed"
    case "approved": return "Completed"
    default: return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

function getStatusClass(status: string) {
  if (status === "completed" || status === "approved") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (status === "waiting approval" || status === "waiting_approval") return "border-amber-300 bg-amber-50 text-amber-800"
  if (status === "client feedback" || status === "needs changes" || status === "needs_changes") return "border-blue-200 bg-blue-50 text-blue-700"
  return "border-black/15 bg-white text-black/70"
}

function statusDescription(status: string, fileCount: number, description: string | null) {
  if (status === "completed" || status === "approved") return "This project has been approved and completed."
  if (status === "waiting approval" || status === "waiting_approval") return "Waiting for client approval."
  if (status === "client feedback" || status === "needs changes" || status === "needs_changes") return "Client feedback received. Review changes and send an update."
  if (fileCount === 0) return "Start by uploading a file before requesting approval."
  return description || "Files are ready. Request approval when the deliverable is ready."
}

function getApprovalState(status: string, approvalCount: number) {
  if (status === "completed" || status === "approved") return "Approved"
  if (status === "waiting approval" || status === "waiting_approval") return "Waiting"
  if (approvalCount > 0) return "Requested"
  return "Not requested"
}

function getNextAction(status: string, fileCount: number, feedbackCount: number, approvalState: string) {
  if (fileCount === 0) {
    return {
      label: "Upload first deliverable",
      description: "Add a file before this project can move into client review.",
      href: "/dashboard/files",
      icon: FileUp,
      type: "link" as const,
    }
  }

  if (status === "client feedback" || status === "needs changes" || status === "needs_changes" || feedbackCount > 0) {
    return {
      label: "Review client feedback",
      description: "Resolve client notes before sending the next deliverable update.",
      href: "#feedback",
      icon: MessageSquare,
      type: "anchor" as const,
    }
  }

  if (approvalState === "Not requested") {
    return {
      label: "Request client approval",
      description: "Send the current deliverables to the portal for client sign-off.",
      href: "",
      icon: Send,
      type: "approval" as const,
    }
  }

  if (approvalState === "Waiting") {
    return {
      label: "Follow up on approval",
      description: "The client has the request. Keep the decision visible until it lands.",
      href: "/dashboard/approvals",
      icon: Clock3,
      type: "link" as const,
    }
  }

  return {
    label: "Review final delivery",
    description: "This workspace is approved. Keep files, feedback, and decisions together here.",
    href: "#approvals",
    icon: BadgeCheck,
    type: "anchor" as const,
  }
}

function getProgressStage(progress: number, approvalState: string) {
  if (approvalState === "Approved" || progress >= 100) return "Approved"
  if (approvalState === "Waiting" || progress >= 70) return "Client review"
  if (progress >= 40) return "Deliverables"
  return "Setup"
}

function getLatestApproval(approvals: { created_at: string; status: string; title: string }[]) {
  return approvals[0] ?? null
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

function getTypeBadge(type: string | null) {
  if (type === "Image") return "border-sky-200 bg-sky-50 text-sky-700"
  if (type === "Archive") return "border-purple-200 bg-purple-50 text-purple-700"
  if (type === "PDF") return "border-rose-200 bg-rose-50 text-rose-700"
  if (type === "Design") return "border-violet-200 bg-violet-50 text-violet-700"
  if (type === "Document") return "border-orange-200 bg-orange-50 text-orange-700"
  return "border-black/15 bg-white text-black"
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ tab?: string | string[] }>
}) {
  const { id } = await params
  const query = await searchParams
  const agency = await ensureAgencyForCurrentUser().catch(() => null)
  const agencyId = agency?.id
  const project = await getProjectById(id, agencyId)

  if (!project) {
    return (
      <div className="py-20">
        <DashboardPanel title="Project not found">
          <EmptyState
            icon={FolderKanban}
            title="Project not found"
            description="This project does not exist or you do not have access to it."
            action={
              <Button asChild className="rounded-full">
                <Link href="/dashboard/projects">Back to projects</Link>
              </Button>
            }
          />
        </DashboardPanel>
      </div>
    )
  }

  const [comments, approvals, projectFiles] = await Promise.all([
    getCommentsByProjectId(project.id, agencyId),
    getApprovalsByProjectId(project.id, agencyId),
    getProjectFiles(project.id, agencyId),
  ])

  const clientComments = comments.filter((comment) => comment.author_type === "client")
  const commentCount = clientComments.length
  const fileCount = projectFiles.length
  const isCompleted = project.status === "completed" || project.status === "approved"
  const approvalState = getApprovalState(project.status, approvals.length)
  const nextAction = getNextAction(project.status, fileCount, commentCount, approvalState)
  const NextActionIcon = nextAction.icon
  const progress = Math.max(0, Math.min(project.progress, 100))
  const progressStage = getProgressStage(progress, approvalState)
  const latestApproval = getLatestApproval(approvals)
  const requestedTab = Array.isArray(query?.tab) ? query?.tab[0] : query?.tab
  const fallbackTab =
    fileCount === 0
      ? "files"
      : approvalState === "Waiting"
        ? "approvals"
        : commentCount > 0 || project.status === "client feedback" || project.status === "needs changes" || project.status === "needs_changes"
          ? "feedback"
          : "overview"
  const defaultTab = ["overview", "files", "feedback", "approvals", "tasks"].includes(requestedTab ?? "")
    ? requestedTab!
    : fallbackTab

  return (
    <>
      <DashboardPageHeader
        badge={project.clients?.name ?? "No client"}
        title={project.name}
        description={statusDescription(project.status, fileCount, project.description)}
        actions={
          <>
            <SharePortalPopover portalToken={project.portal_token} projectId={project.id} />
            {!isCompleted ? (
              <RequestApprovalButton
                projectId={project.id}
                fileCount={fileCount}
                status={project.status}
              />
            ) : (
              <Badge className="h-10 rounded-full bg-emerald-500 px-4 py-2 text-sm text-white">
                Completed
              </Badge>
            )}
          </>
        }
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-2xl border border-black/15 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={`rounded-full ${getStatusClass(project.status)}`}
                >
                  {formatStatus(project.status)}
                </Badge>
                <Badge variant="outline" className="rounded-full bg-[#f7f7f5]">
                  {progressStage}
                </Badge>
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                {progress}% complete
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {statusDescription(project.status, fileCount, project.description)}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f7f7f5] p-4 ring-1 ring-black/[0.06] lg:w-72">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <NextActionIcon className="size-3.5" />
                Next action
              </div>
              <p className="mt-3 font-semibold">{nextAction.label}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {nextAction.description}
              </p>
              <div className="mt-4">
                {nextAction.type === "approval" ? (
                  <RequestApprovalButton
                    projectId={project.id}
                    fileCount={fileCount}
                    status={project.status}
                  />
                ) : (
                  <Button asChild className="rounded-full">
                    <Link href={nextAction.href}>
                      Continue
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="h-3 overflow-hidden rounded-full bg-black/[0.08]">
              <div
                className="h-full rounded-full bg-black"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-xs text-muted-foreground">
              {["Setup", "Deliverables", "Client review", "Approved"].map((stage) => (
                <span
                  key={stage}
                  className={stage === progressStage ? "font-medium text-black" : undefined}
                >
                  {stage}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Client", value: project.clients?.name ?? "No client", icon: FolderKanban },
              { label: "Deliverables", value: `${fileCount}`, icon: Files },
              { label: "Feedback", value: commentCount === 0 ? "None" : `${commentCount}`, icon: MessageSquare },
              { label: "Approval", value: approvalState, icon: ClipboardCheck },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="rounded-xl bg-[#f7f7f5] px-4 py-3 ring-1 ring-black/[0.06]">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <Icon className="size-3.5" />
                    {item.label}
                  </div>
                  <p className="mt-2 truncate text-base font-semibold">{item.value}</p>
                </div>
              )
            })}
          </div>
        </section>

        <aside className="rounded-2xl border border-black/15 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Workspace pulse</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Files, feedback, and approval state at a glance.
          </p>
          <div className="mt-5 space-y-3">
            <div className="rounded-xl bg-[#f7f7f5] p-4 ring-1 ring-black/[0.06]">
              <p className="text-xs font-medium text-muted-foreground">Latest file</p>
              <p className="mt-1 truncate text-sm font-medium">
                {projectFiles[0]?.name ?? "No deliverables uploaded"}
              </p>
            </div>
            <div className="rounded-xl bg-[#f7f7f5] p-4 ring-1 ring-black/[0.06]">
              <p className="text-xs font-medium text-muted-foreground">Latest feedback</p>
              <p className="mt-1 truncate text-sm font-medium">
                {clientComments[0]?.body ?? "No client feedback yet"}
              </p>
            </div>
            <div className="rounded-xl bg-[#f7f7f5] p-4 ring-1 ring-black/[0.06]">
              <p className="text-xs font-medium text-muted-foreground">Approval request</p>
              <p className="mt-1 truncate text-sm font-medium">
                {latestApproval ? `${latestApproval.title} · ${formatStatus(latestApproval.status)}` : "Not requested yet"}
              </p>
            </div>
          </div>
        </aside>
      </div>

      <DashboardPanel
        className="mt-6"
        title="Project workspace"
        description="Review project summary, files, client feedback, and approval status."
      >
        <Tabs defaultValue={defaultTab}>
          <TabsList className="h-auto flex-wrap justify-start rounded-2xl bg-[#f1f1ef] p-1">
            <TabsTrigger value="overview" className="rounded-xl">
              Overview
            </TabsTrigger>
            <TabsTrigger value="files" className="rounded-xl">
              Deliverables
            </TabsTrigger>
            <TabsTrigger value="feedback" className="rounded-xl">
              Feedback
            </TabsTrigger>
            <TabsTrigger value="approvals" className="rounded-xl">
              Approvals
            </TabsTrigger>
            <TabsTrigger value="tasks" className="rounded-xl">
              Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="rounded-2xl border bg-[#fafafa] p-5">
                <h2 className="text-xl font-semibold">Delivery board</h2>
                <p className="mt-3 leading-7 text-muted-foreground">
                  {statusDescription(project.status, fileCount, project.description)}
                </p>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {[
                    {
                      label: "Deliver",
                      title: fileCount > 0 ? `${fileCount} file${fileCount === 1 ? "" : "s"} shared` : "No files yet",
                      body: fileCount > 0 ? "Deliverables are attached to this workspace." : "Upload work before review can begin.",
                      icon: Files,
                    },
                    {
                      label: "Review",
                      title: commentCount > 0 ? `${commentCount} feedback item${commentCount === 1 ? "" : "s"}` : "No feedback yet",
                      body: commentCount > 0 ? "Client notes are ready to resolve." : "Portal feedback will appear here.",
                      icon: MessageSquare,
                    },
                    {
                      label: "Approve",
                      title: approvalState,
                      body: latestApproval ? `Latest request: ${latestApproval.title}` : "Request approval after deliverables are ready.",
                      icon: BadgeCheck,
                    },
                  ].map((card) => {
                    const Icon = card.icon
                    return (
                      <div key={card.label} className="rounded-xl bg-white p-4 ring-1 ring-black/[0.06]">
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          <Icon className="size-3.5" />
                          {card.label}
                        </div>
                        <p className="mt-3 font-semibold">{card.title}</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{card.body}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-2xl border bg-[#fafafa] p-5">
                <h2 className="text-xl font-semibold">Client portal</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Share a clean portal link with the client so they can review project progress and shared files.
                </p>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-black/[0.06]">
                    <span className="text-muted-foreground">Client</span>
                    <span className="font-medium">{project.clients?.name ?? "No client assigned"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-black/[0.06]">
                    <span className="text-muted-foreground">Updated</span>
                    <span className="font-medium">{formatDate(project.updated_at)}</span>
                  </div>
                </div>
                <div className="mt-5">
                  <SharePortalPopover portalToken={project.portal_token} projectId={project.id} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <EmptyState
              compact
              icon={ClipboardCheck}
              title="Tasks coming soon"
              description="A task checklist for agency-side production will appear here when task records are available."
            />
          </TabsContent>

          <TabsContent id="files" value="files" className="mt-6">
            {projectFiles.length === 0 ? (
              <EmptyState
                compact
                icon={FileUp}
                title="No files shared yet"
                description="Upload a file before requesting approval."
                action={
                  <Button asChild className="rounded-full">
                    <Link href="/dashboard/files">Upload file</Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {projectFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex flex-col gap-3 rounded-2xl border bg-[#fafafa] p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{file.name}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`rounded-full ${getTypeBadge(file.type)}`}
                        >
                          {file.type ?? "Other"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{file.size ?? "-"}</span>
                      </div>
                    </div>
                    {file.url ? (
                      <Button asChild variant="outline" className="h-9 rounded-full bg-white text-sm">
                        <a href={`/api/files/${file.id}/signed-url`} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                    ) : (
                      <Button variant="outline" className="h-9 rounded-full bg-white text-sm" disabled>
                        Stored
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent id="feedback" value="feedback" className="mt-6">
            {clientComments.length === 0 ? (
              <EmptyState
                compact
                icon={MessageSquare}
                title="No client feedback yet"
                description="Feedback submitted through the portal will appear here."
              />
            ) : (
              <div className="space-y-3">
                {clientComments.map((comment) => (
                  <div key={comment.id} className="rounded-2xl border bg-[#fafafa] p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <p className="font-medium">{comment.author_name ?? comment.author_type}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </p>
                    </div>
                    <p className="mt-3 leading-7 text-muted-foreground">
                      {comment.body}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent id="approvals" value="approvals" className="mt-6">
            <ApprovalTabContent
              status={project.status}
              approvals={approvals}
            />
          </TabsContent>
        </Tabs>
      </DashboardPanel>
    </>
  )
}
