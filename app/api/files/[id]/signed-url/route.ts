import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // read-only in this route
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: agency } = await supabase
    .from("agencies")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!agency) {
    return NextResponse.json({ error: "No agency" }, { status: 403 })
  }

  const { data: file } = await supabase
    .from("files")
    .select("url")
    .eq("id", id)
    .eq("agency_id", agency.id)
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
