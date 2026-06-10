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
import { getDashboardOverview } from "@/lib/actions/workspace"

function formatStatus(status: string) {
  switch (status) {
    case "active": return "In progress"
    case "waiting approval": return "Waiting approval"
    case "client feedback": return "Client feedback"
    case "completed": return "Completed"
    default: return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

function getStatusClass(status: string) {
  if (status === "completed") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (status === "waiting approval") return "border-amber-200 bg-amber-50 text-amber-700"
  if (status === "client feedback") return "border-blue-200 bg-blue-50 text-blue-700"
  return "border-black/10 bg-white text-black"
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

export default async function DashboardPage() {
  const overview = await getDashboardOverview()
  const { stats, recentProjects, recentActivity } = overview

  return (
    <>
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge variant="outline" className="rounded-full bg-white">
            Agency workspace
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track clients, projects, approvals, and recent portal activity.
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard/clients">
            <Button variant="outline" className="rounded-full bg-white">
              Invite client
            </Button>
          </Link>
          <Link href="/dashboard/projects">
            <Button className="rounded-full">New project</Button>
          </Link>
        </div>
      </header>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-black/10 bg-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Active clients</p>
            <p className="mt-3 text-3xl font-semibold">{stats.activeClients}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-black/10 bg-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Open projects</p>
            <p className="mt-3 text-3xl font-semibold">{stats.openProjects}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-black/10 bg-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Waiting approvals</p>
            <p className="mt-3 text-3xl font-semibold">{stats.waitingApprovals}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-black/10 bg-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Files shared</p>
            <p className="mt-3 text-3xl font-semibold">{stats.filesShared}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="rounded-2xl border-black/10 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Recent projects</h2>
                <p className="text-sm text-muted-foreground">
                  Projects that need attention.
                </p>
              </div>
              <Link href="/dashboard/projects">
                <Button variant="outline" className="rounded-full bg-white">
                  View all
                </Button>
              </Link>
            </div>

            {recentProjects.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  No projects yet. Create your first project to start tracking client work.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentProjects.map((project) => (
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
                        {project.clients?.name ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`rounded-full ${getStatusClass(project.status)}`}
                        >
                          {formatStatus(project.status)}
                        </Badge>
                      </TableCell>
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

        <Card className="rounded-2xl border-black/10 bg-white shadow-sm">
          <CardContent className="p-5">
            <h2 className="text-xl font-semibold">Recent activity</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Latest client portal updates.
            </p>

            {recentActivity.length === 0 ? (
              <div className="mt-5 py-8 text-center">
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {recentActivity.map((item) => (
                  <div key={item.id} className="rounded-xl bg-[#f4f4f2] p-4 text-sm">
                    {item.text}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
