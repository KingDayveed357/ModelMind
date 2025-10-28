"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { History, Eye, Trash2, Download } from "lucide-react"
import Link from "next/link"

const projects = [
  {
    id: 1,
    name: "Housing Price Analysis",
    model: "Multiple Regression",
    date: "2024-01-15",
    r2Score: 0.87,
    status: "completed",
  },
  {
    id: 2,
    name: "Sales Forecast Model",
    model: "Polynomial Regression",
    date: "2024-01-14",
    r2Score: 0.92,
    status: "completed",
  },
  {
    id: 3,
    name: "Stock Price Prediction",
    model: "SVR",
    date: "2024-01-13",
    r2Score: 0.78,
    status: "completed",
  },
]

export default function HistoryPage() {
  const handleExportAll = () => {
    const data = {
      projects,
      exportDate: new Date().toISOString(),
      totalProjects: projects.length,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `regresslab-history-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportProject = (project: (typeof projects)[0]) => {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${project.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 sm:gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-normal">Project History</h1>
            <p className="text-sm sm:text-base text-muted-foreground">View and manage your past regression projects</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-transparent transition-smooth w-full sm:w-auto"
            onClick={handleExportAll}
          >
            <Download className="w-4 h-4" />
            Export All
          </Button>
        </div>

        {/* Projects List */}
        <div className="space-y-3 sm:space-y-4">
          {projects.map((project) => (
            <Card key={project.id} className="glass transition-smooth hover:shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <History className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base">{project.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[10px] sm:text-xs">
                          {project.model}
                        </Badge>
                        <span className="text-[10px] sm:text-xs text-muted-foreground">{project.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 pl-13 sm:pl-16">
                    <div className="text-left">
                      <p className="text-xs sm:text-sm text-muted-foreground">R² Score</p>
                      <p className="text-base sm:text-lg font-semibold">{project.r2Score}</p>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button variant="outline" size="icon" className="bg-transparent h-8 w-8 sm:h-10 sm:w-10" asChild>
                        <Link href={`/dashboard/models/${project.id}`}>
                          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-transparent h-8 w-8 sm:h-10 sm:w-10"
                        onClick={() => handleExportProject(project)}
                      >
                        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-transparent text-destructive hover:text-destructive h-8 w-8 sm:h-10 sm:w-10"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
