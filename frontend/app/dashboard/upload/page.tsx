"use client"

import { useState, useCallback } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, X, CheckCircle2, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { apiRequest } from "@/lib/api-client"
// import { useToast } from "@/hooks/use-toast"
import { toast } from "sonner"

interface UploadedFile {
  name: string
  size: number
  rows?: number
  columns?: number
  preview?: string[][]
}

export default function UploadDataPage() {
  const [file, setFile] = useState<UploadedFile | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [datasetName, setDatasetName] = useState("")
  const [uploading, setUploading] = useState(false)
  // const { toast } = useToast()

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === "dragenter" || e.type === "dragover")
  }, [])

  // Drop handler
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0])
  }

  // File reader and preview
  const handleFile = (uploadedFile: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split("\n").slice(0, 6)
      const preview = lines.map((line) => line.split(","))

      setFile({
        name: uploadedFile.name,
        size: uploadedFile.size,
        rows: 150, // simulated stats
        columns: preview[0]?.length || 0,
        preview,
      })
      setSelectedFile(uploadedFile)
      setDatasetName(uploadedFile.name.replace(".csv", ""))
    }
    reader.readAsText(uploadedFile)
  }

  // Upload logic (real API call)
  const handleUpload = async () => {
    if (!selectedFile) return
    setUploading(true)

    const toastId = toast.loading("Uploading dataset...")

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const res = await apiRequest<{ message: string }>("/datasets/upload", {
        method: "POST",
        body: formData,
      })

      console.log("✅ Upload successful:", res)
       toast.success("Dataset uploaded successfully!", {
        id: toastId,
        description: "Your data is now ready for analysis."
      })

      // reset state
      setFile(null)
      setSelectedFile(null)
      setDatasetName("")
    } catch (err: any) {
      console.error("❌ Upload failed:", err)
      toast.error("Upload failed", {
        id: toastId,
        description: err.message || "An unexpected error occurred during upload."
      })
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 sm:gap-8 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-serif font-normal">Upload Data</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Import your CSV dataset to start regression analysis
          </p>
        </div>

        {/* Upload Section */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Dataset Upload</CardTitle>
            <CardDescription className="text-sm">Drag and drop your CSV file or click to browse</CardDescription>
          </CardHeader>
          <CardContent>
            {!file ? (
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 sm:p-12 transition-smooth ${
                  dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-3 sm:gap-4 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-xs sm:text-sm font-medium">
                      <span className="text-primary">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">CSV files only (max 50MB)</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* File Info */}
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{file.name}</p>
                    <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                      <span>{formatFileSize(file.size)}</span>
                      {file.rows && <span>{file.rows} rows</span>}
                      {file.columns && <span>{file.columns} columns</span>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Data Preview */}
                {file.preview && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                      <h3 className="font-semibold text-xs sm:text-sm">Data Preview</h3>
                      <Badge variant="secondary" className="text-[10px] sm:text-xs">
                        First 5 rows
                      </Badge>
                    </div>
                    <div className="border border-border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs sm:text-sm">
                          <thead className="bg-muted">
                            <tr>
                              {file.preview[0]?.map((header, i) => (
                                <th key={i} className="px-3 py-2 text-left font-medium">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {file.preview.slice(1, 6).map((row, i) => (
                              <tr key={i}>
                                {row.map((cell, j) => (
                                  <td key={j} className="px-3 py-2">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dataset Name */}
                <div className="space-y-2">
                  <Label htmlFor="dataset-name" className="text-sm">
                    Dataset Name
                  </Label>
                  <Input
                    id="dataset-name"
                    placeholder="Enter a name for this dataset"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    className="text-sm"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleUpload}
                    disabled={!datasetName || uploading}
                    className="gap-2 transition-smooth"
                    size="sm"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload Dataset
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setFile(null)} size="sm">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Upload Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent mt-0.5" />
                <div>
                  <p className="font-medium text-sm">CSV Format Required</p>
                  <p className="text-xs text-muted-foreground">
                    Your file must be in CSV format with comma-separated values.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Include Headers</p>
                  <p className="text-xs text-muted-foreground">
                    The first row should contain column names for better analysis.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Numeric Data</p>
                  <p className="text-xs text-muted-foreground">
                    Regression analysis works best with numeric values.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-chart-4 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Clean Your Data</p>
                  <p className="text-xs text-muted-foreground">
                    Remove or handle missing values before uploading for best results.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
