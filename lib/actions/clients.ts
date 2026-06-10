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

export async function getClients(): Promise<Client[]> {
  const agency = await ensureAgencyForCurrentUser()
  if (!agency) return []

  const supabase = await createSupabaseClient()
  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("agency_id", agency.id)
    .order("created_at", { ascending: false })

  return data ?? []
}

export async function getClientById(id: string): Promise<Client | null> {
  const agency = await ensureAgencyForCurrentUser()
  if (!agency) return null

  const supabase = await createSupabaseClient()
  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("agency_id", agency.id)
    .single()

  return data
}
