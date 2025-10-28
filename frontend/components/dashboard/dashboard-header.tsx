"use client"

import { Button } from "@/components/ui/button"
import { Menu, Bell } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface DashboardHeaderProps {
  onMenuClick: () => void
}

const notifications = [
  {
    id: 1,
    title: "Model Training Complete",
    description: "Linear Regression model finished training",
    time: "2 min ago",
    read: false,
  },
  {
    id: 2,
    title: "New Dataset Uploaded",
    description: "housing_data.csv has been processed",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    title: "Prediction Ready",
    description: "Your prediction results are available",
    time: "3 hours ago",
    read: true,
  },
]

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background">
      <div className="flex items-center justify-between h-full px-6 lg:px-8">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="w-5 h-5" />
        </Button>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount} new
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-4 cursor-pointer">
                    <div className="flex items-start justify-between w-full gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                      </div>
                      {!notification.read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />}
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-sm text-primary cursor-pointer">
                Mark all as read
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
