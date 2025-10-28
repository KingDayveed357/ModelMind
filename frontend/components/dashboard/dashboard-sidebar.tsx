"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Upload,
  Brain,
  LineChart,
  TrendingUp,
  History,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  X,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { signOut } from "@/lib/auth"
import { getUserDisplayName, getUserInitials } from "@/lib/user-utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useCallback, useMemo, useState } from "react"

interface DashboardSidebarProps {
  open: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export function DashboardSidebar({
  open,
  onClose,
  collapsed,
  onToggleCollapse,
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { user, loading } = useAuth()

  const navigation = useMemo(
    () => [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Upload Data", href: "/dashboard/upload", icon: Upload },
      { name: "Train Model", href: "/dashboard/train", icon: Brain },
      { name: "Visualizations", href: "/dashboard/visualizations", icon: LineChart },
      { name: "Predictions", href: "/dashboard/predictions", icon: TrendingUp },
      { name: "History", href: "/dashboard/history", icon: History },
      { name: "AI Assistant", href: "/dashboard/assistant", icon: MessageSquare },
    ],
    []
  )

  const handleLogout = useCallback(async () => {
    try {
      setIsLoggingOut(true)
      await signOut()
      router.push("/sign-in")
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      setIsLoggingOut(false)
      setLogoutDialogOpen(false)
    }
  }, [router])

  // -------------------------------
  // Subcomponents
  // -------------------------------

  const SidebarLogo = () => (
    <Link
      href="/dashboard"
      className={cn(
        "flex items-center gap-2 transition-colors",
        collapsed && "justify-center"
      )}
      aria-label="RegressLab Home"
    >
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
        <svg
          width="20"
          height="20"
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
      {!collapsed && <span className="font-semibold">RegressLab</span>}
    </Link>
  )

  const SidebarNav = () => (
    <nav
      className={cn(
        "flex-1 px-4 py-6 space-y-1 overflow-y-auto",
        "scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/30"
      )}
    >
      {navigation.map(({ name, href, icon: Icon }) => {
        const isActive = pathname === href
        return (
          <Link
            key={name}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed && "justify-center"
            )}
            title={collapsed ? name : undefined}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{name}</span>}
          </Link>
        )
      })}
    </nav>
  )

  const SidebarUser = () => {
    if (loading) {
      return (
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            {!collapsed && (
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            )}
          </div>
        </div>
      )
    }

    if (!user) return null

    const initials = getUserInitials(user)
    const name = getUserDisplayName(user)
    const email = user.email

    return (
      <div className="p-4 border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full text-muted-foreground hover:text-foreground hover:bg-muted transition p-2 h-auto",
                collapsed ? "justify-center" : "justify-between"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">{initials}</span>
                </div>
                {!collapsed && (
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium truncate">{name}</p>
                    <p className="text-xs text-muted-foreground truncate">{email}</p>
                  </div>
                )}
              </div>
              {!collapsed && <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align={collapsed ? "start" : "end"} className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">{name}</p>
              <p className="text-xs text-muted-foreground">{email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => setLogoutDialogOpen(true)}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  // -------------------------------
  // MAIN RENDER
  // -------------------------------

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-card border-r border-border transition-all duration-300 ease-in-out hidden lg:flex flex-col",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <SidebarLogo />
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </Button>
        </div>
        <SidebarNav />
        <SidebarUser />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <SidebarLogo />
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <SidebarNav />
        <SidebarUser />
      </aside>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Ready to bounce? 🏀</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? Your regression models will miss you 😢
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setLogoutDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Stay Logged In
            </Button>
            <Button
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
