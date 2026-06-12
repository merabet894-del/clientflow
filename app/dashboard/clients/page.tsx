import Link from "next/link"
import { ArrowUpRight, CircleAlert, Search, UserCheck, UserPlus, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DashboardPageHeader,
  DashboardPanel,
  EmptyState,
  MetricCard,
} from "@/components/dashboard/dashboard-ui"
import { ensureAgencyForCurrentUser } from "@/lib/actions/workspace"
import { getClients, type Client } from "@/lib/actions/clients"
import { getProjects } from "@/lib/actions/projects"
import { AddClientDialog } from "@/components/clients/add-client-dialog"
import { getBillingOverview, getLimitMessage, getUsageLabel } from "@/lib/actions/billing"

type ClientsPageProps = {
  searchParams?: Promise<{ q?: string | string[] }>
}

function getStatusClass(status: string) {
  if (status === "completed") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (status === "needs_feedback" || status === "needs attention") return "border-blue-200 bg-blue-50 text-blue-700"
  return "border-black/15 bg-white text-black"
}

function formatStatus(status: string) {
  switch (status) {
    case "active": return "Active"
    case "needs_feedback": return "Needs feedback"
    case "needs attention": return "Needs attention"
    case "completed": return "Completed"
    default: return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "-"
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

function getQuery(params?: { q?: string | string[] }) {
  const raw = Array.isArray(params?.q) ? params?.q[0] : params?.q
  return raw?.trim() ?? ""
}

function matchesClient(client: Client, query: string) {
  const q = query.toLowerCase()
  return [client.name, client.email, client.company, client.status]
    .filter(Boolean)
    .some((value) => value!.toLowerCase().includes(q))
}

function isWaitingApproval(status: string) {
  return status === "waiting approval" || status === "waiting_approval"
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const agency = await ensureAgencyForCurrentUser().catch(() => null)
  const agencyId = agency?.id
  const [clients, projects, billing, params] = await Promise.all([
    getClients(agencyId),
    getProjects(agencyId),
    getBillingOverview(agency ?? undefined),
    searchParams,
  ])
  const query = getQuery(params)
  const visibleClients = query
    ? clients.filter((client) => matchesClient(client, query))
    : clients

  const totalClients = clients.length
  const activeClients = clients.filter((c) => c.status === "active").length
  const projectCounts = new Map<string, number>()
  const waitingCounts = new Map<string, number>()
  const lastActivity = new Map<string, string>()

  for (const project of projects) {
    if (!project.client_id) continue
    projectCounts.set(project.client_id, (projectCounts.get(project.client_id) ?? 0) + 1)
    if (isWaitingApproval(project.status)) {
      waitingCounts.set(project.client_id, (waitingCounts.get(project.client_id) ?? 0) + 1)
    }
    const previous = lastActivity.get(project.client_id)
    if (!previous || new Date(project.updated_at) > new Date(previous)) {
      lastActivity.set(project.client_id, project.updated_at)
    }
  }

  const clientsWithProjects = clients.filter((client) => (projectCounts.get(client.id) ?? 0) > 0).length
  const clientsWaiting = clients.filter((client) => (waitingCounts.get(client.id) ?? 0) > 0).length
  const clientPlanGate = billing
    ? {
        disabled: billing.reached.clients,
        message: getLimitMessage("clients", billing),
        usageLabel: getUsageLabel(billing.usage.clients, billing.limits.max_clients),
      }
    : undefined

  return (
    <>
      <DashboardPageHeader
        badge="Agency clients"
        title="Clients"
        description="A lightweight agency CRM for portal contacts, active project load, approvals, and account follow-up."
        actions={<AddClientDialog planGate={clientPlanGate} />}
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total clients"
          value={totalClients}
          description="Portal profiles"
          icon={Users}
        />
        <MetricCard
          label="Active clients"
          value={activeClients}
          description="Ready for work"
          icon={UserCheck}
          tone="success"
        />
        <MetricCard
          label="With projects"
          value={clientsWithProjects}
          description="Have delivery history"
          icon={Users}
          tone="info"
        />
        <MetricCard
          label="Waiting approvals"
          value={clientsWaiting}
          description="Clients blocking delivery"
          icon={CircleAlert}
          tone="warning"
        />
      </div>

      <DashboardPanel
        className="mt-6"
        title="Client accounts"
        description="See who each client is, what work is active, and where follow-up is needed."
        action={
          clients.length > 0 || query ? (
            <form action="/dashboard/clients" className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="q"
                  defaultValue={query}
                  placeholder="Search clients..."
                  className="h-10 w-full rounded-full bg-[#f7f7f5] pl-9 sm:w-72"
                />
              </div>
              <Button type="submit" variant="outline" className="rounded-full bg-white">
                Search
              </Button>
              {query ? (
                <Button asChild variant="ghost" className="rounded-full">
                  <Link href="/dashboard/clients">Clear</Link>
                </Button>
              ) : null}
            </form>
          ) : null
        }
      >
        {clients.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            title="No clients yet"
            description="Add your first client to create a portal workspace and connect future projects."
            action={<AddClientDialog planGate={clientPlanGate} />}
          />
        ) : visibleClients.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matching clients"
            description="Try a different name, email, company, or status."
            action={
              <Button asChild variant="outline" className="rounded-full bg-white">
                <Link href="/dashboard/clients">Clear search</Link>
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Waiting</TableHead>
                <TableHead>Last activity</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {visibleClients.map((client) => {
                const projectCount = projectCounts.get(client.id) ?? 0
                const waitingCount = waitingCounts.get(client.id) ?? 0
                return (
                  <TableRow key={client.id} className="hover:bg-[#f7f7f5]">
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="hover:underline"
                      >
                        {client.name}
                      </Link>
                    </TableCell>
                    <TableCell>{client.company ?? "-"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {client.email ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`rounded-full ${getStatusClass(client.status)}`}
                      >
                        {formatStatus(client.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{projectCount}</TableCell>
                    <TableCell>
                      <span className={waitingCount > 0 ? "font-medium text-amber-700" : "text-muted-foreground"}>
                        {waitingCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(lastActivity.get(client.id) ?? client.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" className="h-9 rounded-full bg-white text-sm">
                        <Link href={`/dashboard/clients/${client.id}`}>
                          Open
                          <ArrowUpRight className="size-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </DashboardPanel>
    </>
  )
}
