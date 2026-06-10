"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { approvePortalProject } from "@/lib/actions/portal-actions"

export function StatusCardApprove({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(
    approvePortalProject.bind(null, token),
    null
  )

  return (
    <form action={formAction} className="flex-1">
      <Button
        type="submit"
        disabled={isPending || state?.success}
        className="w-full rounded-full"
      >
        {state?.success ? "Approved" : isPending ? "Approving..." : "Approve"}
      </Button>
    </form>
  )
}
