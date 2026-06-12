import { CalendarDays, Clock3, FileText, FileUp, Link2, Tags } from "lucide-react"

import { Badge } from "@/components/ui/badge"
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
import { getFiles } from "@/lib/actions/files"
import { getProjects } from "@/lib/actions/projects"
import { getClients } from "@/lib/actions/clients"
import { getApprovals } from "@/lib/actions/approvals"
import { UploadFileDialog } from "@/components/files/upload-file-dialog"
import { FileActionButton } from "@/components/files/file-action-button"
import { getBillingOverview, getStorageUsageLabel } from "@/lib/actions/billing"

function getTypeBadge(type: string | null) {
  if (type === "Image") return "border-sky-200 bg-sky-50 text-sky-700"
  if (type === "Archive") return "border-purple-200 bg-purple-50 text-purple-700"
  if (type === "PDF") return "border-rose-200 bg-rose-50 text-rose-700"
  if (type === "Design") return "border-violet-200 bg-violet-50 text-violet-700"
  if (type === "Document") return "border-orange-200 bg-orange-50 text-orange-700"
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

function formatApprovalStatus(status?: string) {
  if (status === "approved") return "Approved"
  if (status === "pending") return "Waiting approval"
  if (status === "client feedback" || status === "needs changes") return "Needs changes"
  return "Not requested"
}

function getApprovalStatusClass(status?: string) {
  if (status === "approved") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (status === "pending") return "border-amber-200 bg-amber-50 text-amber-700"
  if (status === "client feedback" || status === "needs changes") return "border-blue-200 bg-blue-50 text-blue-700"
  return "border-black/15 bg-white text-black/60"
}

export default async function FilesPage() {
  const agency = await ensureAgencyForCurrentUser().catch(() => null)
  const agencyId = agency?.id
  const [files, projects, clients, approvals, billing] = await Promise.all([
    getFiles(agencyId),
    getProjects(agencyId),
    getClients(agencyId),
    getApprovals(agencyId),
    getBillingOverview(agency),
  ])

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const sharedThisMonth = files.filter(
    (f) => new Date(f.created_at) >= monthStart
  ).length
  const linkedFiles = files.filter((f) => f.project_id || f.client_id).length

  const typeCounts: Record<string, number> = {}
  for (const f of files) {
    const t = f.type ?? "Other"
    typeCounts[t] = (typeCounts[t] || 0) + 1
  }
  const sortedCategories = Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)

  const recentUploads = files.slice(0, 5)
  const approvalByProject = new Map<string, string>()
  for (const approval of approvals) {
    if (!approvalByProject.has(approval.project_id)) {
      approvalByProject.set(approval.project_id, approval.status)
    }
  }
  const storagePlanGate = billing
    ? {
        disabled: billing.reached.storage,
        message: `${billing.planName} storage is full. Upgrade to upload more deliverables.`,
        usageLabel: getStorageUsageLabel(billing.usage.storageMb, billing.limits.max_storage_mb),
      }
    : undefined

  return (
    <>
      <DashboardPageHeader
        badge="Deliverables"
        title="Files"
        description="A deliverables library for uploaded work, linked projects, clients, and approval status."
        actions={<UploadFileDialog projects={projects} clients={clients} planGate={storagePlanGate} />}
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total files"
          value={files.length}
          description="Deliverables uploaded"
          icon={FileText}
        />
        <MetricCard
          label="Shared this month"
          value={sharedThisMonth}
          description="New uploads"
          icon={CalendarDays}
          tone="info"
        />
        <MetricCard
          label="Linked files"
          value={linkedFiles}
          description="Attached to clients or projects"
          icon={Link2}
          tone="success"
        />
        <MetricCard
          label="File types"
          value={sortedCategories.length}
          description="Categories in use"
          icon={Tags}
          tone="muted"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <DashboardPanel
          title="Deliverables library"
          description="Every uploaded file with its project, client, and review state."
        >
          {files.length === 0 ? (
            <EmptyState
              icon={FileUp}
              title="No files shared yet"
              description="Upload a deliverable and link it to a project before requesting approval."
              action={<UploadFileDialog projects={projects} clients={clients} planGate={storagePlanGate} />}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Approval status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {files.map((file) => {
                  const approvalStatus = file.project_id ? approvalByProject.get(file.project_id) : undefined
                  return (
                    <TableRow key={file.id} className="hover:bg-[#f7f7f5]">
                      <TableCell className="font-medium">{file.name}</TableCell>
                      <TableCell>{file.clients?.name ?? "Unassigned"}</TableCell>
                      <TableCell>{file.projects?.name ?? "Unassigned"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`rounded-full ${getTypeBadge(file.type)}`}
                        >
                          {file.type ?? "Other"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{file.size ?? "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`rounded-full ${getApprovalStatusClass(approvalStatus)}`}
                        >
                          {formatApprovalStatus(approvalStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(file.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <FileActionButton fileId={file.id} storagePath={file.url} />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </DashboardPanel>

        <div className="space-y-6">
          <DashboardPanel
            title="File categories"
            description="Files grouped by type."
          >
            {sortedCategories.length === 0 ? (
              <EmptyState
                compact
                icon={Tags}
                title="No categories yet"
                description="File types will appear after uploads."
              />
            ) : (
              <div className="space-y-3">
                {sortedCategories.map(([label, count]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-xl bg-[#f4f4f2] px-4 py-3"
                  >
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </DashboardPanel>

          <DashboardPanel
            title="Recent uploads"
            description="Latest files added to the workspace."
          >
            {recentUploads.length === 0 ? (
              <EmptyState
                compact
                icon={Clock3}
                title="No uploads yet"
                description="Recent file activity will appear here."
              />
            ) : (
              <div className="space-y-3">
                {recentUploads.map((file) => (
                  <div key={file.id} className="rounded-xl bg-[#f4f4f2] p-4 text-sm leading-6">
                    {file.name} uploaded {formatDate(file.created_at)}
                  </div>
                ))}
              </div>
            )}
          </DashboardPanel>
        </div>
      </div>
    </>
  )
}
