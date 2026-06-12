import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import {
  formatLimit,
  formatPlanName,
  formatStorageLimit,
  formatStorageUsage,
  isAtLimit,
  normalizePlan,
  normalizeSubscriptionStatus,
  parseFileSizeToMb,
  resolvePlanLimits,
  type BillingPlan,
  type PlanLimits,
  type SubscriptionStatus,
} from "@/lib/billing"
import { ensureAgencyForCurrentUser } from "./workspace"
import type { Agency } from "./workspace"

export type BillingOverview = {
  plan: BillingPlan
  planName: string
  planInterest: string | null
  subscriptionStatus: SubscriptionStatus
  trialEndsAt: string | null
  currentPeriodEnd: string | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  limits: PlanLimits
  usage: {
    clients: number
    projects: number
    teamMembers: number
    storageMb: number
  }
  reached: {
    clients: boolean
    projects: boolean
    teamMembers: boolean
    storage: boolean
  }
}

export function getLimitMessage(resource: "clients" | "projects", overview: BillingOverview) {
  const limit = resource === "clients" ? overview.limits.max_clients : overview.limits.max_projects
  const label = resource === "clients" ? "clients" : "projects"
  return `${overview.planName} includes ${formatLimit(limit)} ${label}. Upgrade to add more.`
}

export function getUsageLabel(used: number, limit: number | null, suffix = "") {
  const value = suffix ? `${used}${suffix}` : String(used)
  return limit === null ? `${value}` : `${value} of ${limit}${suffix}`
}

export function getStorageUsageLabel(usedMb: number, limitMb: number | null) {
  return `${formatStorageUsage(usedMb)} of ${formatStorageLimit(limitMb)}`
}

export async function getBillingOverview(agency?: Agency | null): Promise<BillingOverview | null> {
  if (!agency) {
    agency = await ensureAgencyForCurrentUser().catch(() => null)
  }
  if (!agency) return null

  const supabase = await createSupabaseClient()
  const [{ count: clientsCount }, { count: projectsCount }, filesResult] = await Promise.all([
    supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("agency_id", agency.id),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("agency_id", agency.id),
    supabase
      .from("files")
      .select("size")
      .eq("agency_id", agency.id),
  ])

  const plan = normalizePlan(agency.plan)
  const limits = resolvePlanLimits(agency)
  const storageMb = (filesResult.data ?? []).reduce(
    (sum, file) => sum + parseFileSizeToMb((file as { size?: string | null }).size),
    0
  )
  const usage = {
    clients: clientsCount ?? 0,
    projects: projectsCount ?? 0,
    teamMembers: 1,
    storageMb,
  }

  return {
    plan,
    planName: formatPlanName(plan),
    planInterest: agency.plan_interest ?? null,
    subscriptionStatus: normalizeSubscriptionStatus(agency.subscription_status),
    trialEndsAt: agency.trial_ends_at ?? null,
    currentPeriodEnd: agency.current_period_end ?? null,
    stripeCustomerId: agency.stripe_customer_id ?? null,
    stripeSubscriptionId: agency.stripe_subscription_id ?? null,
    limits,
    usage,
    reached: {
      clients: isAtLimit(usage.clients, limits.max_clients),
      projects: isAtLimit(usage.projects, limits.max_projects),
      teamMembers: isAtLimit(usage.teamMembers, limits.max_team_members),
      storage: isAtLimit(usage.storageMb, limits.max_storage_mb),
    },
  }
}
