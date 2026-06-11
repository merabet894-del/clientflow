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
import { getClients } from "@/lib/actions/clients"
import { AddClientDialog } from "@/components/clients/add-client-dialog"
import Link from "next/link"

function getStatusClass(status: string) {
  if (status === "completed") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (status === "needs_feedback") return "border-blue-200 bg-blue-50 text-blue-700"
  return "border-black/15 bg-white text-black"
}

function formatStatus(status: string) {
  switch (status) {
    case "active": return "Active"
    case "needs_feedback": return "Needs feedback"
    case "completed": return "Completed"
    default: return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

export default async function ClientsPage() {
  const clients = await getClients()

  const totalClients = clients.length
  const activeClients = clients.filter((c) => c.status === "active").length
  const needAttention = clients.filter(
    (c) => c.status === "needs_feedback" || c.status === "needs attention"
  ).length

  return (
    <>
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge variant="outline" className="rounded-full bg-white">
            Clients
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Client workspace
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage client profiles, active projects, portal access, and recent activity.
          </p>
        </div>

        <AddClientDialog />
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <p className="text-sm text-muted-foreground">Total clients</p>
            <p className="mt-3 text-2xl font-semibold sm:text-3xl">{totalClients}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <p className="text-sm text-muted-foreground">Active clients</p>
            <p className="mt-3 text-2xl font-semibold sm:text-3xl">{activeClients}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <p className="text-sm text-muted-foreground">Need attention</p>
            <p className="mt-3 text-2xl font-semibold sm:text-3xl">{needAttention}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 rounded-2xl border-black/15 bg-white shadow-sm">
        <CardContent className="p-5">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">All clients</h2>
              <p className="text-sm text-muted-foreground">
                Keep every client and their project activity in one place.
              </p>
            </div>

            <Input
              placeholder="Search clients..."
              className="h-10 w-full rounded-full bg-[#f7f7f5] md:w-72"
            />
          </div>

          {clients.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-black/[0.04]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-black/30"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3 className="text-lg font-semibold">No clients yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your first client to create a portal workspace.
              </p>
              <div className="mt-5 inline-flex">
                <AddClientDialog />
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Created</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="hover:underline"
                      >
                        {client.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {client.email ?? "-"}
                    </TableCell>
                    <TableCell>{client.company ?? "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`rounded-full ${getStatusClass(client.status)}`}
                      >
                        {formatStatus(client.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {new Date(client.created_at).toLocaleDateString()}
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
