"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { submitPortalFeedback } from "@/lib/actions/portal-actions"

export function FeedbackForm({ token }: { token: string }) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(
    submitPortalFeedback.bind(null, token),
    null
  )

  useEffect(() => {
    if (state?.success) {
      router.refresh()
    }
  }, [router, state?.success])

  if (state?.success) {
    return (
      <div className="rounded-2xl border bg-black/5 p-5 text-center">
        <p className="font-medium text-emerald-700">{state.message}</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="min-w-0">
      <h2 className="text-xl font-semibold">Request changes or leave feedback</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Tell the agency what should be changed before approval.
      </p>

      <Textarea
        name="feedback"
        placeholder="Write your feedback here..."
        className="mt-5 min-h-36 rounded-2xl bg-[#fafafa]"
      />

      {state?.message && (
        <p className="mt-2 text-sm text-red-600">{state.message}</p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        variant="outline"
        className="mt-4 w-full rounded-full bg-white sm:w-auto"
      >
        {isPending ? "Sending..." : "Send feedback"}
      </Button>
    </form>
  )
}
