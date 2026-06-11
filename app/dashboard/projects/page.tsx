import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getProjects } from "@/lib/actions/projects"
import { getClients } from "@/lib/actions/clients"
import { AddProjectDialog } from "@/components/projects/add-project-dialog"
import Link from "next/link"

function getStatusClass(status: string) {
  if (status === "completed") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (status === "waiting approval") return "border-amber-200 bg-amber-50 text-amber-700"
  if (status === "client feedback") return "border-blue-200 bg-blue-50 text-blue-700"
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

export default async function ProjectsPage() {
  const [projects, clients] = await Promise.all([getProjects(), getClients()])

  const totalProjects = projects.length
  const waitingApproval = projects.filter((p) => p.status === "waiting approval").length
  const completed = projects.filter((p) => p.status === "completed").length

  return (
    <>
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge variant="outline" className="rounded-full bg-white">
            Projects
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Client projects
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage project status, approvals, feedback, and progress from one place.
          </p>
        </div>

        <AddProjectDialog clients={clients} />
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <p className="text-sm text-muted-foreground">Total projects</p>
            <p className="mt-3 text-2xl font-semibold sm:text-3xl">{totalProjects}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <p className="text-sm text-muted-foreground">Waiting approval</p>
            <p className="mt-3 text-2xl font-semibold sm:text-3xl">{waitingApproval}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="mt-3 text-2xl font-semibold sm:text-3xl">{completed}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 rounded-2xl border-black/15 bg-white shadow-sm">
        <CardContent className="p-5">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">All projects</h2>
              <p className="text-sm text-muted-foreground">
                Track every client project and its current status.
              </p>
            </div>

            <Input
              placeholder="Search projects..."
              className="h-10 w-full rounded-full bg-[#f7f7f5] md:w-72"
            />
          </div>

          {projects.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-black/[0.04]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-black/30"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 3v18"/></svg>
              </div>
              <h3 className="text-lg font-semibold">No projects yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first project and invite a client to review it.
              </p>
              <div className="mt-5 inline-flex">
                <AddProjectDialog clients={clients} />
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Updated</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {projects.map((project) => (
                  <TableRow
                    key={project.id}
                    className="hover:bg-[#f7f7f5]"
                  >
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="hover:underline"
                      >
                        {project.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {project.clients?.name ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`rounded-full ${getStatusClass(project.status)}`}
                      >
                        {formatStatus(project.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{project.progress}%</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDate(project.updated_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/projects/${project.id}`}>
                        <Button
                          variant="outline"
                          className="h-9 rounded-full bg-white text-sm"
                        >
                          Open
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
