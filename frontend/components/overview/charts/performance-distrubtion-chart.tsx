import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Maximize2 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { Model } from "@/lib/services/model-service"

interface PerformanceData {
  name: string
  type: string
  performance: number
  model_type: string
  created_at: string
}

interface PerformanceDistributionChartProps {
  models: Model[]
  onExpand?: () => void
}

export function PerformanceDistributionChart({ models, onExpand }: PerformanceDistributionChartProps) {
  const processPerformanceDistribution = (models: Model[]): PerformanceData[] => {
    const regressionModels = models.filter(m => m.problem_type === "regression")
    const classificationModels = models.filter(m => m.problem_type === "classification")

    const data: PerformanceData[] = []

    regressionModels.forEach(model => {
      const r2 = model.metrics?.r2_score
      if (r2 !== undefined && r2 !== null) {
        data.push({
          name: model.model_name,
          type: "Regression",
          performance: parseFloat((r2 * 100).toFixed(1)),
          model_type: model.model_type,
          created_at: model.created_at
        })
      }
    })

    classificationModels.forEach(model => {
      const acc = model.metrics?.accuracy
      if (acc !== undefined && acc !== null) {
        data.push({
          name: model.model_name,
          type: "Classification",
          performance: parseFloat((acc * 100).toFixed(1)),
          model_type: model.model_type,
          created_at: model.created_at
        })
      }
    })

    return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 15)
  }

  const performanceDistribution = processPerformanceDistribution(models)

  return (
    <Card className="glass-strong">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg">Model Performance Distribution</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Recent models ranked by performance score
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
        {performanceDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={performanceDistribution} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))"
                horizontal={true}
                vertical={false}
              />
              <XAxis 
                type="number" 
                domain={[0, 100]}
                stroke="hsl(var(--foreground))"
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
                axisLine={{ stroke: 'hsl(var(--foreground))' }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={100}
                stroke="hsl(var(--foreground))"
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }}
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
                  if (typeof value === 'number') {
                    return `${value}%`
                  }
                  return String(value)
                }}
              />
              <Bar dataKey="performance" radius={[0, 4, 4, 0]}>
                {performanceDistribution.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.type === "Regression" ? "hsl(var(--primary))" : "hsl(var(--accent))"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No model data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}