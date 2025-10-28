// components/settings/NotificationsTab.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface NotificationSettings {
  emailNotifications: boolean
  trainingAlerts: boolean
}

export function NotificationsTab() {
  const { user, supabase } = useAuth()
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    trainingAlerts: true,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (user?.user_metadata) {
      setSettings({
        emailNotifications: user.user_metadata.email_notifications ?? true,
        trainingAlerts: user.user_metadata.training_alerts ?? true,
      })
    }
  }, [user])

  const handleSave = async () => {
    setLoading(true)
    setSuccess(false)

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          email_notifications: settings.emailNotifications,
          training_alerts: settings.trainingAlerts,
        },
      })

      if (error) throw error
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("Failed to update notifications:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="matte-panel">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Notification Preferences</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Choose what updates you want to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {success && (
          <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              Preferences saved successfully!
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-start sm:items-center justify-between gap-4">
          <div className="space-y-0.5 flex-1">
            <Label htmlFor="email-notifications" className="text-sm">Email Notifications</Label>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Receive email updates about your projects
            </p>
          </div>
          <Switch
            id="email-notifications"
            checked={settings.emailNotifications}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, emailNotifications: checked })
            }
          />
        </div>

        <Separator />

        <div className="flex items-start sm:items-center justify-between gap-4">
          <div className="space-y-0.5 flex-1">
            <Label htmlFor="training-alerts" className="text-sm">Training Completion Alerts</Label>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Get notified when model training completes
            </p>
          </div>
          <Switch
            id="training-alerts"
            checked={settings.trainingAlerts}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, trainingAlerts: checked })
            }
          />
        </div>

        <Separator />

        <Button onClick={handleSave} className="transition-smooth w-full sm:w-auto" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
