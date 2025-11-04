import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Maximize2 } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { Model } from "@/lib/services/model-service"

interface TrendData {
  label: string
  date: string
  regression: number | null
  classification: number | null
}

interface PerformanceTrendChartProps {
  models: Model[]
  onExpand?: () => void
}

export function PerformanceTrendChart({ models, onExpand }: PerformanceTrendChartProps) {
  const processPerformanceTrend = (models: Model[]): TrendData[] => {
    const sortedModels = [...models]
      .filter(m => (m.metrics?.r2_score !== undefined || m.metrics?.accuracy !== undefined))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    if (sortedModels.length === 0) return []

    const trendData: TrendData[] = []
    const cumulativeRegression: number[] = []
    const cumulativeClassification: number[] = []

    sortedModels.forEach((model, index) => {
      const date = new Date(model.created_at)
      const label = `M${index + 1}`

      if (model.problem_type === "regression" && model.metrics?.r2_score !== undefined) {
        cumulativeRegression.push(model.metrics.r2_score)
        const avgR2 = cumulativeRegression.reduce((a, b) => a + b, 0) / cumulativeRegression.length
        
        trendData.push({
          label,
          date: date.toLocaleDateString(),
          regression: parseFloat(avgR2.toFixed(3)),
          classification: null
        })
      } else if (model.problem_type === "classification" && model.metrics?.accuracy !== undefined) {
        cumulativeClassification.push(model.metrics.accuracy)
        const avgAcc = cumulativeClassification.reduce((a, b) => a + b, 0) / cumulativeClassification.length
        
        trendData.push({
          label,
          date: date.toLocaleDateString(),
          regression: null,
          classification: parseFloat(avgAcc.toFixed(3))
        })
      }
    })

    return trendData.slice(-10)
  }

  const performanceTrend = processPerformanceTrend(models)

  return (
    <Card className="glass-strong">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg">Performance Progression</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Cumulative average performance over training history
            </CardDescription>
          </div>
          {onExpand && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onExpand}
              className="h-8 w-8"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {performanceTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))"
              />
              <XAxis 
                dataKey="label" 
                stroke="hsl(var(--foreground))"
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
                axisLine={{ stroke: 'hsl(var(--foreground))' }}
              />
              <YAxis 
                domain={[0, 1]} 
                stroke="hsl(var(--foreground))"
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
                axisLine={{ stroke: 'hsl(var(--foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--popover-foreground))"
                }}
                formatter={(value: any) => {
                  if (value !== null && typeof value === 'number') {
                    return value.toFixed(3)
                  }
                  return "N/A"
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="regression" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2} 
                dot={{ r: 4, fill: "hsl(var(--primary))" }}
                name="Regression (R²)"
                connectNulls
              />
              <Line 
                type="monotone" 
                dataKey="classification" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2} 
                dot={{ r: 4, fill: "hsl(var(--accent))" }}
                name="Classification (Acc)"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No trend data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}