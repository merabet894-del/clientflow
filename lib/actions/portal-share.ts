"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function markPortalShared(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not authenticated" }

  const { error } = await supabase
    .from("projects")
    .update({ portal_shared_at: new Date().toISOString() })
    .eq("id", projectId)

  if (error) return { success: false, error: error.message }

  revalidatePath("/dashboard")
  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: true }
}
