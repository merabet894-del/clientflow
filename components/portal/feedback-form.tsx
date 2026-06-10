"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { submitPortalFeedback } from "@/lib/actions/portal-actions"

export function FeedbackForm({ token, isFinal }: { token: string; isFinal?: boolean }) {
  const [state, formAction, isPending] = useActionState(
    submitPortalFeedback.bind(null, token),
    null
  )

  if (state?.success) {
    return (
      <div className="rounded-2xl border bg-black/5 p-5 text-center">
        <p className="font-medium text-emerald-700">{state.message}</p>
      </div>
    )
  }

  return (
    <form action={formAction}>
      <h2 className="text-xl font-semibold">Leave feedback</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {isFinal
          ? "Send any final notes to the agency."
          : "Tell the agency what should be changed before approval."}
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
        className="mt-4 rounded-full bg-white"
      >
        {isPending ? "Sending..." : "Send feedback"}
      </Button>
    </form>
  )
}
