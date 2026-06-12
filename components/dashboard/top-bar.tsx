"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
  ArrowUpRight,
  BadgeCheck,
  CircleHelp,
  Clock3,
  FileUp,
  Files,
  FolderKanban,
  Lightbulb,
  LogOut,
  MessageSquare,
  Plus,
  UserPlus,
  ChevronRight,
  type LucideIcon,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { DashboardStats } from "@/lib/actions/workspace"

type Breadcrumb = { label: string; href?: string }

type AdvisorRecommendation = {
  eyebrow: string
  title: string
  description: string
  href: string
  action: string
  icon: LucideIcon
}

type TopBarAccount = {
  name: string
  email: string
}

const quickStartGuides = [
  {
    title: "Add your first client",
    description: "Create the client record that projects, files, and approvals connect to.",
  },
  {
    title: "Create a project workspace",
    description: "Keep deliverables, feedback, approval requests, and status in one place.",
  },
  {
    title: "Upload a deliverable",
    description: "Attach client-facing files to a project before sharing them for review.",
  },
  {
    title: "Request client approval",
    description: "Send completed work into a trackable decision workflow.",
  },
  {
    title: "Review feedback",
    description: "Turn client comments into the next project action before closing work.",
  },
]

const helpQuestions = [
  {
    question: "What is a client portal?",
    answer: "A private workspace where clients review project files, leave feedback, and approve work.",
  },
  {
    question: "When should I request approval?",
    answer: "After uploading a deliverable that is ready for a client decision.",
  },
  {
    question: "Where does client feedback appear?",
    answer: "Feedback appears in the project workspace and is surfaced on the dashboard when it needs action.",
  },
  {
    question: "Can clients upload files?",
    answer: "Client file intake is not active yet; uploaded agency deliverables appear in Files.",
  },
]

const pageLabels: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/clients": "Clients",
  "/dashboard/projects": "Projects",
  "/dashboard/approvals": "Approvals",
  "/dashboard/files": "Files",
  "/dashboard/settings": "Settings",
}

function getBreadcrumbs(pathname: string): Breadcrumb[] {
  const detailMatch = pathname.match(/^(\/dashboard\/(clients|projects))\/(.+)$/)
  if (detailMatch) {
    const type = detailMatch[2]
    const detailLabel = type === "clients" ? "Client detail" : "Project detail"
    const parentLabel = type === "clients" ? "Clients" : "Projects"
    const parentHref = `/dashboard/${type === "clients" ? "clients" : "projects"}`
    return [
      { label: "Dashboard", href: "/dashboard" },
      { label: parentLabel, href: parentHref },
      { label: detailLabel },
    ]
  }

  const label = pageLabels[pathname]
  if (!label) return [{ label: "Dashboard" }]
  if (pathname === "/dashboard") return [{ label: "Dashboard" }, { label }]
  return [
    { label: "Dashboard", href: "/dashboard" },
    { label },
  ]
}

function getInitials(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return "CF"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0]}${words[1][0]}`.toUpperCase()
}

function getAdvisorRecommendation(stats: DashboardStats): AdvisorRecommendation {
  if (stats.activeClients === 0) {
    return {
      eyebrow: "Workspace setup",
      title: "Add your first client",
      description: "Create a client record before opening projects, files, and approval workflows.",
      href: "/dashboard/clients",
      action: "Add client",
      icon: UserPlus,
    }
  }

  if (stats.totalProjects === 0) {
    return {
      eyebrow: "Project setup",
      title: "Create a project workspace",
      description: "Start a project so deliverables, feedback, and approvals have one shared place.",
      href: "/dashboard/projects",
      action: "New project",
      icon: Plus,
    }
  }

  if (stats.filesShared === 0) {
    return {
      eyebrow: "Delivery",
      title: "Upload the first deliverable",
      description: "Add a file to a project so the client has something concrete to review.",
      href: "/dashboard/files",
      action: "Upload deliverable",
      icon: FileUp,
    }
  }

  if (stats.approvalCount === 0) {
    return {
      eyebrow: "Approval workflow",
      title: "Request approval on delivered work",
      description: "Turn shared deliverables into a trackable client decision.",
      href: "/dashboard/approvals",
      action: "View approvals",
      icon: BadgeCheck,
    }
  }

  if (stats.feedbackCount > 0) {
    return {
      eyebrow: "Feedback queue",
      title: "Review client feedback",
      description: "Client comments should become the next project update before work is marked complete.",
      href: "/dashboard/projects",
      action: "Review feedback",
      icon: MessageSquare,
    }
  }

  if (stats.waitingApprovals > 0) {
    return {
      eyebrow: "Pending decisions",
      title: "Follow up on pending approvals",
      description: "Approvals waiting on clients are the most likely place for delivery to slow down.",
      href: "/dashboard/approvals",
      action: "View approvals",
      icon: Clock3,
    }
  }

  return {
    eyebrow: "Workspace health",
    title: "Workspace looks healthy",
    description: "No obvious setup gaps or pending client decisions need action right now.",
    href: "/dashboard/projects",
    action: "View pipeline",
    icon: FolderKanban,
  }
}

function getAdvisorSuggestions(stats: DashboardStats) {
  const suggestions: string[] = []

  if (stats.totalProjects > 0 && stats.portalLinksCount === 0) {
    suggestions.push("Share the portal link with your client once the project workspace is ready.")
  }
  if (stats.filesShared > 0 && stats.approvalCount === 0) {
    suggestions.push("Request approval after uploading deliverables so decisions are tracked.")
  }
  if (stats.feedbackCount > 0) {
    suggestions.push("Review feedback before marking work complete.")
  }
  if (stats.waitingApprovals > 0) {
    suggestions.push("Follow up on approvals waiting more than a few days.")
  }
  if (suggestions.length === 0) {
    suggestions.push("Keep project status current so the dashboard can surface the right next action.")
    suggestions.push("Use approvals for final client decisions instead of leaving them in messages.")
  }

  return suggestions.slice(0, 3)
}

function AdvisorCenter({ stats }: { stats: DashboardStats }) {
  const recommendation = getAdvisorRecommendation(stats)
  const RecommendationIcon = recommendation.icon
  const suggestions = getAdvisorSuggestions(stats)
  const healthItems = [
    { label: "Active projects", value: stats.openProjects, icon: FolderKanban },
    { label: "Waiting approvals", value: stats.waitingApprovals, icon: Clock3 },
    { label: "Feedback items", value: stats.feedbackCount, icon: MessageSquare },
    { label: "Delivered files", value: stats.filesShared, icon: Files },
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Advisor Center"
          aria-label="Open Advisor Center"
          className="flex size-9 items-center justify-center rounded-full border border-black/[0.08] text-black/40 transition-colors hover:border-black/15 hover:text-black/70 data-[state=open]:border-black/20 data-[state=open]:bg-[#f7f7f5] data-[state=open]:text-black"
        >
          <Lightbulb className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[min(380px,calc(100vw-24px))] rounded-2xl border border-black/10 bg-white p-0 shadow-xl"
      >
        <div className="border-b border-black/[0.08] px-4 py-4">
          <p className="text-sm font-semibold">Advisor Center</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Recommended next steps for your client delivery workflow.
          </p>
        </div>

        <div className="space-y-4 p-4">
          <section className="rounded-2xl border border-black/[0.08] bg-[#f7f7f5] p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-black/65 ring-1 ring-black/[0.06]">
                <RecommendationIcon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-black/45">
                  {recommendation.eyebrow}
                </p>
                <h2 className="mt-1 text-sm font-semibold">{recommendation.title}</h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {recommendation.description}
                </p>
              </div>
            </div>
            <Link
              href={recommendation.href}
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-full bg-black px-3 text-xs font-medium text-white transition-colors hover:bg-black/85"
            >
              {recommendation.action}
              <ArrowUpRight className="size-3.5" />
            </Link>
          </section>

          <section>
            <p className="text-xs font-semibold text-black/70">Workspace health</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {healthItems.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="rounded-xl border border-black/[0.08] bg-white px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] text-muted-foreground">{item.label}</p>
                      <Icon className="size-3.5 shrink-0 text-black/35" />
                    </div>
                    <p className="mt-1 text-lg font-semibold tracking-tight">{item.value}</p>
                  </div>
                )
              })}
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold text-black/70">Suggestions</p>
            <div className="mt-2 space-y-2">
              {suggestions.map((suggestion) => (
                <div key={suggestion} className="rounded-xl bg-[#f7f7f5] px-3 py-2 text-xs leading-5 text-black/65 ring-1 ring-black/[0.04]">
                  {suggestion}
                </div>
              ))}
            </div>
          </section>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function HelpCenter() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Help Center"
          aria-label="Open Help Center"
          className="flex size-9 items-center justify-center rounded-full border border-black/[0.08] text-black/40 transition-colors hover:border-black/15 hover:text-black/70 data-[state=open]:border-black/20 data-[state=open]:bg-[#f7f7f5] data-[state=open]:text-black"
        >
          <CircleHelp className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[min(400px,calc(100vw-24px))] rounded-2xl border border-black/10 bg-white p-0 shadow-xl"
      >
        <div className="border-b border-black/[0.08] px-4 py-4">
          <p className="text-sm font-semibold">Help Center</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Learn how to set up and use your client portal.
          </p>
        </div>

        <div className="max-h-[min(620px,calc(100vh-110px))] overflow-y-auto p-4">
          <section>
            <p className="text-xs font-semibold text-black/70">Quick start</p>
            <div className="mt-2 space-y-2">
              {quickStartGuides.map((guide) => (
                <button
                  key={guide.title}
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-black/[0.08] bg-[#f7f7f5] px-3 py-2.5 text-left opacity-90"
                  title="Guides coming soon"
                >
                  <span className="block text-xs font-medium text-black/75">{guide.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">{guide.description}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="mt-4">
            <p className="text-xs font-semibold text-black/70">Common questions</p>
            <div className="mt-2 divide-y divide-black/[0.06] rounded-xl border border-black/[0.08] bg-white">
              {helpQuestions.map((item) => (
                <div key={item.question} className="px-3 py-3">
                  <p className="text-xs font-medium text-black/80">{item.question}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-4 rounded-2xl border border-black/[0.08] bg-[#f7f7f5] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Need help?</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Direct support is not connected yet.
                </p>
              </div>
              <button
                type="button"
                disabled
                className="h-8 shrink-0 cursor-not-allowed rounded-full border border-black/[0.08] bg-white px-3 text-xs font-medium text-black/35"
              >
                Support coming soon
              </button>
            </div>
          </section>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function TopBar({ stats, account }: { stats: DashboardStats; account: TopBarAccount }) {
  const router = useRouter()
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumbs(pathname)
  const initials = getInitials(account.name || account.email)

  async function handleSignOut() {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // Supabase may not be configured yet
    }
    router.push("/auth")
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-black/[0.10] bg-white/90 px-6 backdrop-blur-sm lg:px-8">
      <nav className="flex min-w-0 items-center gap-1.5 text-xs text-black/40 max-sm:hidden">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.label} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="size-3 shrink-0" />}
            {crumb.href ? (
              <Link href={crumb.href} className="transition-colors hover:text-black/70">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-black/80">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
      <span className="hidden max-sm:block text-xs font-medium text-black/60">
        {breadcrumbs[breadcrumbs.length - 1].label}
      </span>

      <div className="flex items-center gap-2 sm:gap-3">
        <HelpCenter />

        <AdvisorCenter stats={stats} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              title="Account menu"
              aria-label="Open account menu"
              className="flex size-9 items-center justify-center rounded-full border border-black/[0.08] bg-black text-xs font-semibold text-white transition-colors hover:bg-black/85 data-[state=open]:border-black/20 data-[state=open]:bg-black/85"
            >
              {initials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-2xl border-black/10 p-2 shadow-xl">
            <DropdownMenuLabel className="p-2 font-normal">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-black">{account.email}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Workspace owner</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
