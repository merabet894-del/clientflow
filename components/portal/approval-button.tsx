"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { approvePortalProject } from "@/lib/actions/portal-actions"

export function ApprovalButton({ token }: { token: string }) {
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

  if (state?.success) {
    return (
      <div className="rounded-2xl bg-black/5 p-5 text-center">
        <p className="font-medium text-emerald-700">{state.message}</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="min-w-0">
      <h3 className="text-xl font-semibold">Ready to approve?</h3>
      <p className="mt-3 text-sm leading-6 text-white/70">
        Approving confirms that this deliverable is accepted and the
        agency can move to the next step.
      </p>

      <Button
        type="submit"
        disabled={isPending}
        variant="secondary"
        className="mt-5 w-full rounded-full"
      >
        {isPending ? "Approving..." : "Approve deliverable"}
      </Button>

      {state?.message && (
        <p className="mt-2 text-sm text-red-400">{state.message}</p>
      )}
    </form>
  )
}
