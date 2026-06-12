import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  MessageSquare,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  getProjectByPortalToken,
  getPortalApprovals,
  getPortalComments,
  getPortalProjectFiles,
} from "@/lib/actions/portal"
import { FeedbackForm } from "@/components/portal/feedback-form"
import { ApprovalButton } from "@/components/portal/approval-button"
import { ClientFlowLogo } from "@/components/brand/clientflow-logo"

function isCompletedStatus(status: string) {
  return status === "completed" || status === "approved"
}

function isWaitingApprovalStatus(status: string) {
  return status === "waiting approval" || status === "waiting_approval"
}

function isNeedsChangesStatus(status: string) {
  return status === "client feedback" || status === "needs changes" || status === "needs_changes"
}

function formatStatus(status: string) {
  switch (status) {
    case "active":
    case "in_progress": return "In progress"
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

function statusDescription(status: string) {
  if (isCompletedStatus(status)) return "This project has been approved and completed."
  if (isWaitingApprovalStatus(status)) return "Review the deliverable and approve or request changes."
  if (isNeedsChangesStatus(status)) return "Your feedback was sent to the agency."
  return "The agency will request feedback or approval when the deliverable is ready."
}

function getStatusClass(status: string) {
  if (isCompletedStatus(status)) return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (isWaitingApprovalStatus(status)) return "border-amber-300 bg-amber-50 text-amber-800"
  if (isNeedsChangesStatus(status)) return "border-blue-200 bg-blue-50 text-blue-700"
  return "border-black/15 bg-white text-black/70"
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

function heroDescription(status: string, description: string | null) {
  if (isCompletedStatus(status)) {
    return "This project has been completed. You can still view shared files and approval history."
  }

  if (isWaitingApprovalStatus(status)) {
    return description ?? "Review the latest deliverable, request changes, or approve when everything looks right."
  }

  if (isNeedsChangesStatus(status)) {
    return description ?? "Your feedback was sent to the agency. The agency will review it and share the next update here."
  }

  return description ?? "Review project progress and shared files here. The agency will request feedback or approval when the deliverable is ready."
}

function nextActionTitle(status: string, hasFiles: boolean) {
  if (isCompletedStatus(status)) return "Project approved"
  if (!hasFiles) return "Waiting for files"
  if (isWaitingApprovalStatus(status)) return "Review requested"
  if (isNeedsChangesStatus(status)) return "Feedback sent"
  return "No action needed yet"
}

function nextActionDescription(status: string, hasFiles: boolean) {
  if (isCompletedStatus(status)) return "Everything is accepted. Your files and approval history remain available below."
  if (!hasFiles) return "The agency will upload files here when a deliverable is ready."
  if (isWaitingApprovalStatus(status)) return "Open the latest file, then approve it or send changes."
  if (isNeedsChangesStatus(status)) return "The agency has your notes and will share an update."
  return "You can review shared files while the agency prepares the next request."
}

function progressWidth(progress: number) {
  return `${Math.max(0, Math.min(progress, 100))}%`
}

function PortalMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string | number
  icon: LucideIcon
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl bg-[#f4f4f2] text-black/60">
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  )
}

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const [project, portalFiles, portalComments, portalApprovals] = await Promise.all([
    getProjectByPortalToken(token),
    getPortalProjectFiles(token),
    getPortalComments(token),
    getPortalApprovals(token),
  ])

  if (!project) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] text-[#111111]">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
          <ClientFlowLogo variant="compact" height={28} />
        </header>

        <section className="mx-auto max-w-6xl px-5 py-20">
          <Card className="mx-auto max-w-md rounded-2xl border-black/10 bg-white shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-black/[0.04] text-black/35">
                <ShieldCheck className="size-5" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">Portal not found</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                This client portal link is invalid or no longer available.
              </p>
              <Button asChild className="mt-6 rounded-full">
                <Link href="/">Go home</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    )
  }

  const isCompleted = isCompletedStatus(project.status)
  const hasFiles = portalFiles.length > 0
  const isWaitingApproval = isWaitingApprovalStatus(project.status)
  const isNeedsChanges = isNeedsChangesStatus(project.status)
  const showFeedbackForm = isWaitingApproval && hasFiles && !isCompleted
  const showApprovalCta = isWaitingApproval && hasFiles && !isCompleted

  const steps = [
    {
      label: "Open files",
      done: hasFiles,
      active: !hasFiles,
    },
    {
      label: "Review",
      done: isNeedsChanges || isCompleted,
      active: showFeedbackForm,
    },
    {
      label: "Decision",
      done: isCompleted,
      active: isNeedsChanges,
    },
  ]

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#111111]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <ClientFlowLogo variant="compact" height={28} />
          <Badge variant="outline" className="rounded-full bg-white">
            Client portal
          </Badge>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div>
            <Badge variant="outline" className="rounded-full bg-white">
              {project.clients?.name ?? "Client"}
            </Badge>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              {project.name}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              {heroDescription(project.status, project.description)}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {steps.map((step, index) => (
                <div
                  key={step.label}
                  className={`rounded-2xl border p-4 ${
                    step.done
                      ? "border-emerald-200 bg-emerald-50"
                      : step.active
                        ? "border-black/15 bg-white"
                        : "border-black/10 bg-white/70"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${
                        step.done ? "bg-emerald-600 text-white" : step.active ? "bg-black text-white" : "bg-black/[0.06] text-black/35"
                      }`}
                    >
                      {step.done ? <CheckCircle2 className="size-4" /> : index + 1}
                    </span>
                    <p className="text-sm font-medium">{step.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="rounded-2xl border-black/10 bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Next action</p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    {nextActionTitle(project.status, hasFiles)}
                  </h2>
                </div>
                <Badge variant="outline" className={`rounded-full ${getStatusClass(project.status)}`}>
                  {formatStatus(project.status)}
                </Badge>
              </div>

              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {nextActionDescription(project.status, hasFiles)}
              </p>

              <div className="mt-5">
                {isCompleted ? (
                  <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                    Approved and completed.
                  </div>
                ) : !hasFiles ? (
                  <div className="rounded-2xl bg-[#f7f7f5] p-4 text-sm text-black/50">
                    No files shared yet.
                  </div>
                ) : showApprovalCta ? (
                  <div className="flex flex-col gap-3">
                    <Button asChild className="rounded-full">
                      <a href="#files">
                        Review files
                        <ArrowRight className="size-4" />
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="rounded-full bg-white">
                      <a href="#feedback">Send feedback</a>
                    </Button>
                  </div>
                ) : isNeedsChanges ? (
                  <div className="rounded-2xl bg-blue-50 p-4 text-sm font-medium text-blue-700">
                    Feedback sent to the agency.
                  </div>
                ) : (
                  <div className="rounded-2xl bg-[#f7f7f5] p-4 text-sm text-black/50">
                    The agency will request feedback or approval when ready.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <PortalMetric label="Progress" value={`${project.progress}%`} icon={Clock3} />
          <PortalMetric label="Files" value={portalFiles.length} icon={FileText} />
          <PortalMetric label="Feedback" value={portalComments.length} icon={MessageSquare} />
          <PortalMetric label="Approvals" value={portalApprovals.length} icon={BadgeCheck} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <Card className="rounded-2xl border-black/10 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold">Project progress</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Follow the main project state and current review status.
                  </p>
                </div>

                <div className="rounded-2xl border bg-[#fafafa] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{formatStatus(project.status)}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {statusDescription(project.status)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 rounded-full ${getStatusClass(project.status)}`}
                    >
                      {formatStatus(project.status)}
                    </Badge>
                  </div>

                  <div className="mt-5">
                    <div className="h-2 w-full rounded-full bg-black/10">
                      <div
                        className="h-2 rounded-full bg-black transition-all"
                        style={{ width: progressWidth(project.progress) }}
                      />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {project.progress}% complete
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card id="files" className="rounded-2xl border-black/10 bg-white shadow-sm">
              <CardContent className="p-5">
                <h2 className="text-xl font-semibold">Shared files</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Open the latest files shared by the agency.
                </p>

                {portalFiles.length === 0 ? (
                  <div className="mt-5 rounded-2xl bg-[#f7f7f5] px-4 py-10 text-center">
                    <FileText className="mx-auto size-8 text-black/25" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      No files shared yet. The agency will upload deliverables here.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {portalFiles.map((file) => (
                      <div
                        key={file.id}
                        className="rounded-2xl border bg-[#fafafa] p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="truncate font-medium">{file.name}</p>
                            <p className="mt-1 truncate text-sm text-muted-foreground">
                              {file.type ?? "File"} / {file.size ?? "-"} / {formatDate(file.created_at)}
                            </p>
                          </div>
                          <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full bg-white">
                            <a
                              href={`/api/portal/${token}/files/${file.id}/signed-url`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="size-4" />
                              View
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {showFeedbackForm ? (
              <Card id="feedback" className="rounded-2xl border-black/10 bg-white shadow-sm">
                <CardContent className="p-5">
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <FeedbackForm token={token} />
                    {showApprovalCta ? (
                      <div className="rounded-2xl bg-black p-5 text-white">
                        <ApprovalButton token={token} />
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <div className="space-y-6">
            <Card className="rounded-2xl border-black/10 bg-white shadow-sm">
              <CardContent className="p-5">
                <h2 className="text-xl font-semibold">Portal guide</h2>
                <div className="mt-5 space-y-3">
                  {[
                    "Open each shared file.",
                    "Send feedback if changes are needed.",
                    "Approve the deliverable when it is ready.",
                  ].map((item, index) => (
                    <div key={item} className="flex gap-3 rounded-xl bg-[#f7f7f5] p-3 text-sm">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-medium text-white">
                        {index + 1}
                      </span>
                      <span className="leading-6 text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {portalComments.length > 0 ? (
              <Card className="rounded-2xl border-black/10 bg-white shadow-sm">
                <CardContent className="p-5">
                  <h2 className="text-xl font-semibold">Previous feedback</h2>
                  <div className="mt-5 space-y-3">
                    {portalComments.map((comment) => (
                      <div key={comment.id} className="rounded-2xl border bg-[#fafafa] p-4">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                          <p className="font-medium">{comment.author_name ?? "Client"}</p>
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
                </CardContent>
              </Card>
            ) : null}

            {portalApprovals.length > 0 ? (
              <Card className="rounded-2xl border-black/10 bg-white shadow-sm">
                <CardContent className="p-5">
                  <h2 className="text-xl font-semibold">Approval history</h2>
                  <div className="mt-5 space-y-3">
                    {portalApprovals.map((approval) => (
                      <div key={approval.id} className="rounded-2xl border bg-[#fafafa] p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                          <p className="font-medium">{approval.title}</p>
                          <Badge
                            variant="outline"
                            className={`rounded-full ${
                              approval.status === "approved"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            {approval.status === "approved" ? "Approved" : "Waiting approval"}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {approval.status === "approved" && approval.approved_at
                            ? `Approved on ${new Date(approval.approved_at).toLocaleDateString()}`
                            : `Requested on ${new Date(approval.created_at).toLocaleDateString()}`}
                        </p>
                        {approval.feedback ? (
                          <p className="mt-3 leading-7 text-muted-foreground">{approval.feedback}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  )
}
