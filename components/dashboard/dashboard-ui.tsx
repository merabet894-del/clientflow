import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type PageHeaderProps = {
  badge: string
  title: string
  description: string
  actions?: ReactNode
}

export function DashboardPageHeader({
  badge,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <Badge variant="outline" className="rounded-full bg-white">
          {badge}
        </Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
          {actions}
        </div>
      ) : null}
    </header>
  )
}

const toneClasses = {
  neutral: "bg-black text-white",
  info: "bg-blue-50 text-blue-700 ring-blue-100",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  warning: "bg-amber-50 text-amber-700 ring-amber-100",
  muted: "bg-[#f4f4f2] text-black/60 ring-black/[0.06]",
}

type MetricCardProps = {
  label: string
  value: ReactNode
  description?: string
  icon: LucideIcon
  tone?: keyof typeof toneClasses
}

export function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  tone = "neutral",
}: MetricCardProps) {
  return (
    <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              {value}
            </p>
            {description ? (
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl ring-1",
              toneClasses[tone]
            )}
          >
            <Icon className="size-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

type DashboardPanelProps = {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function DashboardPanel({
  title,
  description,
  action,
  children,
  className,
}: DashboardPanelProps) {
  return (
    <Card className={cn("rounded-2xl border-black/15 bg-white shadow-sm", className)}>
      <CardContent className="p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  compact?: boolean
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div className={cn("text-center", compact ? "py-8" : "py-14")}>
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-black/[0.04] text-black/35 ring-1 ring-black/[0.05]">
        <Icon className="size-5" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-5 inline-flex">{action}</div> : null}
    </div>
  )
}

type DetailItemProps = {
  label: string
  value: ReactNode
  mono?: boolean
}

export function DetailItem({ label, value, mono = false }: DetailItemProps) {
  return (
    <div className="rounded-xl bg-[#f4f4f2] px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 min-h-5 break-words text-sm font-medium",
          mono && "break-all font-mono text-xs"
        )}
      >
        {value}
      </p>
    </div>
  )
}
