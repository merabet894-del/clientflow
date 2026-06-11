"use client"

import Link from "next/link"
import { useEffect, useState, useRef, useCallback } from "react"
import { CheckIcon, Copy, ExternalLink } from "lucide-react"

interface Stats {
  activeClients: number
  openProjects: number
  totalProjects: number
  filesShared: number
  waitingApprovals: number
  feedbackCount: number
  approvalCount: number
  agencyId: string | null
}

interface RecentActivityItem {
  id: string
  type: string
  text: string
}

interface Project {
  id: string
  name: string
  portal_token: string
}

const baseSteps = [
  {
    num: 1,
    title: "Add your first client",
    desc: "Create a client profile and prepare their portal workspace.",
  },
  {
    num: 2,
    title: "Create a project",
    desc: "Track progress, files, feedback, and approvals in one place.",
  },
  {
    num: 3,
    title: "Upload a file",
    desc: "Share deliverables with your client securely.",
  },
  {
    num: 4,
    title: "Share the portal",
    desc: "Send your client a private link to review progress and files.",
  },
  {
    num: 5,
    title: "Collect feedback or approval",
    desc: "Clients can leave notes or approve work directly from the portal.",
  },
]

function portalSharedKey(agencyId: string | null) {
  if (agencyId) return `clientflow_onboarding_portal_shared_${agencyId}`
  return null
}

export function OnboardingChecklist({
  stats,
  projects,
}: {
  stats: Stats
  recentActivity?: RecentActivityItem[]
  projects: Project[]
}) {
  const [portalShared, setPortalShared] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const key = portalSharedKey(stats.agencyId)
    if (!key || stats.totalProjects === 0) {
      setPortalShared(false)
      if (key) localStorage.removeItem(key)
      localStorage.removeItem("clientflow_onboarding_portal_shared")
      return
    }

    setPortalShared(localStorage.getItem(key) === "true")
  }, [stats.agencyId, stats.totalProjects])

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

  const markPortalShared = useCallback(() => {
    const key = portalSharedKey(stats.agencyId)
    if (key) {
      localStorage.setItem(key, "true")
    }
    setPortalShared(true)
  }, [stats.agencyId])

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

  const handleCopyPortalLink = useCallback(async (token: string) => {
    const url = `${window.location.origin}/portal/${token}`
    await copyToClipboard(url)
    markPortalShared()
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }, [copyToClipboard, markPortalShared])

  const step1Done = stats.activeClients > 0
  const step2Done = step1Done && stats.totalProjects > 0
  const step3Done = step2Done && stats.filesShared > 0
  const step4Done = step3Done && portalShared
  const step5Done =
    step4Done &&
    stats.totalProjects > 0 &&
    ((stats.feedbackCount ?? 0) > 0 || (stats.approvalCount ?? 0) > 0)
  const stepsDone = [step1Done, step2Done, step3Done, step4Done, step5Done]
  const allStepsDone = stepsDone.every(Boolean)
  const nextStep = stepsDone.findIndex((d) => !d)

  if (allStepsDone) return null

  return (
    <div className="mt-8">
      <div className="rounded-2xl border border-black/15 bg-white shadow-sm">
        <div className="p-6 md:p-8">
          <h2 className="text-xl font-semibold">Get your workspace ready</h2>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            Start with one client, create a project, share files, and collect feedback from a clean client portal.
          </p>
          <div className="mt-6 space-y-3">
            {baseSteps.map((step, i) => {
              const done = stepsDone[i]
              const isNext = i === nextStep
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
                  className={`flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${
                    done
                      ? "bg-white ring-1 ring-black/[0.06]"
                      : isNext
                        ? "bg-[#F0EFE9] ring-1 ring-black/[0.10]"
                        : "bg-[#f7f7f5]"
                  }`}
                >
                  <div className="flex items-start gap-3 sm:items-center">
                    <span
                      className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                        done
                          ? "bg-emerald-600 text-white"
                          : isNext
                            ? "bg-black text-white"
                            : "bg-black/[0.06] text-black/30"
                      }`}
                    >
                      {done ? <CheckIcon className="size-3.5" /> : step.num}
                    </span>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          done
                            ? "text-black/60"
                            : isNext
                              ? "text-black"
                              : "text-black/40"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p
                        className={`mt-0.5 text-xs ${
                          !done && !isNext ? "text-black/25" : "text-black/40"
                        }`}
                      >
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  {!done && isNext && isStep4 && stats.totalProjects > 0 && (
                    <div className="relative shrink-0 sm:self-center">
                      {projects.length === 1 ? (
                        <button
                          type="button"
                          onClick={() => handleCopyPortalLink(projects[0].portal_token)}
                          className="flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-center text-[11px] font-medium tracking-wide text-white transition-colors hover:bg-[#333]"
                        >
                          {copied ? (
                            <><CheckIcon className="size-3.5" /> Copied!</>
                          ) : (
                            <><Copy className="size-3.5" /> Copy portal link</>
                          )}
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setShowPicker(!showPicker)}
                            className="flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-center text-[11px] font-medium tracking-wide text-white transition-colors hover:bg-[#333]"
                          >
                            <Copy className="size-3.5" /> Copy portal link
                          </button>
                          {showPicker && (
                            <div
                              ref={pickerRef}
                              className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/10"
                            >
                              <p className="px-4 py-2.5 text-[11px] font-medium text-black/40">
                                Select a project
                              </p>
                              {projects.map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => {
                                    handleCopyPortalLink(p.portal_token)
                                    setShowPicker(false)
                                  }}
                                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-[#f7f7f5]"
                                >
                                  <ExternalLink className="size-3.5 shrink-0 text-black/30" />
                                  <span className="truncate">{p.name}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {!done && isNext && !isStep4 && (
                    <Link
                      href={href}
                      className="shrink-0 rounded-full bg-black px-4 py-2 text-center text-[11px] font-medium tracking-wide text-white transition-colors hover:bg-[#333] sm:self-center"
                    >
                      {step.num === 1
                        ? "Add client"
                        : step.num === 2
                          ? "New project"
                          : step.num === 3
                            ? "Upload file"
                            : "Go to approvals"}
                    </Link>
                  )}

                  {done && (
                    <span className="shrink-0 text-[11px] font-medium text-emerald-600/60 sm:self-center">
                      Done
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
