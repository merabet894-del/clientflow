"use client"

import Link from "next/link"
import { useState, useRef, useCallback, useEffect } from "react"
import { CheckIcon, Copy, ExternalLink, LockKeyhole } from "lucide-react"

import { getSetupSteps, type SetupStats } from "@/lib/setup-progress"
import { markPortalShared } from "@/lib/actions/portal-share"

interface Stats {
  activeClients: number
  openProjects: number
  totalProjects: number
  filesShared: number
  waitingApprovals: number
  feedbackCount: number
  approvalCount: number
  portalLinksCount?: number
  agencyId: string | null
}

interface Project {
  id: string
  name: string
  portal_token: string
  portal_shared_at?: string | null
}

const baseSteps = [
  {
    num: 1,
    title: "Add your first client",
    desc: "Create a client profile and prepare their portal workspace.",
    pending: "Start here. Every project and portal needs a client.",
  },
  {
    num: 2,
    title: "Create a project",
    desc: "Track progress, files, feedback, and approvals in one place.",
    pending: "Add a client first, then create the delivery workspace.",
  },
  {
    num: 3,
    title: "Upload a file",
    desc: "Share a real deliverable with your client securely.",
    pending: "Create a project first so the deliverable has a home.",
  },
  {
    num: 4,
    title: "Share the portal",
    desc: "Send your client a private link to review progress and files.",
    pending: "Upload a file first. Portal links are generated from project data.",
  },
  {
    num: 5,
    title: "Collect feedback or approval",
    desc: "Clients can leave notes or approve work directly from the portal.",
    pending: "Share the portal, then wait for a real approval or feedback item.",
  },
]

export function OnboardingChecklist({
  stats,
  projects,
  compact = false,
}: {
  stats: Stats & SetupStats
  projects: Project[]
  compact?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const stepsDone = getSetupSteps(stats, projects)
  const stepsComplete = stepsDone.filter(Boolean).length
  const allStepsDone = stepsDone.every(Boolean)
  const nextStep = stepsDone.findIndex((done) => !done)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }
    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showPicker])

  const copyToClipboard = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = url
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
    }
  }, [])

  const handleCopyPortalLink = useCallback(async (token: string, projectId?: string) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
    const url = `${appUrl}/portal/${token}`
    await copyToClipboard(url)
    if (projectId) {
      markPortalShared(projectId).catch(() => {})
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }, [copyToClipboard])

  if (allStepsDone) {
    return (
      <aside className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <CheckIcon className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-emerald-900">Workspace ready</p>
            <p className="mt-1 text-sm leading-6 text-emerald-800/75">
              Your first client delivery loop is set up. The dashboard can now focus on live work.
            </p>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="rounded-2xl border border-black/15 bg-white shadow-sm">
      <div className={compact ? "p-5" : "p-5 md:p-7"}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Workspace setup
            </p>
            <h2 className={compact ? "mt-1 text-lg font-semibold" : "mt-2 text-2xl font-semibold tracking-tight"}>
              Get ready to deliver
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Complete these steps in order. ClientFlow becomes useful once there is a real client, project, deliverable, portal link, and client response.
            </p>
          </div>
          <div className="shrink-0 rounded-full bg-[#f4f4f2] px-3 py-1 text-xs font-medium text-black/65 ring-1 ring-black/[0.06]">
            {stepsComplete}/5 complete
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/[0.06]">
          <div
            className="h-full rounded-full bg-black transition-[width] duration-300"
            style={{ width: `${(stepsComplete / stepsDone.length) * 100}%` }}
          />
        </div>

        <div className={compact ? "mt-5 space-y-2" : "mt-6 grid gap-3"}>
          {baseSteps.map((step, i) => {
            const done = stepsDone[i]
            const isNext = i === nextStep
            const locked = !done && !isNext
            const isStep4 = i === 3

            const href =
              step.num === 1
                ? "/dashboard/clients"
                : step.num === 2
                  ? "/dashboard/projects"
                  : step.num === 3
                    ? "/dashboard/files"
                    : step.num === 5
                      ? "/dashboard/approvals"
                      : "#"

            return (
              <div
                key={step.num}
                className={`rounded-xl p-4 ring-1 transition-colors ${
                  done
                    ? "bg-white ring-emerald-200"
                    : isNext
                      ? "bg-[#F0EFE9] ring-black/[0.14]"
                      : "bg-[#f7f7f5] ring-black/[0.04]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      done
                        ? "bg-emerald-600 text-white"
                        : isNext
                          ? "bg-black text-white"
                          : "bg-black/[0.06] text-black/45"
                    }`}
                  >
                    {done ? <CheckIcon className="size-4" /> : locked ? <LockKeyhole className="size-3.5" /> : step.num}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            done
                              ? "text-black/70"
                              : isNext
                                ? "text-black"
                                : "text-black/60"
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className={`mt-1 text-sm leading-6 ${locked ? "text-black/45" : "text-muted-foreground"}`}>
                          {done ? step.desc : isNext ? step.desc : step.pending}
                        </p>
                      </div>
                      {done ? (
                        <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                          Done
                        </span>
                      ) : locked ? (
                        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-black/45 ring-1 ring-black/[0.06]">
                          Pending
                        </span>
                      ) : null}
                    </div>

                    {!done && isNext && isStep4 && projects.length > 0 ? (
                      <div className="relative mt-3">
                        {projects.length === 1 ? (
                          <button
                            type="button"
                            onClick={() => handleCopyPortalLink(projects[0].portal_token, projects[0].id)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-black px-3 py-2 text-center text-xs font-medium text-white transition-colors hover:bg-[#333]"
                          >
                            {copied ? (
                              <><CheckIcon className="size-3.5" /> Copied link</>
                            ) : (
                              <><Copy className="size-3.5" /> Copy portal link</>
                            )}
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setShowPicker(!showPicker)}
                              className="inline-flex items-center gap-1.5 rounded-full bg-black px-3 py-2 text-center text-xs font-medium text-white transition-colors hover:bg-[#333]"
                            >
                              <Copy className="size-3.5" /> Copy portal link
                            </button>
                            {showPicker ? (
                              <div
                                ref={pickerRef}
                                className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/10"
                              >
                                <p className="px-4 py-2.5 text-xs font-medium text-black/45">
                                  Select a project
                                </p>
                                {projects.map((p) => (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => {
                                      handleCopyPortalLink(p.portal_token, p.id)
                                      setShowPicker(false)
                                    }}
                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-[#f7f7f5]"
                                  >
                                    <ExternalLink className="size-3.5 shrink-0 text-black/35" />
                                    <span className="truncate">{p.name}</span>
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </>
                        )}
                      </div>
                    ) : null}

                    {!done && isNext && !isStep4 ? (
                      <Link
                        href={href}
                        className="mt-3 inline-flex rounded-full bg-black px-3 py-2 text-center text-xs font-medium text-white transition-colors hover:bg-[#333]"
                      >
                        {step.num === 1
                          ? "Add client"
                          : step.num === 2
                            ? "New project"
                            : step.num === 3
                              ? "Upload file"
                              : "Go to approvals"}
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
