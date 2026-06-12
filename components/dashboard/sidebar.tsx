"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  BadgeCheck,
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Files,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react"

import { ClientFlowLogo } from "@/components/brand/clientflow-logo"
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/actions/notifications"
import {
  DASHBOARD_NOTIFICATION_EVENT,
  type DashboardNotificationPayload,
} from "@/lib/notifications"

export type SidebarProfile = {
  name: string
  email: string
  agencyName: string
}

export type SidebarNotification = DashboardNotificationPayload & {
  id: string
  createdAt: string
  read?: boolean
}

export type SidebarNavBadges = Partial<Record<string, number | string | null | undefined>>

type SidebarNavGroup = {
  title: string
  items: {
    title: string
    url: string
    icon: LucideIcon
  }[]
}

const navGroups: SidebarNavGroup[] = [
  {
    title: "Workspace",
    items: [
      {
        title: "Overview",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Clients",
        url: "/dashboard/clients",
        icon: Users,
      },
      {
        title: "Projects",
        url: "/dashboard/projects",
        icon: FolderKanban,
      },
    ],
  },
  {
    title: "Delivery",
    items: [
      {
        title: "Approvals",
        url: "/dashboard/approvals",
        icon: BadgeCheck,
      },
      {
        title: "Files",
        url: "/dashboard/files",
        icon: Files,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
]

const toneDotClass = {
  success: "bg-emerald-500",
  error: "bg-rose-500",
  info: "bg-blue-500",
  warning: "bg-amber-500",
}

const notificationLabelClass = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  error: "bg-rose-50 text-rose-700 ring-rose-100",
  info: "bg-[#f4f4f2] text-black/65 ring-black/[0.06]",
  warning: "bg-amber-50 text-amber-700 ring-amber-100",
}

function isActivePath(pathname: string, url: string) {
  if (url === "/dashboard") return pathname === "/dashboard"
  return pathname === url || pathname.startsWith(`${url}/`)
}

function formatNotificationTime(createdAt: string) {
  const diff = Date.now() - new Date(createdAt).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "Now"
  if (minutes < 60) return `${minutes}m`
  return `${Math.floor(minutes / 60)}h`
}

function getNotificationKey(notification: DashboardNotificationPayload) {
  return notification.id ?? `${notification.href ?? "local"}:${notification.title}`
}

function getNotificationLabel(notification: SidebarNotification) {
  if (notification.label) return notification.label
  if (notification.count && notification.count > 0) return String(notification.count)
  return "New"
}

function shouldShowNotification(notification: DashboardNotificationPayload) {
  return notification.source === "client"
}

function getBadgeLabel(value: number | string | null | undefined) {
  if (typeof value === "number") {
    if (value <= 0) return null
    return value > 9 ? "9+" : String(value)
  }
  return value || null
}

function getNotificationHref(notification: SidebarNotification) {
  if (notification.targetHref) return notification.targetHref
  if (notification.type === "feedback" && notification.projectId) return `/dashboard/projects/${notification.projectId}?tab=feedback`
  if (notification.type === "changes_requested" && notification.projectId) return `/dashboard/projects/${notification.projectId}?tab=feedback`
  if (notification.type === "approval" && notification.projectId) return `/dashboard/projects/${notification.projectId}?tab=approvals`
  if (notification.type === "approval") return "/dashboard/approvals"
  if (notification.type === "file" && notification.projectId) return `/dashboard/projects/${notification.projectId}?tab=files`
  if (notification.type === "file") return "/dashboard/files"
  return notification.href ?? "/dashboard"
}

function isNotificationOnDestination(notification: SidebarNotification, pathname: string, tab: string | null) {
  if (notification.type === "approval" && pathname === "/dashboard/approvals") return true
  if (notification.type === "file" && pathname === "/dashboard/files") return true
  if (notification.type === "file_view" && pathname === "/dashboard/files") return true

  if (notification.projectId && pathname === `/dashboard/projects/${notification.projectId}`) {
    if (notification.type === "feedback" || notification.type === "changes_requested") return tab === "feedback"
    if (notification.type === "approval") return tab === "approvals"
    if (notification.type === "file" || notification.type === "file_view") return tab === "files"
  }

  return false
}

function getUnreadTypeCount(notifications: SidebarNotification[], types: SidebarNotification["type"][]) {
  return notifications.filter((notification) =>
    !notification.read && notification.type && types.includes(notification.type)
  ).length
}

export function AppSidebar({
  profile,
  initialNotifications = [],
  navBadges = {},
  ...props
}: React.ComponentProps<typeof SidebarPrimitive> & {
  profile?: SidebarProfile
  initialNotifications?: SidebarNotification[]
  navBadges?: SidebarNavBadges
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const profileData = profile ?? {
    name: "Administrator",
    email: "admin@clientflow.local",
    agencyName: "Workspace",
  }
  const [isHydrated, setIsHydrated] = React.useState(false)
  const [, startTransition] = React.useTransition()
  const [collapsed, setCollapsed] = React.useState(false)
  const [notifications, setNotifications] = React.useState<SidebarNotification[]>(() =>
    initialNotifications.filter(shouldShowNotification)
  )

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setCollapsed(window.localStorage.getItem("clientflow_sidebar_collapsed") === "true")
      setIsHydrated(true)
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [])

  React.useEffect(() => {
    if (!isHydrated) return
    window.localStorage.setItem("clientflow_sidebar_collapsed", String(collapsed))
  }, [collapsed, isHydrated])

  React.useEffect(() => {
    const handleNotification = (event: Event) => {
      const detail = (event as CustomEvent<DashboardNotificationPayload>).detail
      if (!detail?.title) return
      if (!shouldShowNotification(detail)) return
      const id = getNotificationKey(detail)
      setNotifications((current) => [
        {
          id,
          title: detail.title,
          description: detail.description,
          tone: detail.tone ?? "info",
          source: detail.source,
          type: detail.type,
          entityId: detail.entityId,
          projectId: detail.projectId,
          clientId: detail.clientId,
          targetHref: detail.targetHref,
          important: detail.important,
          href: detail.href,
          label: detail.label ?? "New",
          count: detail.count,
          createdAt: detail.createdAt ?? new Date().toISOString(),
          read: false,
        },
        ...current.filter((item) => item.id !== id),
      ].slice(0, 20))
    }

    window.addEventListener(DASHBOARD_NOTIFICATION_EVENT, handleNotification)
    return () => window.removeEventListener(DASHBOARD_NOTIFICATION_EVENT, handleNotification)
  }, [])

  const markNotificationsRead = React.useCallback((predicate: (notification: SidebarNotification) => boolean) => {
    const idsToMark: string[] = []
    setNotifications((current) => {
      const next = current.map((notification) => {
        if (!notification.read && predicate(notification)) {
          idsToMark.push(notification.id)
          return { ...notification, read: true }
        }
        return notification
      })
      return next
    })
    if (idsToMark.length > 0) {
      startTransition(() => {
        idsToMark.forEach((id) => {
          void markNotificationRead(id)
        })
      })
    }
  }, [])

  const markAllVisibleRead = React.useCallback(() => {
    setNotifications((current) =>
      current.map((notification) => (
        notification.read ? notification : { ...notification, read: true }
      ))
    )
    startTransition(() => {
      void markAllNotificationsRead()
    })
  }, [])

  React.useEffect(() => {
    const tab = searchParams.get("tab")
    const timeout = window.setTimeout(() => {
      markNotificationsRead((notification) => isNotificationOnDestination(notification, pathname, tab))
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [markNotificationsRead, pathname, searchParams])

  const unreadNotifications = notifications.filter((notification) => !notification.read)
  const visibleNotifications = collapsed ? unreadNotifications.slice(0, 1) : unreadNotifications
  const unreadCount = notifications.reduce((sum, item) => item.read ? sum : sum + (item.count ?? 1), 0)
  const unreadProjectCount = getUnreadTypeCount(notifications, ["feedback", "changes_requested"])
  const unreadApprovalCount = getUnreadTypeCount(notifications, ["approval"])
  const unreadFileCount = getUnreadTypeCount(notifications, ["file_view"])
  const effectiveNavBadges: SidebarNavBadges = {
    ...navBadges,
    Projects: Math.max(typeof navBadges.Projects === "number" ? navBadges.Projects : 0, unreadProjectCount),
    Approvals: Math.max(typeof navBadges.Approvals === "number" ? navBadges.Approvals : 0, unreadApprovalCount),
    Files: Math.max(typeof navBadges.Files === "number" ? navBadges.Files : 0, unreadFileCount),
  }
  return (
    <SidebarPrimitive
      {...props}
      className={cn(collapsed ? "w-20" : "w-72", props.className)}
      data-collapsed={collapsed}
    >
      <SidebarHeader className={cn(collapsed ? "items-center p-3" : "p-4")}>
        <div
          className={cn(
            "w-full rounded-2xl border border-sidebar-border bg-background p-2 shadow-sm transition-all duration-300",
            collapsed && "rounded-xl p-1"
          )}
        >
          <div className={cn("flex w-full items-center gap-2", collapsed && "flex-col justify-center gap-1")}>
            <Link
              href="/dashboard"
              className={cn(
                "flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl px-2 transition-colors hover:bg-sidebar-accent",
                collapsed && "size-11 flex-none justify-center px-0"
              )}
              title="ClientFlow workspace"
            >
              <ClientFlowLogo variant="icon" height={24} />
              {!collapsed ? (
                <div className="min-w-0 transition-opacity duration-200">
                  <p className="truncate text-sm font-semibold leading-5">ClientFlow</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {profileData.agencyName}
                  </p>
                </div>
              ) : null}
            </Link>
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              title={collapsed ? "Open sidebar" : "Close sidebar"}
              aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
            >
              {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </button>
          </div>
          {!collapsed ? (
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-[#f4f4f2] px-3 py-2 text-xs text-muted-foreground">
              <Zap className="size-3.5 text-black/50" />
              <span className="truncate">Control panel</span>
              <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-black/55 ring-1 ring-black/[0.06]">
                Live
              </span>
            </div>
          ) : null}
        </div>
      </SidebarHeader>

      <SidebarContent className={cn("overflow-hidden", collapsed ? "items-center p-2" : "p-3")}>
        {navGroups.map((group) => (
          <SidebarGroup key={group.title} className={cn(collapsed && "w-full items-center")}>
            {!collapsed ? <SidebarGroupLabel>{group.title}</SidebarGroupLabel> : null}
            <SidebarGroupContent className="w-full">
              <SidebarMenu className={cn(collapsed && "items-center")}>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active = isActivePath(pathname, item.url)
                  const badgeLabel = getBadgeLabel(effectiveNavBadges[item.title])

                  return (
                    <SidebarMenuItem key={item.title} className={cn(collapsed && "w-full")}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className={cn(
                          collapsed && "h-11 justify-center px-0",
                          active && "shadow-sm"
                        )}
                        title={collapsed ? item.title : undefined}
                      >
                        <Link href={item.url} className="relative">
                          <Icon className="size-4" />
                          {!collapsed ? (
                            <span className="truncate transition-opacity duration-200">{item.title}</span>
                          ) : null}
                          {badgeLabel ? (
                            <span
                              className={cn(
                                "ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-black px-1.5 text-[10px] font-semibold leading-none text-white",
                                collapsed && "absolute right-1 top-1 size-4 min-w-0 px-0 text-[9px]"
                              )}
                              title={typeof badgeLabel === "string" && badgeLabel === "!" ? "Workspace setup incomplete" : badgeLabel}
                              aria-label={typeof badgeLabel === "string" && badgeLabel === "!" ? "Setup incomplete" : undefined}
                            >
                              {badgeLabel}
                            </span>
                          ) : null}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <div className={cn("mt-auto w-full shrink-0", collapsed ? "px-0" : "px-1")}>
          <section
            className={cn(
              "flex flex-col rounded-2xl border border-sidebar-border bg-background/80 transition-all duration-300",
              !collapsed && "max-h-[min(520px,max(240px,calc(100vh-360px)))] overflow-hidden",
              collapsed ? "p-2" : "p-3"
            )}
            aria-label="Sidebar notifications"
          >
            <div className={cn(
              "z-10 shrink-0 bg-background/95 pb-3 backdrop-blur-sm",
              collapsed ? "flex justify-center pb-0" : "flex items-center justify-between"
            )}>
              <div className="flex items-center gap-2">
                <div className="relative flex size-8 items-center justify-center rounded-xl bg-black text-white">
                  <Bell className="size-4" />
                  {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-semibold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : null}
                </div>
                {!collapsed ? (
                  <div>
                    <p className="text-sm font-medium">Notifications</p>
                    <p className="text-xs text-muted-foreground">
                      {unreadCount} unread
                    </p>
                  </div>
                ) : null}
              </div>
              {!collapsed && unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={markAllVisibleRead}
                  className="rounded-full px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  aria-label="Mark all notifications as read"
                  title="Mark all as read"
                >
                  Mark all read
                </button>
              ) : null}
            </div>

            {!collapsed && visibleNotifications.length > 0 ? (
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pb-4 pr-1 pt-1 scroll-smooth">
                {visibleNotifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={getNotificationHref(notification)}
                    onClick={() => markNotificationsRead((item) => item.id === notification.id)}
                    className={cn(
                      "group block animate-in fade-in-0 slide-in-from-left-1 rounded-xl border px-3 py-3 text-xs text-black shadow-sm transition-all hover:bg-[#f7f7f5]",
                      "border-black/[0.10] bg-white"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-start gap-2">
                        <span
                          className={cn(
                            "mt-1 size-1.5 shrink-0 rounded-full",
                            toneDotClass[notification.tone ?? "info"]
                          )}
                        />
                        <p className="min-w-0 font-medium">{notification.title}</p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
                          notificationLabelClass[notification.tone ?? "info"]
                        )}
                      >
                        {getNotificationLabel(notification)}
                      </span>
                    </div>
                    {notification.description ? (
                      <p className="mt-1 leading-5 opacity-80">{notification.description}</p>
                    ) : null}
                    <div className="mt-2 flex items-center justify-between gap-2 opacity-80">
                      <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-1 font-medium transition-colors group-hover:bg-black/[0.04] group-hover:text-black">
                        <CheckCircle2 className="size-3" />
                        Open page
                      </span>
                      <span>{isHydrated ? formatNotificationTime(notification.createdAt) : "Recent"}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : !collapsed ? (
              <div className="rounded-xl border border-dashed border-black/[0.08] bg-[#f7f7f5] px-3 py-4 text-xs leading-5 text-muted-foreground">
                <p className="font-medium text-black/65">No new client updates.</p>
                <p className="mt-1">Client feedback, approvals, and portal activity will appear here.</p>
              </div>
            ) : null}
          </section>
        </div>
      </SidebarContent>

      <SidebarRail />
    </SidebarPrimitive>
  )
}

export { AppSidebar as Sidebar }
