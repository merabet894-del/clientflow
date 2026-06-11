"use server"

import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import { ensureAgencyForCurrentUser } from "./workspace"
import { revalidatePath } from "next/cache"

export async function createClient(formData: FormData) {
  const agency = await ensureAgencyForCurrentUser()
  if (!agency) return { error: "No agency found" }

  const supabase = await createSupabaseClient()
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const company = formData.get("company") as string

  if (!name) return { error: "Client name is required" }

  const { data, error } = await supabase
    .from("clients")
    .insert({
      agency_id: agency.id,
      name,
      email: email || null,
      company: company || null,
      status: "active",
    })
    .select("id")
    .single()

  if (error) return { error: error.message }
  if (!data?.id) return { error: "Client was not created. Please try again." }

  revalidatePath("/dashboard/clients")
  return { success: true, clientId: data.id }
}

export async function createClientFormAction(
  _previousState: { success?: boolean; clientId?: string; error?: string } | null,
  formData: FormData
) {
  return createClient(formData)
}
