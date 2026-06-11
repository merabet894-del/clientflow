import Link from "next/link"
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
    case "completed": return "Completed"
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
  if (isNeedsChangesStatus(status)) return "border-amber-300 bg-amber-100 text-amber-900"
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
          <div className="flex items-center gap-2">
            <ClientFlowLogo variant="compact" height={28} />
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-5 py-20">
          <Card className="mx-auto max-w-md rounded-2xl border-black/10 bg-white shadow-sm">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Portal not found</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                This client portal link is invalid or no longer available.
              </p>
              <Link href="/">
                <Button className="mt-6 rounded-full">Go home</Button>
              </Link>
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

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#111111]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:py-6">
        <div className="flex items-center gap-2">
          <ClientFlowLogo variant="compact" height={28} />
        </div>

        <Badge variant="outline" className="rounded-full bg-white">
          Client portal
        </Badge>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-6 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
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
          </div>

          <Card className="rounded-2xl border-black/10 bg-white shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Current status</p>
              <h2 className="mt-3 text-2xl font-semibold">{formatStatus(project.status)}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {statusDescription(project.status)}
              </p>

              {isCompleted ? (
                <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-center">
                  <p className="text-sm font-medium text-emerald-700">
                    This project has been approved and completed.
                  </p>
                </div>
              ) : !hasFiles ? (
                <div className="mt-5 rounded-2xl bg-[#f7f7f5] p-4 text-center">
                  <p className="text-sm text-black/50">
                    No files shared yet. The agency will upload deliverables here.
                  </p>
                </div>
              ) : showApprovalCta ? (
                <div className="mt-5 flex flex-col gap-3">
                  <a href="#feedback">
                    <Button className="w-full rounded-full">
                      Review deliverable
                    </Button>
                  </a>
                  <a href="#feedback" className="flex-1">
                    <Button variant="outline" className="w-full rounded-full bg-white">
                      Request changes
                    </Button>
                  </a>
                </div>
              ) : isNeedsChanges ? (
                <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-center">
                  <p className="text-sm font-medium text-amber-800">
                    Your feedback was sent to the agency.
                  </p>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl bg-[#f7f7f5] p-4 text-center">
                  <p className="text-sm text-black/50">
                    The agency will request feedback or approval when the deliverable is ready.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="rounded-2xl border-black/10 bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="mb-5">
                <h2 className="text-xl font-semibold">Project progress</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Follow the main project steps and what needs your review.
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight">
                  {project.progress}%
                </p>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border bg-[#fafafa] p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-medium">Status</p>
                    <Badge
                      variant="outline"
                      className={`rounded-full ${getStatusClass(project.status)}`}
                    >
                      {formatStatus(project.status)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {statusDescription(project.status)}
                  </p>
                </div>

                <div className="rounded-2xl border bg-[#fafafa] p-4">
                  <p className="font-medium">Progress</p>
                  <div className="mt-3">
                    <div className="h-2 w-full rounded-full bg-black/10">
                      <div
                        className="h-2 rounded-full bg-black transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {project.progress}% complete
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-black/10 bg-white shadow-sm">
            <CardContent className="p-5">
              <h2 className="text-xl font-semibold">Shared files</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Latest files shared by the agency.
              </p>

              {portalFiles.length === 0 ? (
                <div className="mt-5 py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No files shared yet. The agency will upload deliverables here.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {portalFiles.map((file, i) => (
                    <div
                      key={`${file.name}-${i}`}
                      className="rounded-2xl border bg-[#fafafa] p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{file.name}</p>
                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            {file.type ?? "File"} &middot; {file.size ?? "-"}
                          </p>
                        </div>
                        <a
                          href={`/api/portal/${token}/files/${file.id}/signed-url`}
                          target="_blank"
                          className="shrink-0 self-start sm:self-center"
                        >
                          <Button variant="outline" size="sm" className="rounded-full bg-white">
                            View
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {showFeedbackForm && (
          <Card id="feedback" className="mt-6 rounded-2xl border-black/10 bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div>
                  <FeedbackForm token={token} />
                </div>

                {showApprovalCta && (
                  <div className="rounded-2xl bg-black p-5 text-white">
                    <ApprovalButton token={token} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {portalComments.length > 0 && (
          <Card className="mt-6 rounded-2xl border-black/10 bg-white shadow-sm">
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
        )}

        {portalApprovals.length > 0 && (
          <Card className="mt-6 rounded-2xl border-black/10 bg-white shadow-sm">
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
                    {approval.feedback && (
                      <p className="mt-3 leading-7 text-muted-foreground">{approval.feedback}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  )
}
