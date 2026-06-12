"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Copy, ExternalLink, Check } from "lucide-react"
import { markPortalShared } from "@/lib/actions/portal-share"

export function SharePortalPopover({
  portalToken,
  projectId,
}: {
  portalToken: string
  projectId: string
}) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
  const portalUrl = `${appUrl}/portal/${portalToken}`

  const notifyShared = async () => {
    if (shared) return
    setShared(true)
    await markPortalShared(projectId)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(portalUrl)
      setCopied(true)
      await notifyShared()
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = portalUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopied(true)
      await notifyShared()
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleOpenPortal = async () => {
    await notifyShared()
    window.open(portalUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="rounded-full bg-white">
          Share portal
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[400px] max-w-[calc(100vw-2rem)] p-5"
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold">Share client portal</h3>
            <p className="mt-1 text-xs text-black/50">
              Send this private link to your client.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-[#f7f7f5] px-3 py-2">
            <input
              readOnly
              value={portalUrl}
              className="min-w-0 flex-1 bg-transparent text-xs text-black/60 outline-none"
              aria-label="Portal link"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-black/50 transition-colors hover:bg-black/5 hover:text-black"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1 rounded-full bg-white"
              onClick={handleCopy}
            >
              <Copy className="mr-1.5 size-3.5" />
              {copied ? "Copied" : "Copy link"}
            </Button>
            <Button className="flex-1 rounded-full" onClick={handleOpenPortal}>
              <ExternalLink className="mr-1.5 size-3.5" />
              Open portal
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
