"use client"

import { SharePortalPopover } from "@/components/dashboard/share-portal-popover"

export function SharePortalButton({
  portalToken,
  agencyId,
  userId,
}: {
  portalToken: string
  agencyId?: string | null
  userId?: string | null
}) {
  return <SharePortalPopover portalToken={portalToken} agencyId={agencyId} userId={userId} />
}
