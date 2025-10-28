// "use client"

// import { useEffect, useState } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Label } from "@/components/ui/label"
// import { Database, AlertCircle, Loader2 } from "lucide-react"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { useAuth } from "@/hooks/use-auth"

// interface Dataset {
//   id: string
//   user_id: string
//   name: string
//   file_url: string
//   uploaded_at: string
//   rows: number | null
//   columns: number | null
//   has_missing: boolean | null
//   metadata: {
//     feature_names?: string[]
//     numeric_features?: string[]
//     categorical_features?: string[]
//     warnings?: any[]
//   } | null
// }

// interface DatasetSelectorProps {
//   dataset: string | null
//   targetColumn: string | null
//   onDatasetChange: (value: string) => void
//   onTargetChange: (value: string) => void
// }

// export function DatasetSelector({ 
//   dataset, 
//   targetColumn, 
//   onDatasetChange, 
//   onTargetChange 
// }: DatasetSelectorProps) {
//   const { supabase, user, loading: authLoading } = useAuth()
//   const [datasets, setDatasets] = useState<Dataset[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [availableColumns, setAvailableColumns] = useState<string[]>([])

//   // Fetch datasets when component mounts or user changes
//   useEffect(() => {
//     if (!authLoading && user) {
//       fetchDatasets()
//     } else if (!authLoading && !user) {
//       setLoading(false)
//       setError("Please sign in to view your datasets")
//     }
//   }, [user, authLoading])

//   // Update available columns when dataset selection changes
//   useEffect(() => {
//     if (dataset) {
//       const selectedDataset = datasets.find(d => d.id === dataset)
//       if (selectedDataset?.metadata?.feature_names) {
//         setAvailableColumns(selectedDataset.metadata.feature_names)
//       } else {
//         setAvailableColumns([])
//       }
//     } else {
//       setAvailableColumns([])
//     }
//   }, [dataset, datasets])

//   const fetchDatasets = async () => {
//     try {
//       setLoading(true)
//       setError(null)

//       const { data, error: fetchError } = await supabase
//         .from('datasets')
//         .select('*')
//         .eq('user_id', user!.id)
//         .order('uploaded_at', { ascending: false })

//       if (fetchError) {
//         throw new Error(fetchError.message)
//       }

//       setDatasets(data || [])
//     } catch (err) {
//       console.error('Error fetching datasets:', err)
//       setError(err instanceof Error ? err.message : 'Failed to load datasets')
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Format date for display
//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     })
//   }

//   // Loading state
//   if (authLoading || loading) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Database className="h-5 w-5" />
//             Dataset Selection
//           </CardTitle>
//           <CardDescription>Choose your dataset and target column</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center justify-center py-8">
//             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
//           </div>
//         </CardContent>
//       </Card>
//     )
//   }

//   // Error state
//   if (error) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Database className="h-5 w-5" />
//             Dataset Selection
//           </CardTitle>
//           <CardDescription>Choose your dataset and target column</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Alert variant="destructive">
//             <AlertCircle className="h-4 w-4" />
//             <AlertDescription>{error}</AlertDescription>
//           </Alert>
//         </CardContent>
//       </Card>
//     )
//   }

//   // Empty state
//   if (datasets.length === 0) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Database className="h-5 w-5" />
//             Dataset Selection
//           </CardTitle>
//           <CardDescription>Choose your dataset and target column</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Alert>
//             <AlertCircle className="h-4 w-4" />
//             <AlertDescription>
//               No datasets found. Please upload a dataset first from the Datasets page.
//             </AlertDescription>
//           </Alert>
//         </CardContent>
//       </Card>
//     )
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <Database className="h-5 w-5" />
//           Dataset Selection
//         </CardTitle>
//         <CardDescription>Choose your dataset and target column</CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         {/* Dataset Selection */}
//         <div className="space-y-2">
//           <Label htmlFor="dataset">Dataset</Label>
//           <Select value={dataset || ""} onValueChange={onDatasetChange}>
//             <SelectTrigger id="dataset">
//               <SelectValue placeholder="Select a dataset" />
//             </SelectTrigger>
//             <SelectContent>
//               {datasets.map((ds) => (
//                 <SelectItem key={ds.id} value={ds.id}>
//                   <div className="flex flex-col items-start">
//                     <span className="font-medium">{ds.name}</span>
//                     <span className="text-xs text-muted-foreground">
//                       {ds.rows ? `${ds.rows.toLocaleString()} rows` : 'N/A'} × {ds.columns ? `${ds.columns} columns` : 'N/A'} · {formatDate(ds.uploaded_at)}
//                     </span>
//                   </div>
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Target Column Selection */}
//         <div className="space-y-2">
//           <Label htmlFor="target">Target Column</Label>
//           <Select 
//             value={targetColumn || ""} 
//             onValueChange={onTargetChange}
//             disabled={!dataset || availableColumns.length === 0}
//           >
//             <SelectTrigger id="target">
//               <SelectValue placeholder={
//                 !dataset 
//                   ? "Select a dataset first" 
//                   : availableColumns.length === 0 
//                     ? "No columns available" 
//                     : "Select target column"
//               } />
//             </SelectTrigger>
//             <SelectContent>
//               {availableColumns.map((col) => (
//                 <SelectItem key={col} value={col}>
//                   {col}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Dataset Info & Warnings */}
//         {dataset && (() => {
//           const selectedDataset = datasets.find(d => d.id === dataset)
//           if (!selectedDataset) return null

//           return (
//             <div className="space-y-2 pt-2 border-t">
//               {/* Missing Values Warning */}
//               {selectedDataset.has_missing && (
//                 <Alert>
//                   <AlertCircle className="h-4 w-4" />
//                   <AlertDescription className="text-xs">
//                     This dataset contains missing values. They will be handled automatically during preprocessing.
//                   </AlertDescription>
//                 </Alert>
//               )}

//               {/* Additional Warnings from Metadata */}
//               {selectedDataset.metadata?.warnings && 
//                selectedDataset.metadata.warnings.length > 0 && (
//                 <div className="space-y-1">
//                   {selectedDataset.metadata.warnings.slice(0, 2).map((warning: any, idx: number) => (
//                     <Alert key={idx} variant="default">
//                       <AlertCircle className="h-4 w-4" />
//                       <AlertDescription className="text-xs">
//                         {warning.message}
//                       </AlertDescription>
//                     </Alert>
//                   ))}
//                 </div>
//               )}

//               {/* Feature Type Info */}
//               {selectedDataset.metadata && (
//                 <div className="text-xs text-muted-foreground space-y-1">
//                   {selectedDataset.metadata.numeric_features && (
//                     <div>
//                       <span className="font-medium">Numeric features:</span> {selectedDataset.metadata.numeric_features.length}
//                     </div>
//                   )}
//                   {selectedDataset.metadata.categorical_features && (
//                     <div>
//                       <span className="font-medium">Categorical features:</span> {selectedDataset.metadata.categorical_features.length}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           )
//         })()}
//       </CardContent>
//     </Card>
//   )
// }


// components/train/dataset-selector.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Database, AlertCircle, Loader2, CheckCircle2, AlertTriangle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { trainingService, type TargetAnalysis } from "@/lib/services/training-service"
import { Badge } from "@/components/ui/badge"

interface Dataset {
  id: string
  user_id: string
  name: string
  file_url: string
  uploaded_at: string
  rows: number | null
  columns: number | null
  has_missing: boolean | null
  metadata: {
    feature_names?: string[]
    numeric_features?: string[]
    categorical_features?: string[]
    warnings?: any[]
  } | null
}

interface DatasetSelectorProps {
  dataset: string | null
  targetColumn: string | null
  problemType: "regression" | "classification" | "auto"
  onDatasetChange: (value: string) => void
  onTargetChange: (value: string) => void
  onProblemTypeRecommendation?: (type: "regression" | "classification") => void
}

export function DatasetSelector({ 
  dataset, 
  targetColumn,
  problemType,
  onDatasetChange, 
  onTargetChange,
  onProblemTypeRecommendation
}: DatasetSelectorProps) {
  const { supabase, user, loading: authLoading } = useAuth()
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [availableColumns, setAvailableColumns] = useState<string[]>([])
  const [targetAnalysis, setTargetAnalysis] = useState<TargetAnalysis | null>(null)
  const [analyzingTarget, setAnalyzingTarget] = useState(false)

  // Fetch datasets when component mounts or user changes
  useEffect(() => {
    if (!authLoading && user) {
      fetchDatasets()
    } else if (!authLoading && !user) {
      setLoading(false)
      setError("Please sign in to view your datasets")
    }
  }, [user, authLoading])

  // Update available columns when dataset selection changes
  useEffect(() => {
    if (dataset) {
      const selectedDataset = datasets.find(d => d.id === dataset)
      if (selectedDataset?.metadata?.feature_names) {
        setAvailableColumns(selectedDataset.metadata.feature_names)
      } else {
        setAvailableColumns([])
      }
    } else {
      setAvailableColumns([])
    }
  }, [dataset, datasets])

  // Analyze target column when it changes
  useEffect(() => {
    if (dataset && targetColumn) {
      analyzeTargetColumn()
    } else {
      setTargetAnalysis(null)
    }
  }, [dataset, targetColumn])

  const fetchDatasets = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('datasets')
        .select('*')
        .eq('user_id', user!.id)
        .order('uploaded_at', { ascending: false })

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      setDatasets(data || [])
    } catch (err) {
      console.error('Error fetching datasets:', err)
      setError(err instanceof Error ? err.message : 'Failed to load datasets')
    } finally {
      setLoading(false)
    }
  }

  const analyzeTargetColumn = async () => {
    if (!dataset || !targetColumn) return

    try {
      setAnalyzingTarget(true)
      const analysis = await trainingService.analyzeTarget(dataset, targetColumn)
      setTargetAnalysis(analysis)
      
      // Auto-recommend problem type if in auto mode
      if (problemType === "auto" && onProblemTypeRecommendation) {
        onProblemTypeRecommendation(analysis.recommended_problem_type)
      }
    } catch (err) {
      console.error('Error analyzing target:', err)
      setTargetAnalysis(null)
    } finally {
      setAnalyzingTarget(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error": return <AlertCircle className="h-4 w-4" />
      case "warning": return <AlertTriangle className="h-4 w-4" />
      case "info": return <Info className="h-4 w-4" />
      default: return <CheckCircle2 className="h-4 w-4" />
    }
  }

  const getAlertVariant = (type: string): "default" | "destructive" => {
    return type === "error" ? "destructive" : "default"
  }

  // Loading state
  if (authLoading || loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Dataset Selection
          </CardTitle>
          <CardDescription>Choose your dataset and target column</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Dataset Selection
          </CardTitle>
          <CardDescription>Choose your dataset and target column</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (datasets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Dataset Selection
          </CardTitle>
          <CardDescription>Choose your dataset and target column</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No datasets found. Please upload a dataset first from the Datasets page.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Check for problem type mismatch
  const hasProblemTypeMismatch = targetAnalysis && 
    problemType !== "auto" && 
    problemType !== targetAnalysis.recommended_problem_type

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Dataset Selection
        </CardTitle>
        <CardDescription>Choose your dataset and target column</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dataset Selection */}
        <div className="space-y-2">
          <Label htmlFor="dataset">Dataset</Label>
          <Select value={dataset || ""} onValueChange={onDatasetChange}>
            <SelectTrigger id="dataset">
              <SelectValue placeholder="Select a dataset" />
            </SelectTrigger>
            <SelectContent>
              {datasets.map((ds) => (
                <SelectItem key={ds.id} value={ds.id}>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{ds.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {ds.rows ? `${ds.rows.toLocaleString()} rows` : 'N/A'} × {ds.columns ? `${ds.columns} columns` : 'N/A'} · {formatDate(ds.uploaded_at)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Target Column Selection */}
        <div className="space-y-2">
          <Label htmlFor="target">Target Column</Label>
          <Select 
            value={targetColumn || ""} 
            onValueChange={onTargetChange}
            disabled={!dataset || availableColumns.length === 0}
          >
            <SelectTrigger id="target">
              <SelectValue placeholder={
                !dataset 
                  ? "Select a dataset first" 
                  : availableColumns.length === 0 
                    ? "No columns available" 
                    : "Select target column"
              } />
            </SelectTrigger>
            <SelectContent>
              {availableColumns.map((col) => (
                <SelectItem key={col} value={col}>
                  {col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Target Analysis Loading */}
        {analyzingTarget && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription className="text-xs">
              Analyzing target column...
            </AlertDescription>
          </Alert>
        )}

        {/* Target Analysis Results */}
        {targetAnalysis && !analyzingTarget && (
          <div className="space-y-3 pt-2 border-t">
            {/* Recommended Problem Type */}
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle className="text-sm font-medium">Analysis Complete</AlertTitle>
              <AlertDescription className="text-xs space-y-2">
                <div className="flex items-center gap-2 mt-2">
                  <span>Recommended:</span>
                  <Badge variant={targetAnalysis.recommended_problem_type === "regression" ? "default" : "secondary"}>
                    {targetAnalysis.recommended_problem_type}
                  </Badge>
                </div>
                <div className="text-muted-foreground">
                  {targetAnalysis.recommendations.message}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div><span className="font-medium">Samples:</span> {targetAnalysis.statistics.n_samples.toLocaleString()}</div>
                  <div><span className="font-medium">Unique:</span> {targetAnalysis.statistics.n_unique}</div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Problem Type Mismatch Warning */}
            {hasProblemTypeMismatch && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-sm font-medium">Problem Type Mismatch</AlertTitle>
                <AlertDescription className="text-xs">
                  You selected <strong>{problemType}</strong> but the data suggests <strong>{targetAnalysis.recommended_problem_type}</strong>. 
                  Training may fail or produce poor results. Consider switching to {targetAnalysis.recommended_problem_type} or using Auto mode.
                </AlertDescription>
              </Alert>
            )}

            {/* Warnings from Analysis */}
            {targetAnalysis.warnings.map((warning, idx) => (
              <Alert key={idx} variant={getAlertVariant(warning.type)}>
                {getAlertIcon(warning.type)}
                <AlertDescription className="text-xs">
                  {warning.message}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Dataset Info & Warnings */}
        {dataset && (() => {
          const selectedDataset = datasets.find(d => d.id === dataset)
          if (!selectedDataset) return null

          return (
            <div className="space-y-2 pt-2 border-t">
              {/* Missing Values Warning */}
              {selectedDataset.has_missing && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    This dataset contains missing values. They will be handled automatically during preprocessing.
                  </AlertDescription>
                </Alert>
              )}

              {/* Feature Type Info */}
              {selectedDataset.metadata && !targetAnalysis && (
                <div className="text-xs text-muted-foreground space-y-1">
                  {selectedDataset.metadata.numeric_features && (
                    <div>
                      <span className="font-medium">Numeric features:</span> {selectedDataset.metadata.numeric_features.length}
                    </div>
                  )}
                  {selectedDataset.metadata.categorical_features && (
                    <div>
                      <span className="font-medium">Categorical features:</span> {selectedDataset.metadata.categorical_features.length}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })()}
      </CardContent>
    </Card>
  )
}