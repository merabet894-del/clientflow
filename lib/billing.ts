// Manual activation (Stripe not implemented):
// 1. Run in Supabase SQL Editor:
//    update agencies set plan = 'pro', subscription_status = 'active' where id = '<agency-id>';
// 2. Adjust limits as needed:
//    update agencies set max_clients = 50, max_projects = null, max_team_members = 5, max_storage_mb = 5120 where id = '<agency-id>';
// 3. For Custom/Agency plans, set limits per agreement.
// Do NOT automate this until Stripe checkout is live.

export type BillingPlan = "starter" | "pro" | "agency"
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "incomplete"

export type BillingFields = {
  plan?: string | null
  subscription_status?: string | null
  trial_ends_at?: string | null
  current_period_end?: string | null
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
  max_clients?: number | null
  max_projects?: number | null
  max_team_members?: number | null
  max_storage_mb?: number | null
}

export type PlanLimits = {
  max_clients: number | null
  max_projects: number | null
  max_team_members: number | null
  max_storage_mb: number | null
}

export const PLAN_LIMITS: Record<BillingPlan, PlanLimits> = {
  starter: {
    max_clients: 10,
    max_projects: 25,
    max_team_members: 1,
    max_storage_mb: 500,
  },
  pro: {
    max_clients: 50,
    max_projects: null,
    max_team_members: 5,
    max_storage_mb: 5 * 1024,
  },
  agency: {
    max_clients: null,
    max_projects: null,
    max_team_members: null,
    max_storage_mb: 50 * 1024,
  },
}

const SUBSCRIPTION_STATUSES = new Set<SubscriptionStatus>([
  "trialing",
  "active",
  "past_due",
  "canceled",
  "incomplete",
])

export function normalizePlan(plan?: string | null): BillingPlan {
  if (plan === "pro" || plan === "agency") return plan
  return "starter"
}

export function normalizeSubscriptionStatus(status?: string | null): SubscriptionStatus {
  return SUBSCRIPTION_STATUSES.has(status as SubscriptionStatus)
    ? (status as SubscriptionStatus)
    : "trialing"
}

export function resolvePlanLimits(fields?: BillingFields | null): PlanLimits {
  const plan = normalizePlan(fields?.plan)
  const defaults = PLAN_LIMITS[plan]
  return {
    max_clients: fields?.max_clients ?? defaults.max_clients,
    max_projects: fields?.max_projects ?? defaults.max_projects,
    max_team_members: fields?.max_team_members ?? defaults.max_team_members,
    max_storage_mb: fields?.max_storage_mb ?? defaults.max_storage_mb,
  }
}

export function isAtLimit(used: number, limit: number | null) {
  return limit !== null && used >= limit
}

export function wouldExceedLimit(used: number, added: number, limit: number | null) {
  return limit !== null && used + added > limit
}

export function formatPlanName(plan: BillingPlan) {
  if (plan === "agency") return "Custom"
  return plan.charAt(0).toUpperCase() + plan.slice(1)
}

export function formatLimit(limit: number | null) {
  return limit === null ? "Unlimited" : String(limit)
}

export function formatStorageLimit(limitMb: number | null) {
  if (limitMb === null) return "Unlimited"
  if (limitMb >= 1024) return `${Math.round(limitMb / 1024)}GB`
  return `${limitMb}MB`
}

export function formatStorageUsage(valueMb: number) {
  if (valueMb >= 1024) return `${(valueMb / 1024).toFixed(1)}GB`
  return `${Math.round(valueMb)}MB`
}

export function parseFileSizeToMb(size?: string | null) {
  if (!size) return 0
  const [rawValue, rawUnit] = size.trim().split(/\s+/)
  const value = Number(rawValue)
  if (!Number.isFinite(value)) return 0

  const unit = rawUnit?.toLowerCase()
  if (unit === "gb") return value * 1024
  if (unit === "mb") return value
  if (unit === "kb") return value / 1024
  if (unit === "b") return value / (1024 * 1024)
  return 0
}

export function bytesToMb(bytes: number) {
  return bytes / (1024 * 1024)
}
