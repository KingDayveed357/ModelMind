// components/settings/PasswordUpdateForm.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Loader2, CheckCircle2 } from "lucide-react"
import { updatePassword } from "@/lib/auth"

interface PasswordFormData {
  newPassword: string
  confirmPassword: string
}

export function PasswordUpdateForm() {
  const [formData, setFormData] = useState<PasswordFormData>({
    newPassword: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match")
      setLoading(false)
      return
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    try {
      await updatePassword(formData.newPassword)
      setSuccess(true)
      setFormData({ newPassword: "", confirmPassword: "" })
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to update password")
    } finally {
      setLoading(false)
    }
  }

  return (
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
            Password updated successfully!
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="new-password" className="text-sm">New Password</Label>
        <Input
          id="new-password"
          type="password"
          value={formData.newPassword}
          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
          className="text-sm"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password" className="text-sm">Confirm New Password</Label>
        <Input
          id="confirm-password"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          className="text-sm"
          disabled={loading}
        />
      </div>

      <Separator />

      <Button type="submit" className="transition-smooth w-full sm:w-auto" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          "Update Password"
        )}
      </Button>
    </form>
  )
}
