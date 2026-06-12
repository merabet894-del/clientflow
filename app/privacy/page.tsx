"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ClientFlowLogo } from "@/components/brand/clientflow-logo"

export default function PrivacyPage() {
  const router = useRouter()

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push("/")
    }
  }, [router])

  return (
    <div className="bg-[#F5F4F0] text-[#111] min-h-screen font-sans antialiased">
      <header className="relative z-50 flex items-center justify-between px-6 py-4 md:px-12 lg:px-20">
        <Link href="/">
          <ClientFlowLogo variant="compact" height={28} />
        </Link>
        <Link
          href="/auth"
          className="text-xs tracking-widest text-black/40 hover:text-black/70 transition-colors"
        >
          START FREE
        </Link>
      </header>

      <main className="px-6 pb-16 md:px-12 lg:px-20">
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            onClick={goBack}
            className="mb-6 flex items-center gap-1.5 text-xs tracking-widest text-black/30 hover:text-black/60 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="15 18 9 12 15 6"/></svg>
            GO BACK
          </button>

          <h1 className="text-3xl font-light tracking-tight md:text-4xl">Privacy Policy</h1>
          <p className="mt-2 text-sm text-black/40">Last updated: 2026</p>

          <div className="mt-8 space-y-6 text-sm leading-7 text-black/60">
            <section>
              <p>
                ClientFlow provides a platform for agencies to manage client projects, share files, collect feedback, and obtain approvals. This Privacy Policy explains how we collect, use, and protect your information when you use our service.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-black">Information we collect</h2>
              <p>
                We collect information you provide when creating an account, such as your name, email address, and company name. We also collect data you upload to the platform, including client information, project details, files, feedback, and approval records.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-black">How we use information</h2>
              <p>
                We use your information to operate and improve the ClientFlow service. This includes managing your account and workspace, processing client portals and projects, storing and delivering uploaded files, enabling feedback and approval workflows, and communicating with you about your account or the service.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-black">Client portal data</h2>
              <p>
                When you invite clients to a portal, we store their interactions — including feedback submissions, approval decisions, and portal activity — on your behalf as the workspace owner. You control what data is shared through the portal and may revoke access at any time.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-black">Files and uploaded content</h2>
              <p>
                Files you upload through projects and portals are stored securely and are only accessible to members of your workspace and the clients you explicitly invite. We do not access or use your uploaded content for any purpose other than providing the service.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-black">Cookies and analytics</h2>
              <p>
                We use essential cookies to maintain your session and keep you logged in. We may use basic analytics to understand how the platform is used — such as page visits and feature usage — to guide product improvements.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-black">Data sharing</h2>
              <p>
                We do not sell your personal information. We may share data with third-party service providers that help us operate the platform, such as authentication services, database hosting, file storage, analytics, and application hosting. These providers are bound by contractual obligations to protect your data.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-black">Data security</h2>
              <p>
                We use reasonable technical and organizational safeguards, including secure hosting providers, access controls, and encrypted connections where applicable. However, no method of electronic storage or transmission is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-black">Data retention</h2>
              <p>
                We retain your data for as long as your account is active or as needed to provide the service. You may request deletion of your account and associated data at any time by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-black">Your rights</h2>
              <p>
                Depending on your location, you may have rights regarding your personal data, including the right to access, correct, delete, or export your data. To exercise these rights, please contact us using the information below.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-black">Contact</h2>
              <p>
                If you have questions about this Privacy Policy, please reach out via our{" "}
                <Link href="/contact-sales" className="text-black underline underline-offset-2 hover:text-black/60">contact page</Link>.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
