import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  if (status === "client feedback" || status === "needs changes" || status === "needs_changes") return "border-amber-300 bg-amber-100 text-amber-900"
  return "border-black/15 bg-white text-black/70"
}

function statusDescription(status: string, fileCount: number, description: string | null) {
  if (status === "completed" || status === "approved") return "This project has been approved and completed."
  if (status === "waiting approval" || status === "waiting_approval") return "Waiting for client approval."
  if (status === "client feedback" || status === "needs changes" || status === "needs_changes") return "Client feedback received. Review changes and send an update."
  if (fileCount === 0) return "Start by uploading a file before requesting approval."
  return "Files are ready. Request approval when the deliverable is ready."
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
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProjectById(id)

  if (!project) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="w-full max-w-md rounded-2xl border-black/15 bg-white shadow-sm">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Project not found</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              This project does not exist or you do not have access to it.
            </p>
            <Link href="/dashboard/projects">
              <Button className="mt-6 rounded-full">Back to projects</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const [comments, approvals, projectFiles] = await Promise.all([
    getCommentsByProjectId(project.id),
    getApprovalsByProjectId(project.id),
    getProjectFiles(project.id),
  ])

  const clientComments = comments.filter((comment) => comment.author_type === "client")
  const commentCount = clientComments.length
  const fileCount = projectFiles.length
  const isCompleted = project.status === "completed" || project.status === "approved"

  return (
    <>
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge variant="outline" className="rounded-full bg-white">
            {project.clients?.name ?? "No client"}
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            {project.name}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {statusDescription(project.status, fileCount, project.description)}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <SharePortalPopover portalToken={project.portal_token} agencyId={project.agency_id} />
          {!isCompleted && (
            <RequestApprovalButton
              projectId={project.id}
              fileCount={fileCount}
              status={project.status}
            />
          )}
          {isCompleted && (
            <Badge className="h-10 rounded-full bg-emerald-500 px-4 py-2 text-sm text-white">
              Completed
            </Badge>
          )}
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge
              variant="outline"
              className={`mt-2 rounded-full ${getStatusClass(project.status)}`}
            >
              {formatStatus(project.status)}
            </Badge>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <p className="text-sm text-muted-foreground">Progress</p>
            <p className="mt-3 text-2xl font-semibold">{project.progress}%</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Progress updates automatically as files are shared and approvals are completed.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <p className="text-sm text-muted-foreground">Files</p>
            <p className="mt-3 text-2xl font-semibold">{fileCount}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <p className="text-sm text-muted-foreground">Feedback</p>
            <p className="mt-3 text-2xl font-semibold">
              {commentCount === 0 ? "None" : commentCount === 1 ? "1 comment" : `${commentCount} comments`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 rounded-2xl border-black/15 bg-white shadow-sm">
        <CardContent className="p-5">
          <Tabs defaultValue="overview">
            <TabsList className="h-auto flex-wrap justify-start rounded-2xl bg-[#f1f1ef] p-1">
              <TabsTrigger value="overview" className="rounded-xl">
                Overview
              </TabsTrigger>
              <TabsTrigger value="tasks" className="rounded-xl">
                Tasks
              </TabsTrigger>
              <TabsTrigger value="files" className="rounded-xl">
                Files
              </TabsTrigger>
              <TabsTrigger value="feedback" className="rounded-xl">
                Feedback
              </TabsTrigger>
              <TabsTrigger value="approval" className="rounded-xl">
                Approval
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
                <div className="rounded-2xl border bg-[#fafafa] p-5">
                  <h2 className="text-xl font-semibold">Project summary</h2>
                  <p className="mt-3 leading-7 text-muted-foreground">
                    {statusDescription(project.status, fileCount, project.description)}
                  </p>
                </div>

                <div className="rounded-2xl border bg-[#fafafa] p-5">
                  <h2 className="text-xl font-semibold">Client portal</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Share a clean portal link with the client so they can review
                    project progress and shared files.
                  </p>
                  <div className="mt-5">
                    <SharePortalPopover portalToken={project.portal_token} agencyId={project.agency_id} />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="mt-6">
              <div className="rounded-2xl border bg-[#fafafa] p-8 text-center">
                <p className="text-muted-foreground">No tasks yet.</p>
              </div>
            </TabsContent>

            <TabsContent value="files" className="mt-6">
              {projectFiles.length === 0 ? (
                <div className="rounded-2xl border bg-[#fafafa] p-8 text-center">
                  <p className="text-muted-foreground">No files shared yet.</p>
                  <Link href="/dashboard/files">
                    <Button className="mt-5 rounded-full">Upload file</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {projectFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex flex-col gap-3 rounded-2xl border bg-[#fafafa] p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{file.type ?? "Other"}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 md:justify-end">
                        <p className="text-sm text-muted-foreground">{file.size ?? "-"}</p>
                        {file.url ? (
                          <a href={`/api/files/${file.id}/signed-url`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" className="h-9 rounded-full bg-white text-sm">
                              View
                            </Button>
                          </a>
                        ) : (
                          <Button variant="outline" className="h-9 rounded-full bg-white text-sm" disabled>
                            Stored
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="feedback" className="mt-6">
              {clientComments.length === 0 ? (
                <div className="rounded-2xl border bg-[#fafafa] p-8 text-center">
                  <p className="text-muted-foreground">No client feedback yet.</p>
                </div>
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

            <TabsContent value="approval" className="mt-6">
              <ApprovalTabContent
                status={project.status}
                approvals={approvals}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  )
}
