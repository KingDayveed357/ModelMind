"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Bell, Shield, Palette } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/hooks/use-auth"
import { ProfileTab } from "@/components/settings/profile-tab"
import { NotificationsTab } from "@/components/settings/notifications-tab"
import { AppearanceTab } from "@/components/settings/appearance-tab"
import { SecurityTab } from "@/components/settings/security-tab"
import { redirect } from "next/navigation"

export default function SettingsPage() {
  const { user, loading } = useAuth()

  if (!loading && !user) {
    redirect('/login')
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 sm:gap-8 max-w-4xl">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-serif font-normal">Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 h-auto p-1">
            <TabsTrigger value="profile" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
              <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
              <Palette className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <NotificationsTab />
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <AppearanceTab />
          </TabsContent>

          <TabsContent value="security" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <SecurityTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}