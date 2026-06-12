"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { requestApproval } from "@/lib/actions/request-approval-action"

export function RequestApprovalButton({
  projectId,
  fileCount,
  status,
}: {
  projectId: string
  fileCount: number
  status: string
  portalToken?: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const isCompleted = status === "completed" || status === "approved"

  const handleClick = async () => {
    if (fileCount === 0 || isCompleted) return
    setLoading(true)
    setError("")
    setMessage("")
    setSuccess(false)
    const result = await requestApproval(projectId)
    if (result.success) {
      const successMessage = result.message ?? "Approval request sent. The client can now review it in the portal."
      setSuccess(true)
      setMessage(successMessage)
      setTimeout(() => router.refresh(), 500)
    } else {
      const errorMessage = result.error ?? "Something went wrong"
      setError(errorMessage)
    }
    setLoading(false)
  }

  if (isCompleted) {
    return null
  }

  return (
    <div className="flex flex-col items-start gap-2 md:items-end">
      <Button
        className="rounded-full"
        disabled={loading || success || fileCount === 0}
        onClick={handleClick}
        title={fileCount === 0 ? "Upload a file before requesting approval." : undefined}
      >
        {loading ? "Sending..." : success ? "Approval requested" : "Request approval"}
      </Button>
      {fileCount === 0 && (
        <p className="max-w-56 text-xs text-muted-foreground">
          Upload a file before requesting approval.
        </p>
      )}
      {error && (
        <div className="max-w-72 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      {success && (
        <div className="max-w-72 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}
    </div>
  )
}

function formatStatus(status: string) {
  switch (status) {
    case "active": return "In progress"
    case "waiting approval":
    case "waiting_approval": return "Waiting approval"
    case "client feedback":
    case "needs changes":
    case "needs_changes": return "Needs changes"
    case "completed":
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

function isPendingApproval(status: string) {
  return status === "pending" || status === "waiting approval" || status === "waiting_approval"
}

export function ApprovalTabContent({
  status,
  approvals,
  latestApproval,
}: {
  projectId?: string
  projectName?: string
  fileCount?: number
  status: string
  portalToken?: string
  latestApproval?: { status: string; title: string; approved_at: string | null; feedback: string | null } | null
  approvals?: {
    id: string
    status: string
    title: string
    approved_at: string | null
    feedback: string | null
    created_at: string
  }[]
}) {
  const isCompleted = status === "completed" || status === "approved"
  const approvalRecords = approvals ?? (latestApproval ? [{
    id: "latest",
    status: latestApproval.status,
    title: latestApproval.title,
    approved_at: latestApproval.approved_at,
    feedback: latestApproval.feedback,
    created_at: latestApproval.approved_at ?? new Date(0).toISOString(),
  }] : [])
  const approvedApproval = approvalRecords.find((approval) => approval.status === "approved")
  const pendingApproval = approvalRecords.find((approval) => isPendingApproval(approval.status))

  if (approvedApproval) {
    return (
      <div className="rounded-2xl border bg-[#fafafa] p-6">
        <Badge className="rounded-full bg-emerald-500 text-white">
          Approved
        </Badge>
        <h2 className="mt-4 text-2xl font-semibold">
          {approvedApproval.title}
        </h2>
        {approvedApproval.approved_at && (
          <p className="mt-2 text-sm text-muted-foreground">
            Approved on {new Date(approvedApproval.approved_at).toLocaleDateString()}
          </p>
        )}
        {approvedApproval.feedback && (
          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
            {approvedApproval.feedback}
          </p>
        )}
        {approvalRecords.length > 1 && (
          <div className="mt-6 space-y-3 border-t pt-4">
            <h3 className="text-sm font-medium text-muted-foreground">Approval history</h3>
            {approvalRecords.map((approval) => (
              <div key={approval.id} className="flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-3 text-sm">
                <span>{approval.title}</span>
                <span className="text-muted-foreground">
                  {approval.status === "approved" && approval.approved_at
                    ? `Approved ${new Date(approval.approved_at).toLocaleDateString()}`
                    : isPendingApproval(approval.status)
                    ? "Waiting for client"
                    : formatStatus(approval.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (pendingApproval) {
    return (
      <div className="rounded-2xl border bg-[#fafafa] p-6">
        <Badge className="rounded-full bg-amber-500 text-white">
          Waiting approval
        </Badge>
        <h2 className="mt-4 text-2xl font-semibold">
          {pendingApproval.title}
        </h2>
        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
          This approval request has been sent to the client. Waiting for their response in the portal.
        </p>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="rounded-2xl border bg-[#fafafa] p-6">
        <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700">
          Completed
        </Badge>
        <h2 className="mt-4 text-2xl font-semibold">
          No approval request yet.
        </h2>
        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
          This project is completed, but no approval record is available.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-[#fafafa] p-6">
      <Badge variant="outline" className={`rounded-full ${getStatusClass(status)}`}>
        {formatStatus(status)}
      </Badge>
      <h2 className="mt-4 text-2xl font-semibold">
        No approval request yet.
      </h2>
      <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
        Request approval from the project header when the deliverable is ready for client review.
      </p>
    </div>
  )
}
