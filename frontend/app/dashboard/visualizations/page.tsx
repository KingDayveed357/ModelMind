"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useTheme } from "next-themes"

// Sample data for visualizations
const scatterData = [
  { x: 10, y: 12, predicted: 11 },
  { x: 20, y: 25, predicted: 23 },
  { x: 30, y: 35, predicted: 34 },
  { x: 40, y: 42, predicted: 45 },
  { x: 50, y: 55, predicted: 56 },
  { x: 60, y: 62, predicted: 67 },
  { x: 70, y: 78, predicted: 78 },
  { x: 80, y: 85, predicted: 89 },
  { x: 90, y: 95, predicted: 100 },
]

const residualData = [
  { index: 1, residual: 1.2 },
  { index: 2, residual: -2.1 },
  { index: 3, residual: 0.8 },
  { index: 4, residual: 3.5 },
  { index: 5, residual: -1.8 },
  { index: 6, residual: 2.3 },
  { index: 7, residual: -0.5 },
  { index: 8, residual: 1.9 },
  { index: 9, residual: -2.8 },
  { index: 10, residual: 0.3 },
]

const performanceData = [
  { metric: "R² Score", value: 0.87 },
  { metric: "RMSE", value: 12.45 },
  { metric: "MAE", value: 9.32 },
  { metric: "MSE", value: 155.0 },
]

export default function VisualizationsPage() {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const chartColors = {
    grid: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    text: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
    primary: "hsl(var(--primary))",
    accent: "hsl(var(--accent))",
    chart3: "hsl(var(--chart-3))",
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-serif font-normal">Visualizations</h1>
            <Badge variant="secondary">Linear Regression</Badge>
          </div>
          <p className="text-muted-foreground">Explore your model's performance and predictions</p>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {performanceData.map((item) => (
            <Card key={item.metric} className="glass transition-smooth hover:shadow-lg">
              <CardHeader className="pb-3">
                <CardDescription>{item.metric}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{item.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <Tabs defaultValue="predictions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="residuals">Residuals</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="space-y-4 animate-in">
            <Card className="glass-strong">
              <CardHeader>
                <CardTitle>Actual vs Predicted Values</CardTitle>
                <CardDescription>Scatter plot showing model predictions against actual values</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Actual"
                      stroke={chartColors.text}
                      tick={{ fill: chartColors.text }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Value"
                      stroke={chartColors.text}
                      tick={{ fill: chartColors.text }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "rgba(20, 20, 20, 0.95)" : "rgba(255, 255, 255, 0.95)",
                        border: `1px solid ${chartColors.grid}`,
                        borderRadius: "8px",
                        backdropFilter: "blur(12px)",
                      }}
                      labelStyle={{ color: chartColors.text }}
                    />
                    <Legend wrapperStyle={{ color: chartColors.text }} />
                    <Scatter name="Actual" data={scatterData} fill={chartColors.primary} />
                    <Scatter
                      name="Predicted"
                      data={scatterData.map((d) => ({ x: d.x, y: d.predicted }))}
                      fill={chartColors.accent}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="residuals" className="space-y-4 animate-in">
            <Card className="glass-strong">
              <CardHeader>
                <CardTitle>Residual Plot</CardTitle>
                <CardDescription>Distribution of prediction errors</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={residualData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="index" stroke={chartColors.text} tick={{ fill: chartColors.text }} />
                    <YAxis stroke={chartColors.text} tick={{ fill: chartColors.text }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "rgba(20, 20, 20, 0.95)" : "rgba(255, 255, 255, 0.95)",
                        border: `1px solid ${chartColors.grid}`,
                        borderRadius: "8px",
                        backdropFilter: "blur(12px)",
                      }}
                      labelStyle={{ color: chartColors.text }}
                    />
                    <Legend wrapperStyle={{ color: chartColors.text }} />
                    <Bar dataKey="residual" fill={chartColors.chart3} name="Residual" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4 animate-in">
            <Card className="glass-strong">
              <CardHeader>
                <CardTitle>Prediction Comparison</CardTitle>
                <CardDescription>Line chart comparing actual and predicted values</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={scatterData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="x" stroke={chartColors.text} tick={{ fill: chartColors.text }} />
                    <YAxis stroke={chartColors.text} tick={{ fill: chartColors.text }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "rgba(20, 20, 20, 0.95)" : "rgba(255, 255, 255, 0.95)",
                        border: `1px solid ${chartColors.grid}`,
                        borderRadius: "8px",
                        backdropFilter: "blur(12px)",
                      }}
                      labelStyle={{ color: chartColors.text }}
                    />
                    <Legend wrapperStyle={{ color: chartColors.text }} />
                    <Line
                      type="monotone"
                      dataKey="y"
                      stroke={chartColors.primary}
                      strokeWidth={2}
                      name="Actual"
                      dot={{ fill: chartColors.primary }}
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke={chartColors.accent}
                      strokeWidth={2}
                      name="Predicted"
                      strokeDasharray="5 5"
                      dot={{ fill: chartColors.accent }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
