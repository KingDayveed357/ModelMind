"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Loader2, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface ProfileFormData {
  fullName: string
  email: string
  company: string
}

export function ProfileTab() {
  const { user, supabase } = useAuth()
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: "",
    email: "",
    company: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.user_metadata?.full_name || "",
        email: user.email || "",
        company: user.user_metadata?.company || "",
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          company: formData.company,
        },
      })

      if (updateError) throw updateError
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="matte-panel">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Update your personal details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-600 dark:text-green-400">
                Profile updated successfully!
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm">Full Name</Label>
            <Input
              id="name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="text-sm"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              className="text-sm bg-muted"
              disabled
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm">Company</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Your company name"
              className="text-sm"
              disabled={loading}
            />
          </div>

          <Separator />
          
          <Button type="submit" className="transition-smooth w-full sm:w-auto" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}