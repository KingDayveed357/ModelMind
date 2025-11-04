// app/auth/callback/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient()
        
        // Get the code from the URL
        const code = searchParams.get("code")
        const next = searchParams.get("next") || "/dashboard"

        if (code) {
        // Exchange the full callback URL for a session (handles PKCE automatically)
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)
        
        if (error) {
            console.error("Error exchanging code for session:", error)
            setError(error.message)
            setTimeout(() => {
            router.push(`/sign-in?error=${encodeURIComponent(error.message)}`)
            }, 2000)
            return
        }

        router.push(next)

        } else {
          // No code found, check if there's an error in the URL
          const errorDescription = searchParams.get("error_description")
          const errorCode = searchParams.get("error")

          if (errorDescription || errorCode) {
            const errorMsg = errorDescription || errorCode || "Authentication failed"
            setError(errorMsg)
            setTimeout(() => {
              router.push(`/sign-in?error=${encodeURIComponent(errorMsg)}`)
            }, 2000)
          } else {
            // No code and no error, redirect to sign-in
            router.push("/sign-in")
          }
        }
      } catch (err) {
        console.error("Callback error:", err)
        const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred"
        setError(errorMsg)
        setTimeout(() => {
          router.push(`/sign-in?error=${encodeURIComponent(errorMsg)}`)
        }, 2000)
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-6 text-center">
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

          {error ? (
            <>
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold text-foreground">
                  Authentication Failed
                </h1>
                <p className="text-sm text-muted-foreground">
                  {error}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Redirecting you back to sign in...
              </p>
            </>
          ) : (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold text-foreground">
                  Completing sign in...
                </h1>
                <p className="text-sm text-muted-foreground">
                  Please wait while we authenticate your account
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}