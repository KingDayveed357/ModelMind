"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Loader2, CheckCircle2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState<string>("Completing sign in...")

  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        if (typeof window === "undefined") return

        const supabase = createClient()
        const url = new URL(window.location.href)
        const code = url.searchParams.get("code")

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)
          if (error) throw error

          setStatus("success")
          setMessage("Your account has been confirmed successfully!")
          setTimeout(() => router.replace("/dashboard"), 3000)
        } else {
          throw new Error("Invalid or missing confirmation code.")
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Authentication failed. Please try again."
        console.error("Auth callback failed:", err)
        setStatus("error")
        setMessage(message)
        setTimeout(() => router.replace(`/sign-in?error=${encodeURIComponent(message)}`), 3000)
      }
    }

    handleAuthRedirect()
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        {/* Logo */}
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary-foreground"
          >
            <path
              d="M2 18L8 12L12 16L18 2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="8" cy="12" r="1.5" fill="currentColor" />
            <circle cx="12" cy="16" r="1.5" fill="currentColor" />
            <circle cx="18" cy="2" r="1.5" fill="currentColor" />
          </svg>
        </div>

        {/* Dynamic content */}
        {status === "loading" && (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <h1 className="text-2xl font-semibold text-foreground">Completing sign in...</h1>
            <p className="text-sm text-muted-foreground">
              Please wait while we authenticate your account
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <h1 className="text-2xl font-semibold text-foreground">
              Account Confirmed Successfully 🎉
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome aboard! Redirecting you to your dashboard...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-2xl font-semibold text-foreground">Authentication Failed</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
            <p className="text-xs text-muted-foreground">Redirecting back to sign in...</p>
          </>
        )}
      </div>
    </div>
  )
}
