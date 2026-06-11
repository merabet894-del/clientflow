"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Copy, ExternalLink, Check } from "lucide-react"

export function SharePortalPopover({
  portalToken,
  agencyId,
  userId,
}: {
  portalToken: string
  agencyId?: string | null
  userId?: string | null
}) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState("")

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const portalUrl = `${origin}/portal/${portalToken}`
  const storageScope = agencyId ?? userId ?? null
  const storageKey = storageScope ? `clientflow_onboarding_portal_shared_${storageScope}` : null

  const markPortalShared = () => {
    if (storageKey) {
      localStorage.setItem(storageKey, "true")
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(portalUrl)
      setCopied(true)
      markPortalShared()
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = portalUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopied(true)
      markPortalShared()
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleOpenPortal = () => {
    markPortalShared()
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
              value={origin ? portalUrl : "Loading..."}
              className="min-w-0 flex-1 bg-transparent text-xs text-black/60 outline-none"
              aria-label="Portal link"
            />
            <button
              type="button"
              onClick={handleCopy}
              disabled={!origin}
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
              disabled={!origin}
            >
              <Copy className="mr-1.5 size-3.5" />
              {copied ? "Copied" : "Copy link"}
            </Button>
            <Button className="flex-1 rounded-full" onClick={handleOpenPortal} disabled={!origin}>
              <ExternalLink className="mr-1.5 size-3.5" />
              Open portal
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
