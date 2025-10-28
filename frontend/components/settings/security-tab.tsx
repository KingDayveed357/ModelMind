// components/settings/security-tab.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PasswordUpdateForm } from "./password-update-form"
import { DeleteAccountSection } from "./delete-account-section"

export function SecurityTab() {
  return (
    <>
      <Card className="matte-panel">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Security Settings</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Manage your account security</CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordUpdateForm />
        </CardContent>
      </Card>

      <DeleteAccountSection />
    </>
  )
}