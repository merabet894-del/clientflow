"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { approvePortalProject } from "@/lib/actions/portal-actions"

export function StatusCardApprove({ token }: { token: string }) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(
    approvePortalProject.bind(null, token),
    null
  )

  useEffect(() => {
    if (state?.success) {
      router.refresh()
    }
  }, [router, state?.success])

  return (
    <form action={formAction} className="flex-1">
      <Button
        type="submit"
        disabled={isPending || state?.success}
        className="w-full rounded-full"
      >
        {state?.success ? "Approved" : isPending ? "Approving..." : "Approve deliverable"}
      </Button>
    </form>
  )
}
