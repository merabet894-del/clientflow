import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string; fileId: string }> }
) {
  const { token, fileId } = await params

  const supabase = createAdminClient()

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("portal_token", token)
    .single()

  if (!project) {
    return NextResponse.json({ error: "Portal not found" }, { status: 404 })
  }

  const { data: file } = await supabase
    .from("files")
    .select("url")
    .eq("id", fileId)
    .eq("project_id", project.id)
    .single()

  if (!file || !file.url) {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }

  const { data: signedUrlData } = await supabase.storage
    .from("clientflow-files")
    .createSignedUrl(file.url, 60 * 10)

  if (!signedUrlData) {
    return NextResponse.json({ error: "Failed to generate URL" }, { status: 500 })
  }

  return NextResponse.redirect(signedUrlData.signedUrl)
}
