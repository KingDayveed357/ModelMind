
// app/dashboard/history/page.tsx 
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import {
  Search,
  Eye,
  Download,
  Trash2,
  TrendingUp,
  Database,
  Award,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import {toast} from "sonner"
import { modelService, type Model, type ModelFilters, type ModelSummary } from "@/lib/services/model-service"
import { format } from "date-fns"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Summary Card Skeleton
function SummaryCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="w-12 h-12 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}

// Table Row Skeleton
function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </TableCell>
    </TableRow>
  )
}

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([])
  const [summary, setSummary] = useState<ModelSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [problemTypeFilter, setProblemTypeFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("created_at")
  const [sortOrder] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [totalModels, setTotalModels] = useState(0)
  const [deleteModelId, setDeleteModelId] = useState<string | null>(null)
  const [deletingModel, setDeletingModel] = useState(false)
  const [hasInitialLoad, setHasInitialLoad] = useState(false)

  const pageSize = 10

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1) // Reset to page 1 on search
    }, 300) // Reduced to 300ms for better responsiveness

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Load models
const loadModels = useCallback(async () => {
  // const toastId = toast.loading("Loading models...")
  try {
    setLoading(true)
    
    // Build filters
    const filters: ModelFilters = {}
    
    // Add problem type filter
    if (problemTypeFilter !== "all") {
      filters.problem_type = problemTypeFilter as "regression" | "classification"
    }
    
    const response = await modelService.listModels(
      { ...filters, search: debouncedSearch },
      { sort_by: sortBy as any, sort_order: sortOrder },
      page,
      pageSize
    )

    setModels(response.data.models)
    setTotalModels(response.data.total)
    setSummary(response.data.summary)
    
    if (!hasInitialLoad) {
      setHasInitialLoad(true)
    }

    // Dismiss loading toast on success
    // toast.dismiss(toastId)
    
  } catch (error) {
    console.error("Load models error:", error)
    toast.error("Failed to load models", {
      description: error instanceof Error ? error.message : "Failed to load models",
    })
  } finally {
    setLoading(false)
  }
}, [problemTypeFilter, debouncedSearch, sortBy, sortOrder, page, pageSize, hasInitialLoad])

  useEffect(() => {
    loadModels()
  }, [loadModels])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [problemTypeFilter, sortBy])

  // Handle delete
  const handleDelete = async () => {
    if (!deleteModelId) return
    const toastId = toast.loading("Deleting model...")
    try {
      setDeletingModel(true)
      
    

      await modelService.deleteModel(deleteModelId)
      
      toast.success("Model deleted successfully", {
        id: toastId,
      })

      setDeleteModelId(null)
      loadModels()
    } catch (error) {
      toast.error("Failed to delete model", {
        id: toastId,
        description: error instanceof Error ? error.message : "Something went wrong, Retry",
      })
    } finally {
      setDeletingModel(false)
    }
  }

  // Handle export
  const handleExport = async (modelId: string, modelName: string) => {
     const toastId = toast.loading("Preparing download...", {
        description: "Your model file will download shortly",
      })
    try {

      const blob = await modelService.exportModel(modelId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${modelName}.pkl`
      a.click()
      URL.revokeObjectURL(url)

      toast.success("success", {
        id: toastId,
        description: "Model exported successfully",
      })
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Export failed", {
        id: toastId,
        description: error instanceof Error ? error.message : "Failed to export model",
      })
    }
  }

  // Format metrics
  const formatMetric = useCallback((model: Model) => {
    if (model.problem_type === "regression") {
      const r2 = model.metrics.r2_score
      return r2 !== undefined ? `R² ${r2.toFixed(3)}` : "N/A"
    } else {
      const acc = model.metrics.accuracy
      return acc !== undefined ? `Acc ${(acc * 100).toFixed(1)}%` : "N/A"
    }
  }, [])

  const getMetricColor = useCallback((model: Model) => {
    if (model.problem_type === "regression") {
      const r2 = model.metrics.r2_score || 0
      if (r2 > 0.8) return "text-green-600"
      if (r2 > 0.6) return "text-yellow-600"
      return "text-red-600"
    } else {
      const acc = model.metrics.accuracy || 0
      if (acc > 0.9) return "text-green-600"
      if (acc > 0.75) return "text-yellow-600"
      return "text-red-600"
    }
  }, [])

  const totalPages = useMemo(() => Math.ceil(totalModels / pageSize), [totalModels, pageSize])

  // Determine valid sort options based on problem type filter
  const validSortOptions = useMemo(() => {
    if (problemTypeFilter === "regression") {
      return [
        { value: "created_at", label: "Most Recent" },
        { value: "model_name", label: "Name" },
        { value: "metrics.r2_score", label: "Best R²" },
      ]
    } else if (problemTypeFilter === "classification") {
      return [
        { value: "created_at", label: "Most Recent" },
        { value: "model_name", label: "Name" },
        { value: "metrics.accuracy", label: "Best Accuracy" },
      ]
    } else {
      return [
        { value: "created_at", label: "Most Recent" },
        { value: "model_name", label: "Name" },
      ]
    }
  }, [problemTypeFilter])

  // Auto-adjust sort if invalid
  useEffect(() => {
    const isValidSort = validSortOptions.some(opt => opt.value === sortBy)
    if (!isValidSort) {
      setSortBy("created_at")
    }
  }, [validSortOptions, sortBy])

  // Show "no models" only after initial load completes
  const showNoModels = hasInitialLoad && !loading && summary?.total_models === 0 && !debouncedSearch
  const showNoResults = hasInitialLoad && !loading && models.length === 0 && (debouncedSearch || problemTypeFilter !== "all")

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 sm:gap-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal">Model Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            View, manage, and export your trained machine learning models
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {!hasInitialLoad ? (
            <>
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
            </>
          ) : summary ? (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-muted-foreground">Total Models</p>
                      <p className="text-2xl font-semibold">{summary.total_models}</p>
                      <p className="text-xs text-muted-foreground">
                        {summary.regression_count}R / {summary.classification_count}C
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Database className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-muted-foreground">Avg Performance</p>
                      <p className="text-2xl font-semibold">
                        {summary.avg_r2
                          ? `${(summary.avg_r2 * 100).toFixed(1)}%`
                          : summary.avg_accuracy
                          ? `${(summary.avg_accuracy * 100).toFixed(1)}%`
                          : "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {summary.avg_r2 ? "R² Score" : summary.avg_accuracy ? "Accuracy" : "No metrics"}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-muted-foreground">Most Used</p>
                      <p className="text-lg font-semibold truncate max-w-[120px]" title={summary.most_used_dataset || "N/A"}>
                        {summary.most_used_dataset || "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground">Dataset</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
                      <Database className="w-6 h-6 text-chart-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-muted-foreground">Best Model</p>
                      <p className="text-lg font-semibold truncate max-w-[120px]" title={summary.best_performing_model?.model_name || "None"}>
                        {summary.best_performing_model?.model_name || "None"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {summary.best_performing_model
                          ? formatMetric(summary.best_performing_model)
                          : "No models"}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center">
                      <Award className="w-6 h-6 text-chart-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search models by name, type, target, or dataset..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select
                  value={problemTypeFilter}
                  onValueChange={(value) => {
                    setProblemTypeFilter(value)
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Problem Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="regression">Regression Only</SelectItem>
                    <SelectItem value="classification">Classification Only</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    {validSortOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <p className="text-xs text-muted-foreground">
                💡 Tip: Filter by type first to unlock metric-based sorting (R² or Accuracy)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Models Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Models 
                  {loading ? (
                    <Skeleton className="h-6 w-12 inline-block" />
                  ) : (
                    <span>({totalModels})</span>
                  )}
                </CardTitle>
                <CardDescription>
                  Export downloads a .pkl file with trained model and preprocessor
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRowSkeleton key={i} />
                  ))}
                </TableBody>
              </Table>
            ) : showNoModels ? (
              <div className="text-center py-12">
                <Database className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No models yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Train your first model to get started with machine learning
                </p>
                <Button asChild>
                  <Link href="/dashboard/train">Train Your First Model</Link>
                </Button>
              </div>
            ) : showNoResults ? (
              <div className="text-center py-12">
                <Alert className="max-w-md mx-auto">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No models match your filters. Try adjusting your search or filters.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Model Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {models.map((model) => (
                        <TableRow key={model.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{model.model_name}</span>
                              <span className="text-xs text-muted-foreground">
                                {(model as any).dataset_name || "Unknown Dataset"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge variant="secondary" className="text-xs w-fit">
                                {model.model_type}
                              </Badge>
                              <Badge variant="outline" className="text-xs w-fit">
                                {model.problem_type}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{model.target_column}</TableCell>
                          <TableCell>
                            <span className={`font-semibold ${getMetricColor(model)}`}>
                              {formatMetric(model)}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(model.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="outline" size="icon" asChild className="h-8 w-8">
                                <Link href={`/dashboard/models/${model.id}`}>
                                  <Eye className="w-4 h-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleExport(model.id, model.model_name)}
                                title="Export model as .pkl file"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => setDeleteModelId(model.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Delete Dialog */}
        <AlertDialog open={!!deleteModelId} onOpenChange={() => setDeleteModelId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Model</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the model file and all associated data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deletingModel}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deletingModel}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deletingModel ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}
