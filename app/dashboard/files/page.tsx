import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getFiles } from "@/lib/actions/files"
import { getProjects } from "@/lib/actions/projects"
import { getClients } from "@/lib/actions/clients"
import { UploadFileDialog } from "@/components/files/upload-file-dialog"
import { FileActionButton } from "@/components/files/file-action-button"

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

export default async function FilesPage() {
  const [files, projects, clients] = await Promise.all([
    getFiles(),
    getProjects(),
    getClients(),
  ])

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const sharedThisMonth = files.filter(
    (f) => new Date(f.created_at) >= monthStart
  ).length

  const typeCounts: Record<string, number> = {}
  for (const f of files) {
    const t = f.type ?? "Other"
    typeCounts[t] = (typeCounts[t] || 0) + 1
  }
  const sortedCategories = Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)

  const recentUploads = files.slice(0, 5)

  return (
    <>
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge variant="outline" className="rounded-full bg-white">
            Files
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Shared files
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage files shared across clients, projects, and approval requests.
          </p>
        </div>

        <UploadFileDialog projects={projects} clients={clients} />
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <p className="text-sm text-muted-foreground">Total files</p>
            <p className="mt-3 text-2xl font-semibold sm:text-3xl">{files.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <p className="text-sm text-muted-foreground">Shared this month</p>
            <p className="mt-3 text-2xl font-semibold sm:text-3xl">{sharedThisMonth}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <p className="text-sm text-muted-foreground">Pending review</p>
            <p className="mt-3 text-2xl font-semibold sm:text-3xl">0</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <p className="text-sm text-muted-foreground">Storage used</p>
            <p className="mt-3 text-2xl font-semibold sm:text-3xl">{files.length} files</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
          <CardContent className="p-5">
            <h2 className="text-xl font-semibold">All files</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Every file shared with clients and teams.
            </p>

            {files.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-black/[0.04]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-black/30"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <h3 className="text-lg font-semibold">No files shared yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload a file to share a deliverable with your client.
                </p>
                <div className="mt-5 inline-flex">
                  <UploadFileDialog projects={projects} clients={clients} />
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.id}>
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
                      <TableCell className="text-muted-foreground">
                        {formatDate(file.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <FileActionButton fileId={file.id} storagePath={file.url} />
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
              <h2 className="text-xl font-semibold">File categories</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Files grouped by type.
              </p>

              {sortedCategories.length === 0 ? (
                <div className="mt-5 py-8 text-center">
                  <p className="text-sm text-muted-foreground">No files yet.</p>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
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
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
            <CardContent className="p-5">
              <h2 className="text-xl font-semibold">Recent uploads</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Latest files added to the workspace.
              </p>

              {recentUploads.length === 0 ? (
                <div className="mt-5 py-8 text-center">
                  <p className="text-sm text-muted-foreground">No uploads yet.</p>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {recentUploads.map((file) => (
                    <div key={file.id} className="rounded-xl bg-[#f4f4f2] p-4 text-sm leading-6">
                      {file.name} uploaded {formatDate(file.created_at)}
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
