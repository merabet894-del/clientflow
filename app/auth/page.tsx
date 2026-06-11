"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { GradientBackground } from "@/components/auth/shader-gradient"
import { ClientFlowLogo } from "@/components/brand/clientflow-logo"

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(
    searchParams.get("error") === "callback_failed"
      ? "Email confirmation failed. Please try signing in again."
      : ""
  )
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/dashboard")
      }
    })
  }, [router])

  function toggleForm() {
    setIsLogin(!isLogin)
    setError("")
    setSuccess("")
  }

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
      setSuccess("Check your email to confirm your account.")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0] flex overflow-hidden">
      {/* Left panel — Form */}
      <div
        className={`w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative z-10 transition-all duration-700 ease-in-out min-h-screen ${
          isLogin ? "lg:translate-x-full" : "lg:translate-x-0"
        }`}
      >
        <div className="absolute top-8 left-8 z-20">
          <ClientFlowLogo variant="compact" height={24} />
        </div>
        <div className="w-full max-w-sm space-y-8">
          {/* Brand */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-[#050505]">
              {isLogin ? "Welcome back" : "Create your ClientFlow account"}
            </h1>
            <p className="text-sm text-black/50">
              {isLogin
                ? "Sign in to manage your clients, projects, and approvals."
                : "Start managing clients, projects, files, feedback, and approvals in one clean portal."}
            </p>
          </div>

          {/* Error / Success messages */}
          {error && (
            <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 border border-rose-200">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 border border-emerald-200">
              {success}
            </div>
          )}

          {/* Form */}
          {isLogin ? (
            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-xs font-medium text-black/60 uppercase tracking-wider">
                  Work email
                </Label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="hello@agency.com"
                  required
                  className="h-11 rounded-xl border-black/10 bg-white text-[#111] placeholder:text-black/30 focus-visible:border-black/30"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password" className="text-xs font-medium text-black/60 uppercase tracking-wider">
                    Password
                  </Label>
                </div>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="h-11 rounded-xl border-black/10 bg-white text-[#111] placeholder:text-black/30 focus-visible:border-black/30"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 rounded-full bg-[#111] text-white hover:bg-[#333] text-sm font-medium tracking-wider"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-xs font-medium text-black/60 uppercase tracking-wider">
                  Work email
                </Label>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="hello@agency.com"
                  required
                  className="h-11 rounded-xl border-black/10 bg-white text-[#111] placeholder:text-black/30 focus-visible:border-black/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-xs font-medium text-black/60 uppercase tracking-wider">
                  Password
                </Label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="h-11 rounded-xl border-black/10 bg-white text-[#111] placeholder:text-black/30 focus-visible:border-black/30"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 rounded-full bg-[#111] text-white hover:bg-[#333] text-sm font-medium tracking-wider"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Start free"}
              </Button>
            </form>
          )}

          {/* Toggle */}
          <p className="text-center text-sm text-black/50">
            {isLogin ? (
              <>
                New to ClientFlow?{" "}
                <button
                  type="button"
                  onClick={toggleForm}
                  className="text-[#111] underline underline-offset-4 hover:text-black/70 transition-colors font-medium"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={toggleForm}
                  className="text-[#111] underline underline-offset-4 hover:text-black/70 transition-colors font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </p>

          {/* Legal */}
          {!isLogin && (
            <p className="text-center text-xs text-black/40">
              By creating an account, you agree to the{" "}
              <a href="/terms" className="underline underline-offset-2 hover:text-black/70">Terms</a>{" "}
              and{" "}
              <a href="/privacy" className="underline underline-offset-2 hover:text-black/70">Privacy Policy</a>.
            </p>
          )}
        </div>
      </div>

      {/* Right panel — Shader Gradient (exact copy from shader-gradient-component) */}
      <div
        className={`hidden lg:flex lg:w-1/2 relative overflow-hidden transition-all duration-700 ease-in-out items-center justify-center min-h-screen ${
          isLogin ? "lg:-translate-x-full" : "lg:translate-x-0"
        }`}
      >
        <GradientBackground />
        <div className="absolute inset-0 pointer-events-none bg-black/20" />
        <div className="absolute inset-0 z-10 flex items-center justify-center px-8">
          <div className="max-w-sm text-center">
            <h2 className="text-2xl md:text-3xl font-light text-white/90 tracking-tight mb-3">
              Client portals, simplified.
            </h2>
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              Share projects, files, feedback, and approvals through one clean portal.
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
              {["Projects", "Files", "Approvals"].map((badge) => (
                <span
                  key={badge}
                  className="px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wide text-white/70 bg-white/10 border border-white/15"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm />
    </Suspense>
  )
}
