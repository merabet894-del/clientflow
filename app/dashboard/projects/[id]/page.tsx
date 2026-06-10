import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getProjectById, getCommentsByProjectId, getApprovalsByProjectId } from "@/lib/actions/projects"
import { getProjectFiles } from "@/lib/actions/files"

function formatStatus(status: string) {
  switch (status) {
    case "active": return "In progress"
    case "waiting approval": return "Waiting approval"
    case "client feedback": return "Client feedback"
    case "completed": return "Completed"
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

function getTypeBadge(type: string | null) {
  if (type === "Image") return "border-sky-200 bg-sky-50 text-sky-700"
  if (type === "Archive") return "border-purple-200 bg-purple-50 text-purple-700"
  if (type === "PDF") return "border-rose-200 bg-rose-50 text-rose-700"
  if (type === "Design") return "border-violet-200 bg-violet-50 text-violet-700"
  if (type === "Document") return "border-orange-200 bg-orange-50 text-orange-700"
  return "border-black/10 bg-white text-black"
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
        <Card className="w-full max-w-md rounded-2xl border-black/10 bg-white shadow-sm">
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

  const latestApproval = approvals[0] ?? null
  const commentCount = comments.length
  const fileCount = projectFiles.length

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
            {project.description ?? "Manage project progress, files, feedback, and client approval."}
          </p>
        </div>

        <div className="flex gap-3">
          <Link href={`/portal/${project.portal_token}`}>
            <Button variant="outline" className="rounded-full bg-white">
              Share portal
            </Button>
          </Link>
          <Button className="rounded-full">Request approval</Button>
        </div>
      </header>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl border-black/10 bg-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="mt-3 text-2xl font-semibold">
              {formatStatus(project.status)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/10 bg-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Progress</p>
            <p className="mt-3 text-2xl font-semibold">{project.progress}%</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/10 bg-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Files</p>
            <p className="mt-3 text-2xl font-semibold">{fileCount}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/10 bg-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Feedback</p>
            <p className="mt-3 text-2xl font-semibold">
              {commentCount === 0 ? "None" : commentCount === 1 ? "1 comment" : `${commentCount} comments`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 rounded-2xl border-black/10 bg-white shadow-sm">
        <CardContent className="p-5">
          <Tabs defaultValue="overview">
            <TabsList className="rounded-full bg-[#f1f1ef]">
              <TabsTrigger value="overview" className="rounded-full">
                Overview
              </TabsTrigger>
              <TabsTrigger value="tasks" className="rounded-full">
                Tasks
              </TabsTrigger>
              <TabsTrigger value="files" className="rounded-full">
                Files
              </TabsTrigger>
              <TabsTrigger value="feedback" className="rounded-full">
                Feedback
              </TabsTrigger>
              <TabsTrigger value="approval" className="rounded-full">
                Approval
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
                <div className="rounded-2xl border bg-[#fafafa] p-5">
                  <h2 className="text-xl font-semibold">Project summary</h2>
                  <p className="mt-3 leading-7 text-muted-foreground">
                    {project.description ?? `${project.name} is currently in progress. Track tasks, files, and client feedback from this page.`}
                  </p>
                </div>

                <div className="rounded-2xl border bg-[#fafafa] p-5">
                  <h2 className="text-xl font-semibold">Client portal</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Share a clean portal link with the client so they can review
                    progress, leave feedback, and approve work.
                  </p>
                  <Link href={`/portal/${project.portal_token}`}>
                    <Button className="mt-5 w-full rounded-full">
                      Open portal
                    </Button>
                  </Link>
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
                  <p className="text-muted-foreground">No files shared for this project yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projectFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex flex-col gap-3 rounded-2xl border bg-[#fafafa] p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{file.type ?? "Other"}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm text-muted-foreground">{file.size ?? "—"}</p>
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
              {comments.length === 0 ? (
                <div className="rounded-2xl border bg-[#fafafa] p-8 text-center">
                  <p className="text-muted-foreground">No feedback yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="rounded-2xl border bg-[#fafafa] p-4">
                      <div className="flex items-center justify-between gap-4">
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
              {latestApproval ? (
                <div className="rounded-2xl border bg-[#fafafa] p-6">
                  {latestApproval.status === "approved" ? (
                    <Badge className="rounded-full bg-emerald-500 text-white">
                      Approved
                    </Badge>
                  ) : (
                    <Badge className="rounded-full bg-amber-500 text-white">
                      {formatStatus(project.status)}
                    </Badge>
                  )}
                  <h2 className="mt-4 text-2xl font-semibold">
                    {latestApproval.title}
                  </h2>
                  {latestApproval.approved_at && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Approved on {new Date(latestApproval.approved_at).toLocaleDateString()}
                    </p>
                  )}
                  {latestApproval.feedback && (
                    <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
                      {latestApproval.feedback}
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border bg-[#fafafa] p-6">
                  <Badge className="rounded-full bg-amber-500 text-white">
                    {formatStatus(project.status)}
                  </Badge>
                  <h2 className="mt-4 text-2xl font-semibold">
                    {project.name} is ready for client approval.
                  </h2>
                  <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
                    Send this approval request to the client portal. Once approved,
                    the project can move to development without more back-and-forth.
                  </p>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Button className="rounded-full">Send approval request</Button>
                    <Link href={`/portal/${project.portal_token}`}>
                      <Button variant="outline" className="rounded-full bg-white">
                        Preview client portal
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  )
}
