"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Download, Share2, TrendingUp, Calendar, Database, Target } from "lucide-react"
import Link from "next/link"
import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

// Mock data
const scatterData = [
  { actual: 150, predicted: 145 },
  { actual: 200, predicted: 210 },
  { actual: 250, predicted: 245 },
  { actual: 300, predicted: 305 },
  { actual: 350, predicted: 340 },
  { actual: 400, predicted: 395 },
  { actual: 450, predicted: 460 },
  { actual: 500, predicted: 495 },
]

const residualData = [
  { index: 1, residual: -5 },
  { index: 2, residual: 10 },
  { index: 3, residual: -5 },
  { index: 4, residual: 5 },
  { index: 5, residual: -10 },
  { index: 6, residual: -5 },
  { index: 7, residual: 10 },
  { index: 8, residual: -5 },
]

const modelDetails = {
  id: "1",
  name: "Housing Price Prediction",
  type: "Multiple Regression",
  status: "completed",
  createdAt: "2024-01-15",
  dataset: "Housing Prices Dataset",
  targetVariable: "Price",
  features: ["Square Feet", "Bedrooms", "Bathrooms", "Location Score"],
  metrics: {
    r2Score: 0.87,
    rmse: 12.45,
    mae: 9.32,
    mse: 155.0,
  },
  parameters: {
    testSize: 20,
    randomState: 42,
    normalize: true,
  },
}

export default function ViewModelPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-serif font-normal">{modelDetails.name}</h1>
              <Badge variant="secondary">{modelDetails.type}</Badge>
            </div>
            <p className="text-muted-foreground">Detailed analysis and performance metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Model Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-muted-foreground">R² Score</p>
                  <p className="text-2xl font-semibold">{modelDetails.metrics.r2Score}</p>
                  <p className="text-xs text-accent">Excellent fit</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-muted-foreground">RMSE</p>
                  <p className="text-2xl font-semibold">{modelDetails.metrics.rmse}</p>
                  <p className="text-xs text-muted-foreground">Root Mean Squared Error</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-muted-foreground">MAE</p>
                  <p className="text-2xl font-semibold">{modelDetails.metrics.mae}</p>
                  <p className="text-xs text-muted-foreground">Mean Absolute Error</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-chart-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-lg font-semibold">{new Date(modelDetails.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs text-muted-foreground">Training date</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-chart-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Model Information</CardTitle>
                  <CardDescription>Configuration and metadata</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Model Type</span>
                      <span className="text-sm font-medium">{modelDetails.type}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Dataset</span>
                      <span className="text-sm font-medium">{modelDetails.dataset}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Target Variable</span>
                      <span className="text-sm font-medium">{modelDetails.targetVariable}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant="secondary">{modelDetails.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Model accuracy and error rates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">R² Score</span>
                      <span className="text-sm font-medium">{modelDetails.metrics.r2Score}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">RMSE</span>
                      <span className="text-sm font-medium">{modelDetails.metrics.rmse}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">MAE</span>
                      <span className="text-sm font-medium">{modelDetails.metrics.mae}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">MSE</span>
                      <span className="text-sm font-medium">{modelDetails.metrics.mse}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Features Used</CardTitle>
                <CardDescription>Input variables for prediction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {modelDetails.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visualizations" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Actual vs Predicted</CardTitle>
                <CardDescription>Scatter plot showing model predictions against actual values</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="actual" name="Actual" className="text-xs" />
                    <YAxis dataKey="predicted" name="Predicted" className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Scatter name="Predictions" data={scatterData} fill="hsl(var(--primary))" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Residual Plot</CardTitle>
                <CardDescription>Distribution of prediction errors</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={residualData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="index" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="residual"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parameters" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Training Parameters</CardTitle>
                <CardDescription>Configuration used during model training</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Test Size</span>
                    <span className="text-sm font-medium">{modelDetails.parameters.testSize}%</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Random State</span>
                    <span className="text-sm font-medium">{modelDetails.parameters.randomState}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Normalize</span>
                    <Badge variant="secondary">{modelDetails.parameters.normalize ? "Yes" : "No"}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Dataset Information</CardTitle>
                <CardDescription>Details about the training data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Database className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{modelDetails.dataset}</h4>
                    <p className="text-sm text-muted-foreground">1,000 rows • 5 columns • 45 KB</p>
                  </div>
                  <Button variant="outline" size="sm" asChild className="bg-transparent">
                    <Link href="/dashboard/upload">View Dataset</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
