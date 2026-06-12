"use server"

import { createClient as createSupabaseClient } from "@/lib/supabase/server"

export type SalesLeadInput = {
  email?: string | null
  plan_interest?: string | null
  source?: string
  user_id?: string | null
  agency_id?: string | null
}

export async function createSalesLead(input: SalesLeadInput) {
  const supabase = await createSupabaseClient()

  if (!input.email?.trim()) return

  await supabase.from("sales_leads").insert({
    email: input.email.trim(),
    plan_interest: input.plan_interest || null,
    source: input.source || "pricing",
    user_id: input.user_id || null,
    agency_id: input.agency_id || null,
  })
}

export async function submitSalesLead(_prev: unknown, formData: FormData) {
  const supabase = await createSupabaseClient()

  const email = formData.get("email") as string
  if (!email?.trim()) {
    return { success: false, message: "Email is required." }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let agencyId: string | null = null
  if (user) {
    const { data: agency } = await supabase
      .from("agencies")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle()
    agencyId = agency?.id ?? null
  }

  const { error } = await supabase.from("sales_leads").insert({
    email: email.trim(),
    name: (formData.get("name") as string)?.trim() || null,
    company: (formData.get("company") as string)?.trim() || null,
    plan_interest: (formData.get("plan_interest") as string)?.trim() || "pro",
    team_size: (formData.get("team_size") as string)?.trim() || null,
    clients_count: (formData.get("clients_count") as string)?.trim() || null,
    message: (formData.get("message") as string)?.trim() || null,
    source: (formData.get("source") as string)?.trim() || "pricing",
    user_id: user?.id ?? null,
    agency_id: agencyId,
  })

  if (error) {
    return { success: false, message: "Failed to submit. Please try again." }
  }

  return { success: true, message: "Thanks — we'll reach out soon to discuss the right plan." }
}
