"use client"

export type NotificationTone = "success" | "error" | "info" | "warning"
export type NotificationSource = "admin" | "client" | "system"
export type NotificationType =
  | "feedback"
  | "approval"
  | "changes_requested"
  | "portal_view"
  | "file_view"
  | "file"
  | "portal"
  | "system"

export type DashboardNotificationPayload = {
  id?: string
  title: string
  description?: string
  tone?: NotificationTone
  source?: NotificationSource
  type?: NotificationType
  entityId?: string
  projectId?: string
  clientId?: string
  targetHref?: string
  important?: boolean
  href?: string
  label?: string
  count?: number
  createdAt?: string
}

export const DASHBOARD_NOTIFICATION_EVENT = "clientflow:dashboard-notification"

export function notifyDashboard(payload: DashboardNotificationPayload) {
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent<DashboardNotificationPayload>(DASHBOARD_NOTIFICATION_EVENT, {
      detail: payload,
    })
  )
}
