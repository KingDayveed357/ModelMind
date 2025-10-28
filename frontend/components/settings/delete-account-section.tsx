// components/settings/DeleteAccountSection.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export function DeleteAccountSection() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { supabase } = useAuth()

  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase.rpc('delete_user')
      if (error) throw error
      window.location.href = "/"
    } catch (err) {
      console.error("Failed to delete account:", err)
    }
    setDeleteDialogOpen(false)
  }

  return (
    <Card className="matte-panel border-destructive/50">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl text-destructive">Danger Zone</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Irreversible actions</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="transition-smooth w-full sm:w-auto">
              Delete Account
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background/95 backdrop-blur-md border shadow-xl">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <DialogTitle className="text-xl">Delete Account</DialogTitle>
              </div>
              <DialogDescription className="text-sm leading-relaxed">
                This action cannot be undone. This will permanently delete your account and remove all
                your data from our servers.
              </DialogDescription>
            </DialogHeader>
            <div className="my-4 p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <p className="text-sm text-foreground font-medium mb-2">You will lose access to:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>All trained regression models</li>
                <li>Uploaded datasets and project history</li>
                <li>Saved predictions and visualizations</li>
                <li>Account settings and preferences</li>
              </ul>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteAccount} className="w-full sm:w-auto">
                Yes, Delete My Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}