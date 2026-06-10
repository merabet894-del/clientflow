import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getProjectByPortalToken, getPortalProjectFiles } from "@/lib/actions/portal"
import { FeedbackForm } from "@/components/portal/feedback-form"
import { ApprovalButton } from "@/components/portal/approval-button"
import { StatusCardApprove } from "@/components/portal/status-card-approve"

function formatStatus(status: string) {
  switch (status) {
    case "active": return "In progress"
    case "waiting approval": return "Waiting approval"
    case "client feedback": return "Client feedback"
    case "completed": return "Completed"
    default: return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

function statusDescription(status: string) {
  switch (status) {
    case "active":
      return "The project is currently in progress. Your agency will let you know when it's ready for review."
    case "waiting approval":
      return "A deliverable is ready for your review. Please approve it or leave feedback to move forward."
    case "client feedback":
      return "The agency has received your feedback and is working on updates."
    case "completed":
      return "This project has been completed. Thank you for your collaboration!"
    default:
      return "Your agency will keep you updated on project progress here."
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

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const [project, portalFiles] = await Promise.all([
    getProjectByPortalToken(token),
    getPortalProjectFiles(token),
  ])

  if (!project) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] text-[#111111]">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-sm font-semibold text-white">
              C
            </div>
            <span className="text-lg font-semibold tracking-tight">ClientFlow</span>
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

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#111111]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-sm font-semibold text-white">
            C
          </div>
          <span className="text-lg font-semibold tracking-tight">ClientFlow</span>
        </div>

        <Badge variant="outline" className="rounded-full bg-white">
          Client portal
        </Badge>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <Badge variant="outline" className="rounded-full bg-white">
              {project.clients?.name ?? "Client"}
            </Badge>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              {project.name}
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
              {project.description ?? "Review project progress, check uploaded files, leave feedback, and approve the latest deliverable from one clean portal."}
            </p>
          </div>

          <Card className="rounded-2xl border-black/10 bg-white shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Current status</p>
              <h2 className="mt-3 text-2xl font-semibold">{formatStatus(project.status)}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {statusDescription(project.status)}
              </p>

              {project.status === "completed" || project.status === "approved" ? (
                <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-center">
                  <p className="text-sm font-medium text-emerald-700">
                    This project has been approved and completed.
                  </p>
                </div>
              ) : (
                <div className="mt-5 flex gap-3">
                  <StatusCardApprove token={token} />
                  <a href="#feedback" className="flex-1">
                    <Button variant="outline" className="w-full rounded-full bg-white">
                      Leave feedback
                    </Button>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
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
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Status</p>
                    <Badge
                      variant="outline"
                      className={`rounded-full ${
                        project.status === "completed"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : project.status === "waiting approval"
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "bg-white"
                      }`}
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
                  <p className="text-sm text-muted-foreground">No files shared yet.</p>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {portalFiles.map((file, i) => (
                    <div
                      key={`${file.name}-${i}`}
                      className="rounded-2xl border bg-[#fafafa] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{file.name}</p>
                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            {file.type ?? "File"} &middot; {file.size ?? "—"}
                          </p>
                        </div>
                        <a
                          href={`/api/portal/${token}/files/${file.id}/signed-url`}
                          target="_blank"
                          className="shrink-0"
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

        <Card id="feedback" className="mt-6 rounded-2xl border-black/10 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <div>
                <FeedbackForm
                  token={token}
                  isFinal={
                    project.status === "completed" || project.status === "approved"
                  }
                />
              </div>

              {project.status !== "completed" && project.status !== "approved" && (
                <div className="rounded-2xl bg-black p-5 text-white">
                  <ApprovalButton token={token} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
