import Link from "next/link"
import {
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CreditCard,
  Files,
  FolderKanban,
  Mail,
  Palette,
  Settings,
  ShieldAlert,
  User,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DashboardPageHeader,
  DashboardPanel,
  DetailItem,
  MetricCard,
} from "@/components/dashboard/dashboard-ui"
import { createClient } from "@/lib/supabase/server"
import {
  ensureAgencyForCurrentUser,
  getDashboardStats,
  type Agency,
} from "@/lib/actions/workspace"
import {
  getBillingOverview,
  getStorageUsageLabel,
  getUsageLabel,
  type BillingOverview,
} from "@/lib/actions/billing"
import { WaitlistDialog } from "@/components/billing/waitlist-dialog"

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "-"
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr))
}

function formatWebsite(website: string | null) {
  if (!website) return "-"
  return website.replace(/^https?:\/\//, "")
}

function getOwnerName(metadata: Record<string, unknown> | undefined) {
  const fullName = metadata?.full_name
  const name = metadata?.name

  if (typeof fullName === "string" && fullName.trim()) return fullName
  if (typeof name === "string" && name.trim()) return name
  return "Workspace owner"
}

function getPortalPreview(agency: Agency | null) {
  if (!agency) return "Create an agency to generate a client portal preview."
  return `${agency.name} client portal`
}

function ComingSoonBadge() {
  return (
    <Badge variant="outline" className="rounded-full bg-[#f7f7f5] text-black/55">
      Editing coming soon
    </Badge>
  )
}

function formatStatusLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function getUsagePercent(used: number, limit: number | null) {
  if (limit === null || limit <= 0) return 12
  return Math.min(100, Math.round((used / limit) * 100))
}

function getBarColor(percent: number, limit: number | null) {
  if (limit === null) return "bg-black"
  if (percent >= 100) return "bg-red-500"
  if (percent >= 80) return "bg-amber-500"
  return "bg-black"
}

function getTextColor(percent: number, limit: number | null) {
  if (limit === null) return "text-muted-foreground"
  if (percent >= 100) return "text-red-600"
  if (percent >= 80) return "text-amber-700"
  return "text-muted-foreground"
}

function PlanUsageRow({
  label,
  used,
  limit,
  usageLabel,
}: {
  label: string
  used: number
  limit: number | null
  usageLabel: string
}) {
  const percent = getUsagePercent(used, limit)
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{label}</p>
        <p className={`text-xs ${getTextColor(percent, limit)}`}>
          {usageLabel}
        </p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/[0.08]">
        <div
          className={`h-full rounded-full transition-colors ${getBarColor(percent, limit)}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

function PlanOverview({ billing }: { billing: BillingOverview | null }) {
  if (!billing) return null

  return (
    <DashboardPanel
      className="mt-8"
      title="Billing plan"
      description="Your plan, usage, and subscription details."
    >
      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-black/10 bg-[#f7f7f5] p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-black text-white">
              <CreditCard className="size-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current plan</p>
              <p className="text-2xl font-semibold tracking-tight">{billing.planName}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 text-sm">
            <DetailItem label="Subscription status" value={formatStatusLabel(billing.subscriptionStatus)} />
            <DetailItem label="Trial ends" value={formatDate(billing.trialEndsAt)} />
            <DetailItem label="Current period end" value={formatDate(billing.currentPeriodEnd)} />
          </div>
          <div className="mt-5 space-y-3">
            {billing.plan !== "agency" && billing.planInterest && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm font-medium text-amber-800">
                Interested in {billing.planInterest === "pro" ? "Pro" : "Custom"}
              </div>
            )}
            {billing.plan === "agency" ? (
              <Button className="w-full rounded-full" disabled>
                Current plan
              </Button>
            ) : (
              <WaitlistDialog planName={billing.planName} />
            )}
            <p className="text-center text-xs text-muted-foreground">
              Billing is handled manually for now.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <PlanUsageRow
            label="Clients"
            used={billing.usage.clients}
            limit={billing.limits.max_clients}
            usageLabel={getUsageLabel(billing.usage.clients, billing.limits.max_clients)}
          />
          <PlanUsageRow
            label="Projects"
            used={billing.usage.projects}
            limit={billing.limits.max_projects}
            usageLabel={getUsageLabel(billing.usage.projects, billing.limits.max_projects)}
          />
          <PlanUsageRow
            label="Team members"
            used={billing.usage.teamMembers}
            limit={billing.limits.max_team_members}
            usageLabel={getUsageLabel(billing.usage.teamMembers, billing.limits.max_team_members)}
          />
          <PlanUsageRow
            label="Storage"
            used={billing.usage.storageMb}
            limit={billing.limits.max_storage_mb}
            usageLabel={getStorageUsageLabel(billing.usage.storageMb, billing.limits.max_storage_mb)}
          />
        </div>
      </div>
    </DashboardPanel>
  )
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const agency = await ensureAgencyForCurrentUser().catch(() => null)
  const agencyId = agency?.id
  const [stats, billing] = await Promise.all([
    getDashboardStats(agencyId),
    getBillingOverview(),
  ])

  const ownerName = getOwnerName(user?.user_metadata)
  const contactEmail = agency?.contact_email ?? user?.email ?? "-"
  const portalPreview = getPortalPreview(agency)

  return (
    <>
      <DashboardPageHeader
        badge="Settings"
        title="Workspace settings"
        description="Manage the agency workspace, client portal identity, notifications, usage, and team readiness."
        actions={
          <>
            <Button asChild variant="outline" className="rounded-full bg-white">
              <Link href="/dashboard/clients">Manage clients</Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/dashboard/projects">Manage projects</Link>
            </Button>
          </>
        }
      />

      <PlanOverview billing={billing} />

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <div id="workspace" className="scroll-mt-24">
            <DashboardPanel
              title="Agency profile"
              description="Details loaded from the agency connected to your signed-in account."
              action={<ComingSoonBadge />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">Agency name</span>
                  <Input value={agency?.name ?? "-"} disabled className="bg-[#f7f7f5]" />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">Website</span>
                  <Input value={formatWebsite(agency?.website ?? null)} disabled className="bg-[#f7f7f5]" />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">Contact email</span>
                  <Input value={contactEmail} disabled className="bg-[#f7f7f5]" />
                </label>
                <DetailItem label="Created" value={formatDate(agency?.created_at)} />
              </div>
            </DashboardPanel>
          </div>

          <div id="account" className="scroll-mt-24">
            <DashboardPanel
              title="Account"
              description="Signed-in user details from Supabase Auth."
            >
              <div className="grid gap-3 md:grid-cols-2">
                <DetailItem label="Owner" value={ownerName} />
                <DetailItem label="Email" value={user?.email ?? "-"} />
                <DetailItem label="Last sign in" value={formatDate(user?.last_sign_in_at)} />
                <DetailItem label="User ID" value={user?.id ?? "-"} mono />
              </div>
            </DashboardPanel>
          </div>

          <div id="portal-branding" className="scroll-mt-24">
            <DashboardPanel
              title="Portal branding"
              description="Client-facing portal identity inferred from the current agency profile."
              action={<ComingSoonBadge />}
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="rounded-2xl border border-black/10 bg-[#f7f7f5] p-5">
                  <p className="text-sm text-muted-foreground">Portal title</p>
                  <p className="mt-2 text-2xl font-semibold">{portalPreview}</p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Client portals use project-specific links generated from your live project data.
                  </p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white p-5">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-black text-white">
                    <Palette className="size-4" />
                  </div>
                  <p className="mt-4 text-sm font-medium">Brand controls</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Logo, accent color, and portal copy controls will live here.
                  </p>
                </div>
              </div>
            </DashboardPanel>
          </div>

          <div id="notifications" className="scroll-mt-24">
            <DashboardPanel
              title="Notifications"
              description="Read-only notification preferences for this workspace."
              action={<ComingSoonBadge />}
            >
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ["Approval requests", "Enabled"],
                  ["Client feedback", "Enabled"],
                  ["File delivery", "Enabled"],
                  ["Weekly workspace digest", "Coming soon"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 rounded-xl bg-[#f4f4f2] px-4 py-3 text-sm">
                    <span className="font-medium">{label}</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </DashboardPanel>
          </div>

          <div id="team" className="scroll-mt-24">
            <DashboardPanel
              title="Team"
              description="Invite collaborators into this agency workspace."
              action={<ComingSoonBadge />}
            >
              <div className="rounded-2xl border border-dashed border-black/15 bg-[#f7f7f5] p-6 text-sm leading-6 text-muted-foreground">
                Team seats, roles, and project permissions are not editable yet. The signed-in account remains the workspace owner.
              </div>
            </DashboardPanel>
          </div>

          <div id="danger-zone" className="scroll-mt-24">
            <DashboardPanel
              title="Danger zone"
              description="Sensitive workspace controls."
              action={<ComingSoonBadge />}
            >
              <div className="flex flex-col gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-rose-800">Workspace deletion unavailable</p>
                  <p className="mt-1 text-sm text-rose-700/80">
                    Destructive workspace actions are intentionally disabled until account management is implemented.
                  </p>
                </div>
                <Button variant="destructive" disabled className="rounded-full">
                  Delete workspace
                </Button>
              </div>
            </DashboardPanel>
          </div>
        </div>

        <div className="space-y-6">
          <div id="workspace-usage" className="scroll-mt-24">
            <DashboardPanel
              title="Workspace usage"
              description="Current live counts from workspace tables."
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <MetricCard
                  label="Clients"
                  value={stats.activeClients}
                  description="Client profiles"
                  icon={Users}
                />
                <MetricCard
                  label="Projects"
                  value={stats.totalProjects}
                  description={`${stats.openProjects} open`}
                  icon={FolderKanban}
                  tone="info"
                />
                <MetricCard
                  label="Files"
                  value={stats.filesShared}
                  description="Shared deliverables"
                  icon={Files}
                  tone="muted"
                />
                <MetricCard
                  label="Waiting approvals"
                  value={stats.waitingApprovals}
                  description="Needs client action"
                  icon={BadgeCheck}
                  tone="warning"
                />
              </div>
            </DashboardPanel>
          </div>

          <DashboardPanel
            title="Workspace record"
            description="Database identifiers for this workspace."
          >
            <div className="space-y-3">
              <DetailItem label="Agency ID" value={agency?.id ?? "-"} mono />
              <DetailItem label="Owner ID" value={agency?.owner_id ?? user?.id ?? "-"} mono />
            </div>
          </DashboardPanel>

          <DashboardPanel
            title="System readiness"
            description="Current settings surfaces and data sources."
          >
            <div className="space-y-3">
              {[
                { icon: BriefcaseBusiness, label: "Agency profile", value: "Connected" },
                { icon: User, label: "Account", value: "Supabase Auth" },
                { icon: Bell, label: "Notifications", value: "Read-only" },
                { icon: Settings, label: "Portal controls", value: "Coming soon" },
                { icon: ShieldAlert, label: "Danger zone", value: "Disabled" },
                { icon: CalendarDays, label: "Usage counts", value: "Live tables" },
                { icon: Mail, label: "Contact email", value: "agency or user" },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3 rounded-xl bg-[#f4f4f2] px-4 py-3 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2 font-medium">
                      <Icon className="size-4 shrink-0 text-black/45" />
                      <span className="truncate">{item.label}</span>
                    </span>
                    <span className="shrink-0 text-muted-foreground">{item.value}</span>
                  </div>
                )
              })}
            </div>
          </DashboardPanel>
        </div>
      </div>
    </>
  )
}
