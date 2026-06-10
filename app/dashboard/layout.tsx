import { Sidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#111111]">
      <div className="flex min-h-screen">
        <Sidebar />
        <section className="flex-1 px-5 py-6 lg:px-8">{children}</section>
      </div>
    </main>
  )
}
