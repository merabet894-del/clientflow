import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const stats = [
  { label: "Active clients", value: "24" },
  { label: "Open projects", value: "38" },
  { label: "Waiting approvals", value: "7" },
]

const features = [
  {
    title: "Client portals",
    description: "Give every client one clean place to view progress, files, feedback, and approvals.",
  },
  {
    title: "Project updates",
    description: "Keep clients informed without sending endless WhatsApp messages and emails.",
  },
  {
    title: "Approvals",
    description: "Let clients approve work directly from their portal so projects move faster.",
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#111111]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-sm font-semibold text-white">
            C
          </div>
          <span className="text-lg font-semibold tracking-tight">ClientFlow</span>
        </div>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-black">Features</a>
          <a href="#pricing" className="hover:text-black">Pricing</a>
          <a href="#demo" className="hover:text-black">Demo</a>
        </nav>

        <a href="/auth"><Button className="rounded-full">Start free</Button></a>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1fr_520px] lg:items-center">
        <div>
          <Badge variant="outline" className="mb-6 rounded-full border-black/10 bg-white px-4 py-2">
            Built for small agencies
          </Badge>

          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
            A client portal that keeps projects moving.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            ClientFlow helps agencies manage clients, projects, files, feedback,
            and approvals in one clean branded portal.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a href="/auth"><Button size="lg" className="rounded-full px-8">
              Create portal
            </Button></a>
            <a href="/dashboard"><Button size="lg" variant="outline" className="rounded-full bg-white px-8">
              View demo
            </Button></a>
          </div>
        </div>

        <Card id="demo" className="rounded-[2rem] border-black/10 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="rounded-[1.5rem] border bg-[#fafafa] p-4">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Agency dashboard</p>
                  <h2 className="text-2xl font-semibold">Project overview</h2>
                </div>
                <Badge className="rounded-full bg-emerald-600">Live</Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-2xl border bg-white p-4">
                    <p className="text-2xl font-semibold">{item.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border bg-white p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Website redesign</h3>
                    <p className="text-sm text-muted-foreground">Client: Design studio</p>
                  </div>
                  <Badge variant="outline" className="rounded-full">
                    Waiting approval
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl bg-[#f4f4f2] p-3">
                    <p className="text-sm font-medium">Homepage design</p>
                    <p className="text-xs text-muted-foreground">Ready for client review</p>
                  </div>
                  <div className="rounded-xl bg-[#f4f4f2] p-3">
                    <p className="text-sm font-medium">Brand assets</p>
                    <p className="text-xs text-muted-foreground">3 files uploaded</p>
                  </div>
                  <div className="rounded-xl bg-[#f4f4f2] p-3">
                    <p className="text-sm font-medium">Client feedback</p>
                    <p className="text-xs text-muted-foreground">2 comments received today</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Why agencies use it
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
            Less chasing. More approvals.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="rounded-[1.5rem] border-black/10 bg-white shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[2rem] bg-black p-8 text-white md:p-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Start with your next client.</h2>
              <p className="mt-3 max-w-xl text-white/60">
                Build trust with a simple portal where clients can follow progress and approve work.
              </p>
            </div>
            <a href="/auth"><Button size="lg" variant="secondary" className="rounded-full px-8">
              Start free
            </Button></a>
          </div>
        </div>
      </section>
    </main>
  )
}