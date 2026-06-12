"use server"

import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import { ensureAgencyForCurrentUser } from "./workspace"
import { revalidatePath } from "next/cache"
import { getBillingOverview, getLimitMessage } from "./billing"
import type { Agency } from "./workspace"

export async function createProject(formData: FormData) {
  let agency: Agency | null = null
  try { agency = await ensureAgencyForCurrentUser() } catch (e) { return { error: e instanceof Error ? e.message : "Could not set up your workspace." } }
  if (!agency) return { error: "Not authenticated." }

  const supabase = await createSupabaseClient()
  const billing = await getBillingOverview()
  if (billing?.reached.projects) {
    return { error: getLimitMessage("projects", billing) }
  }

  const name = formData.get("name") as string
  const client_id = formData.get("client_id") as string
  const description = formData.get("description") as string

  if (!name) return { error: "Project name is required" }

  const { error } = await supabase.from("projects").insert({
    agency_id: agency.id,
    client_id: client_id && client_id !== "none" ? client_id : null,
    name,
    description: description || null,
    status: "active",
    progress: 10,
  })

  if (error) return { error: error.message }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/projects")
  return { success: true }
}
