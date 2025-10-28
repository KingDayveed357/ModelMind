"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, X, User, Settings, LogOut } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { signOut } from "@/lib/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getUserInitials, getUserDisplayName } from "@/lib/user-utils"

// Skeleton Loader Components
function AuthButtonsSkeleton() {
  return (
    <div className="hidden md:flex items-center gap-3 animate-pulse">
      <div className="w-14 h-9 rounded-md bg-muted" />
      <div className="w-20 h-9 rounded-md bg-muted" />
    </div>
  )
}

function UserAvatarSkeleton() {
  return (
    <div className="hidden md:flex items-center gap-3 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-muted" />
    </div>
  )
}

function MobileAuthSkeleton() {
  return (
    <div className="flex md:hidden items-center gap-3 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-muted" />
    </div>
  )
}

// Helper function to get user initials
// function getUserInitials(user: any) {
//   if (!user) return "US"
  
//   const fullName = user.user_metadata?.full_name || user.user_metadata?.name || ""
//   const email = user.email || ""
  
//   if (fullName) {
//     return fullName
//       .split(' ')
//       .map((name: string) => name.charAt(0))
//       .join('')
//       .toUpperCase()
//       .slice(0, 2)
//   }
  
//   if (email) {
//     return email
//       .split('@')[0]
//       .slice(0, 2)
//       .toUpperCase()
//   }
  
//   return "US"
// }

// Logout Component
interface LogoutButtonProps {
  onLogout: () => void
  isLoading?: boolean
}

function LogoutButton({ onLogout, isLoading = false }: LogoutButtonProps) {

  return (

    <DropdownMenuItem 
      className="text-destructive focus:text-destructive cursor-pointer flex items-center"
      onClick={onLogout}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 mr-2 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
          <span>Logging out...</span>
        </>
      ) : (
        <>
          <LogOut className="w-4 h-4 mr-2" />
          <span>Logout</span>
        </>
      )}
    </DropdownMenuItem>
  )
}

// User Profile Dropdown Component
interface UserProfileDropdownProps {
  user: any
  onLogout: () => void
  isLoggingOut?: boolean
}

function UserProfileDropdown({ user, onLogout, isLoggingOut = false }: UserProfileDropdownProps) {
  const userInitials = getUserInitials(user)
  const userName = user.user_metadata?.full_name || user.user_metadata?.name || "User"
  const userEmail = user.email

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="animate-slide-in rounded-full w-8 h-8 bg-primary/10 hover:bg-primary/20 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="User menu"
        >
          <span className="text-xs font-medium text-primary">
            {userInitials}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer flex items-center">
            <User className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings" className="cursor-pointer flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <LogoutButton onLogout={onLogout} isLoading={isLoggingOut} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Mobile User Profile Component
interface MobileUserProfileProps {
  user: any
  onLogout: () => void
  onNavigate: () => void
  isLoggingOut?: boolean
}

function MobileUserProfile({ user, onLogout, onNavigate, isLoggingOut = false }: MobileUserProfileProps) {
  const userInitials = getUserInitials(user)
  const userName = user.user_metadata?.full_name || user.user_metadata?.name || "User"
  const userEmail = user.email

  return (
    <>
      <div className="flex items-center gap-3 px-2 py-3 animate-slide-in">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-medium text-primary">
            {userInitials}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{userName}</p>
          <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
        </div>
      </div>
      <Button size="sm" className="w-full animate-slide-in" asChild onClick={onNavigate}>
        <Link href="/dashboard" className="flex items-center gap-2 justify-center">
          <User className="w-4 h-4" />
          Dashboard
        </Link>
      </Button>
      <Button variant="ghost" size="sm" className="w-full animate-slide-in" asChild onClick={onNavigate}>
        <Link href="/dashboard/settings" className="flex items-center gap-2 justify-center">
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full text-destructive hover:text-destructive animate-slide-in flex items-center gap-2 justify-center"
        onClick={onLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <>
            <div className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
            <span>Logging out...</span>
          </>
        ) : (
          <>
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </>
        )}
      </Button>
    </>
  )
}

// Main Header Component
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { user, loading } = useAuth()

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await signOut()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
      setMobileMenuOpen(false)
    }
  }

  const handleMobileNavigate = () => {
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-fade-in">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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
              <span className="text-lg font-semibold text-foreground">RegressLab</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="#features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
              >
                Features
              </Link>
              <Link
                href="#models"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
              >
                Models
              </Link>
              <Link
                href="#docs"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
              >
                Docs
              </Link>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            
            {loading ? (
              <UserAvatarSkeleton />
            ) : user ? (
              <UserProfileDropdown 
                user={user} 
                onLogout={handleLogout}
                isLoggingOut={isLoggingOut}
              />
            ) : (
              <>
                <Button variant="ghost" size="sm" className="animate-slide-in" asChild>
                  <Link href="/sign-in">Sign in</Link>
                </Button>
                <Button size="sm" className="animate-slide-in" asChild>
                  <Link href="/sign-up">Get started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            
            {loading ? (
              <MobileAuthSkeleton />
            ) : user ? (
              <UserProfileDropdown 
                user={user} 
                onLogout={handleLogout}
                isLoggingOut={isLoggingOut}
              />
            ) : null}
            
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              disabled={loading}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 animate-rotate-in" />
              ) : (
                <Menu className="w-5 h-5 animate-fade-in" />
              )}
            </Button>
          </div>
        </nav>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/40 animate-slide-down">
            <div className="flex flex-col gap-4">
              <Link
                href="#features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2 animate-slide-in"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#models"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2 animate-slide-in"
                onClick={() => setMobileMenuOpen(false)}
              >
                Models
              </Link>
              <Link
                href="#docs"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2 animate-slide-in"
                onClick={() => setMobileMenuOpen(false)}
              >
                Docs
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-border/40">
                {loading ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-9 bg-muted rounded" />
                    <div className="h-9 bg-muted rounded" />
                  </div>
                ) : user ? (
                  <MobileUserProfile 
                    user={user}
                    onLogout={handleLogout}
                    onNavigate={handleMobileNavigate}
                    isLoggingOut={isLoggingOut}
                  />
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="w-full justify-start animate-slide-in" asChild>
                      <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                        Sign in
                      </Link>
                    </Button>
                    <Button size="sm" className="w-full animate-slide-in" asChild>
                      <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                        Get started
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}