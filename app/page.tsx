"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import { IntroAnimation } from "@/components/landing/intro-animation"
import { PixelIcon } from "@/components/landing/pixel-icon"
import { RevealText } from "@/components/landing/reveal-text"
import { StackingAgentCards } from "@/components/landing/stacking-agent-cards"
import { ClientFlowLogo } from "@/components/brand/clientflow-logo"
import { MobileNav } from "@/components/landing/mobile-nav"
import { HeroBackground } from "@/components/landing/hero-background"

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView()
  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1800
    const step = 16
    const increment = end / (duration / step)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, step)
    return () => clearInterval(timer)
  }, [inView, end])
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

function BentoCard({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useInView(0.1)
  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl border border-black/[0.07] bg-white overflow-hidden transition-all duration-700 hover:border-black/[0.15] hover:bg-[#fafaf8] ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms, border-color 0.3s ease, background-color 0.3s ease`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0,0,0,0.03), transparent 60%)" }}
      />
      {children}
    </div>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] tracking-widest font-sans text-black/40 bg-black/[0.04]">
      {children}
    </span>
  )
}

export default function ClientFlowPage() {
  const [heroReady, setHeroReady] = useState(false)
  const handleIntroDone = useCallback(() => {
    setHeroReady(true)
  }, [])

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`)
    el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`)
  }

  return (
    <div className="bg-[#F5F4F0] text-[#111] min-h-screen font-sans antialiased">

      <IntroAnimation onDone={handleIntroDone} />

      <MobileNav />

      <section className="relative h-screen overflow-hidden bg-[#F5F4F0]">

        <HeroBackground />

        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 pt-24 pb-16">
          <div className="w-full max-w-3xl text-center">
          <div
            className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide text-black/70 bg-white/70 border border-black/10 backdrop-blur mb-7"
            style={{
              opacity: heroReady ? 1 : 0,
              filter: heroReady ? "blur(0px)" : "blur(8px)",
              transform: heroReady ? "translateY(0px)" : "translateY(12px)",
              transition: "opacity 0.6s cubic-bezier(0.16,1,0.3,1) 0ms, filter 0.6s cubic-bezier(0.16,1,0.3,1) 0ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) 0ms",
            }}
          >
            Built for small agencies
          </div>
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-normal text-[#050505] leading-[1.0] tracking-tight mb-5 text-center"
            style={{
              fontFamily: '"IBM Plex Sans", sans-serif',
              opacity: heroReady ? 1 : 0,
              filter: heroReady ? "blur(0px)" : "blur(24px)",
              transform: heroReady ? "translateY(0px)" : "translateY(32px)",
              transition: "opacity 1s cubic-bezier(0.16,1,0.3,1) 0ms, filter 1s cubic-bezier(0.16,1,0.3,1) 0ms, transform 1s cubic-bezier(0.16,1,0.3,1) 0ms",
            }}
          >
            A client portal<br />that keeps<br />projects moving.
          </h1>
          <div
            className="mx-auto mb-10 max-w-xl"
            style={{
              opacity: heroReady ? 1 : 0,
              filter: heroReady ? "blur(0px)" : "blur(12px)",
              transform: heroReady ? "translateY(0px)" : "translateY(20px)",
              transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 60ms, filter 0.8s cubic-bezier(0.16,1,0.3,1) 60ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) 60ms",
            }}
          >
            <p
              className="text-base md:text-lg font-medium leading-relaxed text-black/75"
            >
              Manage clients, projects, files, feedback, and approvals in one clean branded portal.
            </p>
          </div>
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-14"
            style={{
              opacity: heroReady ? 1 : 0,
              filter: heroReady ? "blur(0px)" : "blur(12px)",
              transform: heroReady ? "translateY(0px)" : "translateY(16px)",
              transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 120ms, filter 0.8s cubic-bezier(0.16,1,0.3,1) 120ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) 120ms",
            }}
          >
            <a
              href="/auth"
              className="px-8 py-3.5 bg-[#111] text-white text-sm rounded-full hover:bg-[#333] transition-colors tracking-widest font-medium"
            >
              Start free
            </a>
            <a
              href="#demo"
              className="px-8 py-3.5 border border-black/20 text-[#111] text-sm rounded-full hover:bg-white hover:border-black/30 transition-all tracking-widest font-medium bg-white/60"
            >
              View demo
            </a>
          </div>
          <div className="flex justify-center gap-8 sm:gap-12">
            {[
              { value: "24", label: "Clients" },
              { value: "38", label: "Projects" },
              { value: "7", label: "Approvals" },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  opacity: heroReady ? 1 : 0,
                  filter: heroReady ? "blur(0px)" : "blur(16px)",
                  transform: heroReady ? "translateY(0px)" : "translateY(20px)",
                  transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${120 + i * 80}ms, filter 0.8s cubic-bezier(0.16,1,0.3,1) ${120 + i * 80}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${120 + i * 80}ms`,
                }}
              >
                <div className="text-3xl sm:text-4xl text-[#050505] font-normal tracking-tight" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>{stat.value}</div>
                <div className="text-xs text-black/50 tracking-widest uppercase mt-1" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </section>

      <section id="platform" className="py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <PixelIcon type="platform" size={40} />
            <div className="mt-4"><Tag>FEATURES</Tag></div>
            <RevealText className="mt-5 text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05]">
              {"Everything you need\nfor client management."}
            </RevealText>
          </div>

          <div className="grid grid-cols-12 grid-rows-auto gap-3" onMouseMove={handleMouse}>
            <BentoCard className="col-span-12 p-8 min-h-[200px] flex flex-col justify-between relative overflow-hidden" delay={0}>
              <img
                src="/landing/arc.png"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: "center 70%" }}
              />
              <div className="absolute inset-0" style={{
                maskImage: "linear-gradient(to bottom, transparent 45%, black 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 45%, black 100%)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }} />
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to bottom, transparent 35%, rgba(245,244,240,0.3) 50%, rgba(245,244,240,0.75) 65%, rgba(245,244,240,0.95) 80%, rgb(245,244,240) 100%)",
                }}
              />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl border border-black/10 bg-white/60 flex items-center justify-center mb-6" style={{ backdropFilter: "blur(8px)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><path d="m4.93 4.93 2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></svg>
                </div>
                <h3 className="text-xl font-light mb-3">Client Portals</h3>
                <p className="text-sm text-black/45 leading-relaxed max-w-sm">
                  Give every client a branded space to follow project progress, review updates, and access shared files in one place.
                </p>
              </div>
            </BentoCard>

            <BentoCard className="col-span-12 md:col-span-4 p-8 min-h-[200px]" delay={120}>
              <div className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mb-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <h3 className="text-lg font-light mb-2">Project Tracking</h3>
              <p className="text-sm text-black/45 leading-relaxed">Track active projects, progress, status, and what is waiting for client review.</p>
            </BentoCard>

            <BentoCard className="col-span-12 md:col-span-4 p-8 min-h-[200px]" delay={160}>
              <div className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mb-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10h8M8 14h5"/></svg>
              </div>
              <h3 className="text-lg font-light mb-2">File Sharing</h3>
              <p className="text-sm text-black/45 leading-relaxed">Upload project files and keep everything organized by client and project.</p>
            </BentoCard>

            <BentoCard className="col-span-12 md:col-span-4 p-8 min-h-[200px]" delay={200}>
              <div className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mb-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 className="text-lg font-light mb-2">Approvals & Feedback</h3>
              <p className="text-sm text-black/45 leading-relaxed">Clients can approve deliverables and leave feedback directly from the portal.</p>
            </BentoCard>
          </div>
        </div>
      </section>

      <section id="features" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
            <div>
              <PixelIcon type="agents" size={40} />
              <div className="mt-4"><Tag>DASHBOARD</Tag></div>
              <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
                {"Manage everything\nfrom one workspace."}
              </RevealText>
            </div>
            <p className="text-sm text-black/45 leading-relaxed max-w-xs">
              Manage clients, projects, files, approvals, and recent activity from your agency dashboard. See what needs attention at a glance.
            </p>
          </div>

          <StackingAgentCards />
        </div>
      </section>

      <section id="workflow" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06] overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <PixelIcon type="workflow" size={40} />
            <div className="mt-4"><Tag>HOW IT WORKS</Tag></div>
            <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
              {"Keep projects moving\nin three steps."}
            </RevealText>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3" onMouseMove={handleMouse}>
            {[
              { n: "01", title: "Create Client",  desc: "Add client details and start a dedicated portal.", delay: 0,   img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/define-5aafAmGBrxZpOqJ3XLHY3n3qzC2I5K.png" },
              { n: "02", title: "Add Project", desc: "Track progress, upload files, and share updates with clients.", delay: 80,  img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/compose-5RT5VR4f1Y3GoFmovqTKLTG4UXp3g2.png" },
              { n: "03", title: "Collect Feedback",    desc: "Clients review work, leave notes, and approve deliverables from the portal.", delay: 140, img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/test-zm8guZwxJHtwWsJ7XO4B0CF7GzlNK8.png" },
            ].map((step) => (
              <BentoCard key={step.n} className="relative overflow-hidden flex flex-col min-h-[320px]" delay={step.delay}>
                <div className="absolute inset-x-0 top-0 h-56 pointer-events-none">
                  <img
                    src={step.img}
                    alt={step.title}
                    className="w-full h-full object-cover object-top"
                    style={{
                      maskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 80%)",
                      WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 80%)",
                    }}
                  />
                </div>
                <div className="relative z-10 p-7">
                  <span className="font-pixel text-[11px] text-black/20 tracking-widest block">{step.n}</span>
                </div>
                <div className="relative z-10 px-7 pb-7 mt-auto pt-16">
                  <h3 className="text-2xl font-light mb-3">{step.title}</h3>
                  <p className="text-sm text-black/45 leading-relaxed">{step.desc}</p>
                </div>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      <section id="integrations" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
            <div>
              <PixelIcon type="integrations" size={40} />
              <div className="mt-4"><Tag>BUILT FOR AGENCIES</Tag></div>
              <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
                {"Keep clients, feedback,\nand approvals in sync."}
              </RevealText>
            </div>
            <p className="text-sm text-black/45 leading-relaxed max-w-xs">
              One clean workspace where clients can review work, leave feedback, approve deliverables, and your team manages everything.
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-black/[0.07] flex flex-col md:block md:relative" onMouseMove={handleMouse}>
            <div className="relative w-full h-[280px] md:h-[480px] shrink-0">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Org%20Arc%20-%20Upscaled-Sk90jShfu7nltLnhoQbaMJC1YaQKuU.png"
                alt="ClientFlow portal interface"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </div>

            <div className="flex flex-col gap-3 p-4 md:absolute md:bottom-4 md:right-4 md:p-0 md:w-72">
              <div
                className="rounded-xl border border-white/50 p-6"
                style={{
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  background: "rgba(255,255,255,0.60)",
                }}
              >
                <Tag>BRANDED PORTAL</Tag>
                <h3 className="mt-3 text-lg font-light mb-2">Custom branding</h3>
                <p className="text-xs text-black/45 leading-relaxed mb-4">White label client portals with your agency's branding, colors, and domain.</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
                    <span className="text-xs text-black/50">Custom logo</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
                    <span className="text-xs text-black/50">Agency colors</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
                    <span className="text-xs text-black/50">Secure project link</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
                    <span className="text-xs text-black/50">Client-ready portal</span>
                  </div>
                </div>
              </div>

              <div
                className="rounded-xl border border-white/50 p-6"
                style={{
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  background: "rgba(255,255,255,0.60)",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
                  <span className="text-xs text-black/40 tracking-widest font-mono">Portal Link</span>
                </div>
                <p className="text-xs text-black/50 font-mono mb-3">clients.youragency.com/project/acme-redesign</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-black/40">Access</span><span className="text-black/60">Secure client link</span></div>
                  <div className="flex justify-between"><span className="text-black/40">Status</span><span className="text-black/60">Ready for review</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="security" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <PixelIcon type="platform" size={40} />
            <div className="mt-4"><Tag>SECURE CLIENT ACCESS</Tag></div>
            <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
              {"Share every project\nthrough a secure portal."}
            </RevealText>
            <p className="mt-6 text-base text-black/40 leading-relaxed max-w-2xl">
              Clients can open their project portal, review files, leave feedback, and approve deliverables without needing to search through emails or shared drives.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <p className="text-sm text-black/45 leading-relaxed">
                Reduce back-and-forth messages, keep files organized, get approvals faster, and give clients a professional experience.
              </p>

              <div className="space-y-4">
                {[
                  { label: "Reduce Messages", desc: "Stop chasing feedback across email and messages" },
                  { label: "Organized Files", desc: "Everything in one place by client and project" },
                  { label: "Faster Approvals", desc: "Clients approve work directly from the portal" },
                ].map((item) => (
                  <div key={item.label} className="flex gap-4">
                    <div className="w-1 bg-black/10 rounded-full shrink-0" />
                    <div>
                      <h3 className="text-sm font-light mb-1">{item.label}</h3>
                      <p className="text-xs text-black/35">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-col gap-2">
                {["Secure links", "Private files", "Reliable access", "Client-ready sharing"].map((badge) => (
                  <div key={badge} className="flex items-center gap-2 text-xs text-black/25">
                    <span className="w-1 h-1 rounded-full bg-black/25" />
                    {badge}
                  </div>
                ))}
              </div>
            </div>

            <BentoCard className="p-6 lg:row-span-1" delay={0}>
              <div className="text-xs text-black/30 tracking-widest uppercase mb-4">Recent Activity</div>
              <div className="space-y-2">
                {[
                  { time: "12:34:21", action: "Files uploaded", status: "success" },
                  { time: "12:34:18", action: "Feedback received", status: "success" },
                  { time: "12:34:15", action: "Project updated", status: "success" },
                  { time: "12:34:12", action: "Approval sent", status: "success" },
                  { time: "12:34:09", action: "Client notified", status: "success" },
                ].map((log, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-black/[0.02] hover:bg-black/[0.04] transition-colors border border-black/[0.04] group cursor-pointer"
                    style={{
                      animation: `fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms both`,
                    }}
                  >
                    <span className="text-[10px] text-black/25 font-mono min-w-[60px]">{log.time}</span>
                    <span className="text-[11px] text-black/50 font-light flex-1">{log.action}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500/60 group-hover:bg-green-500 transition-colors" />
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <PixelIcon type="workflow" size={40} />
            <div className="mt-4"><Tag>AGENCY WORKFLOW</Tag></div>
            <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
              {"Built for agencies.\nSimple for clients."}
            </RevealText>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { n: "01", title: "Create a client portal", desc: "Set up a dedicated space for each client." },
              { n: "02", title: "Share project updates", desc: "Upload files, add progress, and keep clients informed." },
              { n: "03", title: "Collect feedback", desc: "Clients leave comments directly inside the portal." },
              { n: "04", title: "Get approvals", desc: "Deliverables get approved without email chasing." },
            ].map((step) => (
              <BentoCard key={step.n} className="p-6 flex flex-col" delay={Number(step.n) * 80}>
                <div className="text-xs text-black/25 tracking-widest mb-3">{step.n}</div>
                <h3 className="text-lg font-light mb-2">{step.title}</h3>
                <p className="text-sm text-black/45 leading-relaxed">{step.desc}</p>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      <section className="py-0 border-t border-black/[0.06] overflow-hidden select-none">
        <div className="flex border-b border-black/[0.06]" style={{ animation: "marqueeLeft 28s linear infinite" }}>
          {[...Array(3)].map((_, rep) => (
            <div key={rep} className="flex shrink-0">
              {["Client Portals", "Project Tracking", "File Sharing", "Feedback Collection", "Approvals", "Progress Updates", "Deliverables", "Status Reports", "Client Communication", "Team Collaboration"].map((cap) => (
                <div key={cap} className="flex items-center gap-6 px-10 py-5 border-r border-black/[0.06] shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-black/20 shrink-0" />
                  <span className="text-sm text-black/45 whitespace-nowrap tracking-wide">{cap}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex" style={{ animation: "marqueeRight 22s linear infinite" }}>
          {[...Array(3)].map((_, rep) => (
            <div key={rep} className="flex shrink-0">
              {["White Label Branding", "Custom Workflows", "Permission Management", "Activity Tracking", "Secure Sharing", "Email Notifications", "Real-time Updates", "Mobile Friendly", "Dashboard Analytics"].map((cap) => (
                <div key={cap} className="flex items-center gap-6 px-10 py-5 border-r border-black/[0.06] shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-black/12 shrink-0" />
                  <span className="text-sm text-black/30 whitespace-nowrap tracking-wide">{cap}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section id="demo" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <div className="flex justify-center mb-4"><Tag>DEMO</Tag></div>
            <RevealText className="text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
              {"See ClientFlow in action."}
            </RevealText>
            <p className="mt-4 text-base text-black/45 leading-relaxed max-w-xl mx-auto">
              Watch how an agency creates a client, adds a project, shares files, collects feedback, and gets approval from one clean client portal.
            </p>
          </div>

          <div className="rounded-2xl border border-black/[0.07] bg-white overflow-hidden shadow-sm mb-10">
            <div className="relative aspect-video bg-[#f0efe9] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-[#111] flex items-center justify-center hover:bg-[#333] transition-colors cursor-pointer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="8,5 19,12 8,19" /></svg>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wider text-black/40 bg-black/[0.06]">45 SEC WALKTHROUGH</span>
              </div>
              <div className="absolute bottom-4 left-4 text-xs text-black/30">Product walkthrough video coming soon</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { n: "01", title: "Add client" },
              { n: "02", title: "Create project" },
              { n: "03", title: "Share portal" },
              { n: "04", title: "Get approval" },
            ].map((step) => (
              <div key={step.n} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-black/[0.06]">
                <span className="text-[10px] font-mono text-black/25">{step.n}</span>
                <span className="text-xs text-black/55">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 flex flex-col items-center">
            <PixelIcon type="pricing" size={40} />
            <div className="mt-4"><Tag>PRICING</Tag></div>
            <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
              {"Simple pricing\nfor any agency."}
            </RevealText>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3" onMouseMove={handleMouse}>
            {[
              {
                name: "Starter",
                price: "$19",
                period: "/mo",
                sub: "For freelancers and solo studios",
                features: ["Client portals", "Projects & tracking", "File sharing", "Feedback collection", "Approvals", "Up to 10 clients"],
                delay: 0,
              },
              {
                name: "Pro",
                price: "$49",
                period: "/mo",
                sub: "For growing agencies",
                features: ["Up to 50 clients", "Unlimited projects", "Team members", "Advanced reporting", "Custom branding", "Priority support"],
                highlight: true,
                delay: 80,
              },
              {
                name: "Agency",
                price: "Custom",
                sub: "For teams managing many clients",
                features: ["Unlimited clients & projects", "Team onboarding", "Custom workspace", "Dedicated support", "Priority access", "Premium onboarding"],
                delay: 140,
              },
            ].map((plan) => (
              <BentoCard
                key={plan.name}
                className={`p-8 flex flex-col ${plan.highlight ? "border-black/20 bg-[#F0EEE8]" : ""}`}
                delay={plan.delay}
              >
                <div className="mb-8">
                  <div className="font-pixel text-[11px] tracking-widest text-black/40 mb-4">{plan.name}</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-light">{plan.price}</span>
                    {plan.period && <span className="text-black/40 text-sm">{plan.period}</span>}
                  </div>
                  <p className="text-xs text-black/35 tracking-wide">{plan.sub}</p>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-black/55">
                      <div className="w-1 h-1 rounded-full bg-black/25 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="/auth" className={`block w-full text-center py-3 rounded-xl text-sm tracking-widest transition-all duration-200 ${
                  plan.highlight
                    ? "bg-[#111] text-white hover:bg-[#333]"
                    : "border border-black/10 text-black/60 hover:border-black/25 hover:text-black hover:bg-black/[0.04]"
                }`}>
                  {plan.name === "Enterprise" ? "CONTACT SALES" : "GET STARTED"}
                </a>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06] overflow-hidden">
        <img
          src="/landing/footer.png"
          alt=""
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-full object-cover object-bottom pointer-events-none select-none"
          style={{ opacity: 0.85 }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            maskImage: "linear-gradient(to top, transparent 0%, black 55%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 0%, black 55%)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgb(245,244,240) 0%, rgba(245,244,240,0.92) 18%, rgba(245,244,240,0.55) 35%, transparent 55%)",
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05] mb-6">
            Keep your client<br />projects moving faster.
          </h2>
          <p className="text-sm text-black/45 leading-relaxed mb-10">
            Start with one client portal and manage files, feedback, and approvals from one place.
          </p>
          <a
            href="/auth"
            className="inline-flex items-center px-8 py-3 bg-[#111] text-white text-sm rounded-xl hover:bg-[#333] transition-colors tracking-widest font-medium"
          >
            START FREE
          </a>
        </div>
      </section>

      <footer className="py-10 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <a href="/">
            <ClientFlowLogo variant="compact" height={28} />
          </a>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {[
              { label: "Features",     href: "#platform" },
              { label: "How it Works", href: "#workflow" },
              { label: "Pricing",      href: "#pricing" },
              { label: "Demo",         href: "#demo" },
              { label: "Contact",      href: "#contact" },
            ].map(l => (
              <a key={l.label} href={l.href} className="text-xs text-black/35 hover:text-black/70 transition-colors tracking-widest">{l.label}</a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            {[
              { label: "Privacy", href: "#" },
              { label: "Terms",   href: "#" },
              { label: "Contact", href: "#" },
            ].map(l => (
              <a key={l.label} href={l.href} className="text-xs text-black/25 hover:text-black/55 transition-colors tracking-widest">{l.label}</a>
            ))}
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-black/[0.04]">
          <span className="text-xs text-black/20">© 2026 ClientFlow. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}
