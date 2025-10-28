"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Monitor, Smartphone, Tablet, MapPin, Clock } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface Session {
  id: string
  device: string
  location: string
  lastActive: string
  current: boolean
}

export function SessionManagement() {
  const { supabase } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: "1",
      device: "Chrome on Windows",
      location: "Lagos, Nigeria",
      lastActive: "Active now",
      current: true,
    },
    {
      id: "2",
      device: "Safari on iPhone",
      location: "Lagos, Nigeria",
      lastActive: "2 hours ago",
      current: false,
    },
  ])

  const getDeviceIcon = (device: string) => {
    if (device.includes("iPhone") || device.includes("Android")) {
      return <Smartphone className="w-5 h-5 text-muted-foreground" />
    }
    if (device.includes("iPad") || device.includes("Tablet")) {
      return <Tablet className="w-5 h-5 text-muted-foreground" />
    }
    return <Monitor className="w-5 h-5 text-muted-foreground" />
  }

  const handleRevokeSession = async (sessionId: string) => {
    setLoading(true)
    setError(null)

    try {
      // In a real implementation, you would revoke the session via Supabase
      // For now, we'll just remove it from the local state
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    } catch (err: any) {
      setError(err.message || "Failed to revoke session")
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeAll = async () => {
    setLoading(true)
    setError(null)

    try {
      // Sign out from all other sessions
      await supabase.auth.signOut({ scope: 'others' })
      setSessions((prev) => prev.filter((s) => s.current))
    } catch (err: any) {
      setError(err.message || "Failed to revoke all sessions")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="matte-panel">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Active Sessions</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Manage devices and locations where you're signed in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-start justify-between gap-4 p-4 rounded-lg border">
              <div className="flex gap-3 flex-1">
                <div className="mt-1">{getDeviceIcon(session.device)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{session.device}</p>
                    {session.current && (
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {session.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {session.lastActive}
                    </div>
                  </div>
                </div>
              </div>
              {!session.current && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevokeSession(session.id)}
                  disabled={loading}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>

        {sessions.filter((s) => !s.current).length > 0 && (
          <>
            <Separator />
            <Button
              variant="outline"
              onClick={handleRevokeAll}
              disabled={loading}
              className="w-full sm:w-auto text-destructive border-destructive/20 hover:bg-destructive/10"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Revoking...
                </>
              ) : (
                "Revoke All Other Sessions"
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}