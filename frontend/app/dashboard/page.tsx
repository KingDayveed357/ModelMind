"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardHeader } from "@/components/overview/header-section"
import { MetricsGrid } from "@/components/overview/metrics-grid"
import { RecentModels } from "@/components/overview/recent-models"
import { QuickActions } from "@/components/overview/quick-actions"
import { ErrorState } from "@/components/overview/error-state"
import { DashboardSkeleton } from "@/components/overview/dashboard-skeleton"
import { modelService } from "@/lib/services/model-service"
import type { Model, ModelSummary } from "@/lib/services/model-service"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<ModelSummary | null>(null)
  const [recentModels, setRecentModels] = useState<Model[]>([])
  const [totalDatasets, setTotalDatasets] = useState(0)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await modelService.listModels(
        {},
        { sort_by: "created_at", sort_order: "desc" },
        1,
        100
      )

      const { models, summary: summaryData } = response.data

      setSummary(summaryData)
      setRecentModels(models.slice(0, 3))

      const uniqueDatasets = new Set(models.map(m => m.dataset_id).filter(Boolean))
      setTotalDatasets(uniqueDatasets.size)
    } catch (err) {
      console.error("Dashboard error:", err)
      setError((err as Error).message || "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState error={error} onRetry={loadDashboardData} />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 sm:gap-8">
        <DashboardHeader />
        
        {loading ? (
          <DashboardSkeleton />
        ) : (
          <MetricsGrid 
            summary={summary}
            recentModels={recentModels}
            totalDatasets={totalDatasets}
          />
        )}

        <RecentModels models={recentModels} loading={loading} />

        <QuickActions />
      </div>
    </DashboardLayout>
  )
}
