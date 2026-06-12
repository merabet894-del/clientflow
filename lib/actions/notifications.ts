"use server"

import { revalidatePath } from "next/cache"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export type ClientNotificationType =
  | "feedback"
  | "approval"
  | "changes_requested"
  | "portal_view"
  | "file_view"

type CreateClientNotificationInput = {
  agencyId: string
  projectId?: string | null
  clientId?: string | null
  type: ClientNotificationType
  title: string
  message: string
  targetHref: string
}

export async function createClientNotification(input: CreateClientNotificationInput) {
  const admin = createAdminClient()
  const { error } = await admin.from("notifications").insert({
    agency_id: input.agencyId,
    project_id: input.projectId ?? null,
    client_id: input.clientId ?? null,
    type: input.type,
    title: input.title,
    message: input.message,
    target_href: input.targetHref,
  })

  if (error) {
    console.error("Failed to create notification", error)
  }
}

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("is_read", false)

  if (error) {
    return { success: false, message: "Could not mark notification as read." }
  }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function markAllNotificationsRead() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Not authenticated." }
  }

  const { data: agencies, error: agencyError } = await supabase
    .from("agencies")
    .select("id")
    .eq("owner_id", user.id)

  if (agencyError) {
    return { success: false, message: "Could not find agency." }
  }

  const agencyIds = (agencies ?? []).map((agency) => agency.id)
  if (agencyIds.length === 0) return { success: true }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .in("agency_id", agencyIds)
    .eq("is_read", false)

  if (error) {
    return { success: false, message: "Could not mark notifications as read." }
  }

  revalidatePath("/dashboard")
  return { success: true }
}
