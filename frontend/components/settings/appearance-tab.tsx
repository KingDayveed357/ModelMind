"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"

export function AppearanceTab() {
  const { theme, setTheme } = useTheme()
  const isDarkMode = theme === "dark"

  return (
    <Card className="matte-panel">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Appearance Settings</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Customize how RegressLab looks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start sm:items-center justify-between gap-4">
          <div className="space-y-0.5 flex-1">
            <Label htmlFor="dark-mode" className="text-sm">Dark Mode</Label>
            <p className="text-xs sm:text-sm text-muted-foreground">Switch to dark theme</p>
          </div>
          <Switch
            id="dark-mode"
            checked={isDarkMode}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="text-sm">Chart Color Scheme</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            {["Default", "Colorblind", "Monochrome"].map((scheme) => (
              <Button
                key={scheme}
                variant="outline"
                className="bg-transparent transition-smooth text-xs sm:text-sm"
              >
                {scheme}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
