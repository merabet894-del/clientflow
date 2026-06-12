"use client"

import { SharePortalPopover } from "@/components/dashboard/share-portal-popover"

export function SharePortalButton({
  portalToken,
  projectId,
}: {
  portalToken: string
  projectId: string
}) {
  return <SharePortalPopover portalToken={portalToken} projectId={projectId} />
}
