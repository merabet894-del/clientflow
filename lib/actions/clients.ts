import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import { ensureAgencyForCurrentUser } from "./workspace"

export type Client = {
  id: string
  agency_id: string
  name: string
  email: string | null
  company: string | null
  status: string
  created_at: string
}

export async function getClients(agencyId?: string): Promise<Client[]> {
  if (!agencyId) {
    try { const a = await ensureAgencyForCurrentUser(); if (a) agencyId = a.id } catch { /* fail safe */ }
  }
  if (!agencyId) return []

  const supabase = await createSupabaseClient()
  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: false })

  return data ?? []
}

export async function getClientById(id: string, agencyId?: string): Promise<Client | null> {
  if (!agencyId) {
    try { const a = await ensureAgencyForCurrentUser(); if (a) agencyId = a.id } catch { /* fail safe */ }
  }
  if (!agencyId) return null

  const supabase = await createSupabaseClient()
  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("agency_id", agencyId)
    .single()

  return data
}
