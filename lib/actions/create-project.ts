"use server"

import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import { ensureAgencyForCurrentUser } from "./workspace"
import { revalidatePath } from "next/cache"

export async function createProject(formData: FormData) {
  const agency = await ensureAgencyForCurrentUser()
  if (!agency) return { error: "No agency found" }

  const supabase = await createSupabaseClient()
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

  revalidatePath("/dashboard/projects")
  return { success: true }
}
