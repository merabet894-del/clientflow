"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthContent />
    </Suspense>
  )
}

function AuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<"signin" | "signup">("signin")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(searchParams.get("error") === "callback_failed"
    ? "Email confirmation failed. Please try signing in again."
    : "")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/dashboard")
      }
    })
  }, [router])

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const email = form.get("email") as string
    const password = form.get("password") as string

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      const redirectTo = searchParams.get("redirectTo") || "/dashboard"
      router.push(redirectTo)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const email = form.get("email") as string
    const password = form.get("password") as string

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      setSuccess("Account created. Check your email to confirm your account.")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] p-4">
      <Card className="w-full max-w-md rounded-2xl border-black/10 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-lg font-semibold text-white">
              C
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">
              Sign in to ClientFlow
            </h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Manage clients, projects, feedback, files, and approvals from one
              workspace.
            </p>
          </div>

          <div className="mb-6 flex rounded-xl bg-[#f1f1ef] p-1">
            <button
              type="button"
              onClick={() => { setTab("signin"); setError(""); setSuccess("") }}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                tab === "signin" ? "bg-white text-black shadow-sm" : "text-muted-foreground"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => { setTab("signup"); setError(""); setSuccess("") }}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                tab === "signup" ? "bg-white text-black shadow-sm" : "text-muted-foreground"
              }`}
            >
              Create account
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          {tab === "signin" ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  name="email"
                  type="email"
                  placeholder="hello@agency.com"
                  required
                  className="rounded-xl bg-[#f7f7f5]"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="signin-password">Password</Label>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-black"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="signin-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="rounded-xl bg-[#f7f7f5]"
                />
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Agency name</Label>
                <Input
                  id="signup-name"
                  name="name"
                  placeholder="My Agency"
                  required
                  className="rounded-xl bg-[#f7f7f5]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="hello@agency.com"
                  required
                  className="rounded-xl bg-[#f7f7f5]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="rounded-xl bg-[#f7f7f5]"
                />
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
