import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getClientById } from "@/lib/actions/clients"
import { getProjectsByClientId, getCommentsByProjectId, getApprovalsByProjectId } from "@/lib/actions/projects"
import { getProjectFiles } from "@/lib/actions/files"
import { notFound } from "next/navigation"

function getStatusClass(status: string) {
  if (status === "Waiting approval") return "border-amber-200 bg-amber-50 text-amber-700"
  if (status === "Client feedback") return "border-blue-200 bg-blue-50 text-blue-700"
  return "border-black/15 bg-white text-black"
}

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
  if (status === "completed") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (status === "waiting approval") return "border-amber-200 bg-amber-50 text-amber-700"
  if (status === "client feedback") return "border-blue-200 bg-blue-50 text-blue-700"
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

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const client = await getClientById(id)

  if (!client) {
    notFound()
  }

  const projects = await getProjectsByClientId(id)

  const activeProjects = projects.filter((p) => p.status !== "completed").length
  const waitingApprovals = projects.filter((p) => p.status === "waiting approval").length

  let totalFiles = 0
  const activityItems: { id: string; text: string; date: string }[] = []

  for (const project of projects) {
    const [comments, approvals, projectFiles] = await Promise.all([
      getCommentsByProjectId(project.id),
      getApprovalsByProjectId(project.id),
      getProjectFiles(project.id),
    ])

    totalFiles += projectFiles.length

    for (const comment of comments) {
      activityItems.push({
        id: comment.id,
        text: `${comment.author_name ?? comment.author_type} left feedback on ${project.name}`,
        date: comment.created_at,
      })
    }

    for (const approval of approvals) {
      activityItems.push({
        id: approval.id,
        text: approval.approved_at
          ? `${approval.title} was approved on ${project.name}`
          : `${approval.title} is waiting approval on ${project.name}`,
        date: approval.approved_at ?? approval.created_at,
      })
    }

    for (const file of projectFiles) {
      activityItems.push({
        id: file.id,
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
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge variant="outline" className="rounded-full bg-white">
            Client profile
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            {client.name}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage client information, active projects, portal access, and recent activity.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="rounded-full bg-white">
            Send invite
          </Button>
          <Link href="/dashboard/projects">
            <Button className="rounded-full">New project</Button>
          </Link>
        </div>
      </header>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Active projects</p>
            <p className="mt-3 text-3xl font-semibold">{activeProjects}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Waiting approvals</p>
            <p className="mt-3 text-3xl font-semibold">{waitingApprovals}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Shared files</p>
            <p className="mt-3 text-3xl font-semibold">{totalFiles}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Last activity</p>
            <p className="mt-3 text-3xl font-semibold">
              {lastActivity ? formatDate(lastActivity) : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Client projects</h2>
                <p className="text-sm text-muted-foreground">
                  Projects linked to this client.
                </p>
              </div>
              <Link href="/dashboard/projects">
                <Button variant="outline" className="rounded-full bg-white">
                  View all
                </Button>
              </Link>
            </div>

            {projects.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  No projects yet. Create a project for this client to get started.
                </p>
              </div>
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
                  {projects.map((project) => (
                    <TableRow key={project.id}>
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
                      <TableCell>{project.progress}%</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDate(project.updated_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
            <CardContent className="p-5">
              <h2 className="text-xl font-semibold">Client info</h2>

              <div className="mt-5 space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Contact</p>
                  <p className="mt-1 font-medium">{client.name}</p>
                </div>

                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="mt-1 font-medium">
                    {client.email ?? "—"}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">Company</p>
                  <p className="mt-1 font-medium">
                    {client.company ?? "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
            <CardContent className="p-5">
              <h2 className="text-xl font-semibold">Portal access</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Share the client portal so {client.name} can review progress,
                files, feedback, and approvals.
              </p>

              <Button className="mt-5 w-full rounded-full">
                Copy portal link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-6 rounded-2xl border-black/15 bg-white shadow-sm">
        <CardContent className="p-5">
          <h2 className="text-xl font-semibold">Recent activity</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Latest updates from this client workspace.
          </p>

          {recentActivity.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No activity yet. Create a project and share the portal to get started.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {recentActivity.map((item) => (
                <div key={item.id} className="rounded-2xl bg-[#f4f4f2] p-4 text-sm">
                  {item.text}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
