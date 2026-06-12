"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ClientFlowLogo } from "@/components/brand/clientflow-logo"

export default function TermsPage() {
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

          <h1 className="text-3xl font-light tracking-tight md:text-4xl">Terms of Service</h1>
          <p className="mt-2 text-sm text-black/40">Last updated: 2026</p>

          <div className="mt-8 space-y-6 text-sm leading-7 text-black/60">
            <section>
              <h2 className="text-base font-medium text-black">Acceptance of terms</h2>
              <p>
                By using ClientFlow, you agree to these Terms of Service. If you do not agree, do not use the service. These terms apply to all users, including account owners, workspace members, and client portal visitors.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-black">Use of the service</h2>
              <p>
                ClientFlow is a project management and client collaboration platform. You may use it in compliance with these terms and all applicable laws. We reserve the right to suspend or terminate access if the service is used in violation of these terms.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-black">Accounts and workspaces</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Each workspace is managed by its owner, who controls access and permissions for team members.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-black">Client portal usage</h2>
              <p>
                Client portals allow you to share project files, collect feedback, and request approvals from your clients. You are responsible for the content you share through portals and for ensuring that your clients understand how their feedback and data will be used.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-black">Uploaded files and content</h2>
              <p>
                You retain all rights to the files and content you upload to ClientFlow. By uploading, you grant us the limited right to store and process this content solely to provide the service. You are responsible for ensuring you have the rights to share any content you upload.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-black">Billing and plans</h2>
              <p>
                ClientFlow offers a free Starter plan and paid plans (Pro and Custom). Requesting a paid plan does not create an automatic charge. We will contact you to confirm pricing and payment details before any paid subscription begins. Paid plans may be handled manually until automated billing is available.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-black">Acceptable use</h2>
              <p>
                You agree not to use ClientFlow for any unlawful purpose, to upload malicious files, to attempt to access another user's account or data without permission, or to use the service in a way that could harm or disrupt our infrastructure.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-black">Service availability</h2>
              <p>
                We strive to keep ClientFlow available and reliable, but we do not guarantee uninterrupted or error-free operation. We may perform maintenance, updates, or make changes to the service at any time.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-black">Termination</h2>
              <p>
                You may stop using ClientFlow at any time and request account deletion by contacting us. We may suspend or terminate access if you violate these terms. Upon termination, your data will be deleted in accordance with our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-black">Limitation of liability</h2>
              <p>
                ClientFlow is provided &ldquo;as is&rdquo; without warranties of any kind. To the maximum extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-black">Changes to terms</h2>
              <p>
                We may update these terms from time to time. Changes will be posted on this page with an updated date. Continued use of the service after changes constitutes acceptance of the revised terms.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-black">Contact</h2>
              <p>
                If you have questions about these Terms of Service, please reach out via our{" "}
                <Link href="/contact-sales" className="text-black underline underline-offset-2 hover:text-black/60">contact page</Link>.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
