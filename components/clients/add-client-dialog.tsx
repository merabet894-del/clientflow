"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/actions/create-client"

export function AddClientDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full">Add client</Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add client</DialogTitle>
        </DialogHeader>
        <form
          ref={formRef}
          onSubmit={async (e) => {
            e.preventDefault()
            setLoading(true)
            setError("")

            const result = await createClient(new FormData(e.currentTarget))

            if (result?.success) {
              formRef.current?.reset()
              setOpen(false)
              router.refresh()
            } else {
              setError(result?.error ?? "Something went wrong")
              setLoading(false)
            }
          }}
          className="space-y-4"
        >
          {error && (
            <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Client name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Agency client"
              required
              className="rounded-xl bg-[#f7f7f5]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="client@company.com"
              className="rounded-xl bg-[#f7f7f5]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              placeholder="Design studio"
              className="rounded-xl bg-[#f7f7f5]"
            />
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={loading}>
            {loading ? "Adding..." : "Add client"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
