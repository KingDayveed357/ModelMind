"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, AlertTriangle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { deleteAccount, signOut} from "@/lib/auth"

import { toast } from "sonner"

export function DeleteAccountSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const { user } = useAuth()
  
  const router = useRouter()

  const handleDeleteAccount = async () => {
    if (!user) return

    if (confirmText.toLowerCase() !== "delete my account") {
      toast.error("Confirmation text incorrect")
      return
    }

    setIsDeleting(true)
    const toastId = toast.loading("Deleting your account...")
    try {
      await deleteAccount()
       
      toast.success("Account deleted successfully", {
        id: toastId,
        description: "Your account and all associated data have been permanently deleted.",
      })

      await signOut()

      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push("/")
      }, 1500)

    } catch (error) {
      console.error("Delete account error:", error)
      toast.error("Failed to delete account")
    } finally {
      setIsDeleting(false)
      setIsDialogOpen(false)
      setConfirmText("")
    }
  }

  return (
    <>
      <Card className="matte-panel border-destructive/20">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl text-destructive flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Once you delete your account, there is no going back. This will permanently delete:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-2">
              <li>Your profile and account information</li>
              <li>All uploaded datasets</li>
              <li>All trained models and their history</li>
              <li>All training logs and metadata</li>
            </ul>
          </div>

          <Button
            variant="destructive"
            onClick={() => setIsDialogOpen(true)}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-text" className="text-foreground">
                  Type <span className="font-semibold">delete my account</span> to confirm:
                </Label>
                <Input
                  id="confirm-text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="delete my account"
                  disabled={isDeleting}
                  className="font-mono"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting || confirmText.toLowerCase() !== "delete my account"}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}