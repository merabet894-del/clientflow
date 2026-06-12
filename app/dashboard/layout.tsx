import { Sidebar } from "@/components/dashboard/sidebar"
import { TopBar } from "@/components/dashboard/top-bar"
import { createClient } from "@/lib/supabase/server"
import { ensureAgencyForCurrentUser, getDashboardSidebarState, getDashboardStats } from "@/lib/actions/workspace"

function getProfileName(metadata: Record<string, unknown> | undefined, email?: string | null) {
  const fullName = metadata?.full_name
  const name = metadata?.name

  if (typeof fullName === "string" && fullName.trim()) return fullName
  if (typeof name === "string" && name.trim()) return name
  if (email) return email.split("@")[0]
  return "Administrator"
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const agency = await ensureAgencyForCurrentUser().catch(() => null)
  const agencyId = agency?.id

  const [stats, sidebarState] = await Promise.all([
    getDashboardStats(agencyId),
    getDashboardSidebarState(agencyId),
  ])
  const setupComplete =
    stats.activeClients > 0 &&
    stats.totalProjects > 0 &&
    stats.filesShared > 0 &&
    stats.portalLinksCount > 0 &&
    (stats.feedbackCount > 0 || stats.approvalCount > 0)

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#111111]">
      <div className="flex min-h-screen">
        <Sidebar
          profile={{
            name: getProfileName(user?.user_metadata, user?.email),
            email: user?.email ?? "admin@clientflow.local",
            agencyName: agency?.name ?? "Workspace",
          }}
          initialNotifications={sidebarState.notifications}
          navBadges={{
            Approvals: sidebarState.badges.approvals,
            Projects: sidebarState.badges.projects,
            Settings: setupComplete ? 0 : "!",
          }}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar
            stats={stats}
            account={{
              name: getProfileName(user?.user_metadata, user?.email),
              email: user?.email ?? "admin@clientflow.local",
            }}
          />
          <section className="flex-1 px-5 py-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </section>
        </div>
      </div>
    </main>
  )
}
