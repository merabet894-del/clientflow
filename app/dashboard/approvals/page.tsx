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
import { getApprovals, getApprovalStats } from "@/lib/actions/approvals"

function formatStatus(status: string) {
  if (status === "approved") return "Approved"
  if (status === "pending") return "Waiting approval"
  if (status === "client feedback" || status === "needs changes") return "Needs changes"
  return status
}

function getStatusClass(status: string) {
  if (status === "approved") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (status === "Feedback requested") return "border-blue-200 bg-blue-50 text-blue-700"
  if (status === "Waiting approval" || status === "pending") return "border-amber-200 bg-amber-50 text-amber-700"
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

const workflowSteps = [
  {
    step: "1",
    title: "Send request",
    description: "Share deliverables with your client for review through the portal.",
  },
  {
    step: "2",
    title: "Client reviews",
    description: "Client examines the work, leaves feedback, or asks for changes.",
  },
  {
    step: "3",
    title: "Approve or request changes",
    description: "Client approves the deliverable or requests changes with comments.",
  },
]

export default async function ApprovalsPage() {
  const [approvals, stats] = await Promise.all([
    getApprovals(),
    getApprovalStats(),
  ])

  const pendingApprovals = approvals.filter((a) => a.status === "pending")

  return (
    <>
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge variant="outline" className="rounded-full bg-white">
            Approvals
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Client approvals
          </h1>
          <p className="mt-2 text-muted-foreground">
            Approval requests are created from project pages after uploading a deliverable.
          </p>
        </div>

        <Link href="/dashboard/projects">
          <Button className="rounded-full">Request from project</Button>
        </Link>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <p className="text-sm text-muted-foreground">Waiting approval</p>
            <p className="mt-3 text-2xl font-semibold sm:text-3xl">{stats.waitingApproval}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <p className="text-sm text-muted-foreground">Approved this month</p>
            <p className="mt-3 text-2xl font-semibold sm:text-3xl">{stats.approvedThisMonth}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <p className="text-sm text-muted-foreground">Feedback requested</p>
            <p className="mt-3 text-2xl font-semibold sm:text-3xl">{stats.feedbackRequested}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <p className="text-sm text-muted-foreground">Average approval time</p>
            <p className="mt-3 text-2xl font-semibold sm:text-3xl">{stats.averageApprovalTime}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
          <CardContent className="p-5">
            <h2 className="text-xl font-semibold">All approvals</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Every deliverable sent for client approval.
            </p>

            {approvals.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-black/[0.04]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-black/30"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <h3 className="text-lg font-semibold">No approvals yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Approval requests are created from project pages after uploading a deliverable.
                </p>
                <Link href="/dashboard/projects" className="mt-5 inline-flex">
                  <Button className="rounded-full">Go to projects</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deliverable</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {approvals.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        {item.projects?.clients?.name ?? "No client"}
                      </TableCell>
                      <TableCell>
                        {item.projects?.name ?? "Unknown project"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`rounded-full ${getStatusClass(formatStatus(item.status))}`}
                        >
                          {formatStatus(item.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(item.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.projects ? (
                          <Link href={`/dashboard/projects/${item.projects.id}`}>
                            <Button variant="outline" className="h-9 rounded-full bg-white text-sm">
                              Open
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="outline" className="h-9 rounded-full bg-white text-sm" disabled>
                            Open
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
            <CardContent className="p-5">
              <h2 className="text-xl font-semibold">Approval workflow</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                How approvals work from start to finish.
              </p>

              <div className="mt-5 space-y-5">
                {workflowSteps.map((step) => (
                  <div key={step.step} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-sm font-medium text-white">
                      {step.step}
                    </div>
                    <div>
                      <p className="font-medium">{step.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
            <CardContent className="p-5">
              <h2 className="text-xl font-semibold">Needs follow-up</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Approvals that need attention.
              </p>

              {pendingApprovals.length === 0 ? (
                <div className="mt-5 py-8 text-center">
                  <p className="text-sm text-muted-foreground">No follow-ups needed.</p>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {pendingApprovals.slice(0, 5).map((item) => (
                    <div key={item.id} className="rounded-xl bg-[#f4f4f2] p-4 text-sm leading-6">
                      <span className="font-medium">{item.projects?.name ?? "A project"}</span>
                      <span className="text-muted-foreground"> - {item.title} not yet approved</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
