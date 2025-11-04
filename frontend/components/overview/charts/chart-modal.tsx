import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, CheckCircle2 } from "lucide-react"
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, Cell, Label 
} from "recharts"
import type { Model } from "@/lib/services/model-service"

interface PerformanceData {
  name: string
  type: string
  performance: number
  model_type: string
  created_at: string
}

interface TrendData {
  label: string
  date: string
  regression: number | null
  classification: number | null
}

interface ChartModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chartType: 'distribution' | 'trend' | null
  models: Model[]
}

export function ChartModal({ open, onOpenChange, chartType, models }: ChartModalProps) {
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

  const getChartInsights = (chartType: 'distribution' | 'trend', performanceDistribution: PerformanceData[], performanceTrend: TrendData[]): string[] => {
    if (chartType === 'distribution') {
      if (performanceDistribution.length === 0) return ["No models available for analysis"]
      
      const avgPerf = performanceDistribution.reduce((sum, d) => sum + d.performance, 0) / performanceDistribution.length
      const bestModel = performanceDistribution.reduce((best, current) => 
        current.performance > best.performance ? current : best
      )
      const worstModel = performanceDistribution.reduce((worst, current) => 
        current.performance < worst.performance ? current : worst
      )
      
      return [
        `Average performance: ${avgPerf.toFixed(1)}%`,
        `Best model: ${bestModel.name} (${bestModel.performance}%)`,
        `Lowest model: ${worstModel.name} (${worstModel.performance}%)`,
        `Performance range: ${(bestModel.performance - worstModel.performance).toFixed(1)}% variance`
      ]
    } else {
      if (performanceTrend.length === 0) return ["No trend data available"]
      
      const hasRegression = performanceTrend.some(d => d.regression !== null)
      const hasClassification = performanceTrend.some(d => d.classification !== null)
      
      const insights: string[] = []
      
      if (hasRegression) {
        const regressionData = performanceTrend.filter(d => d.regression !== null).map(d => d.regression!)
        const improvement = regressionData[regressionData.length - 1] - regressionData[0]
        insights.push(`Regression R² ${improvement >= 0 ? 'improved' : 'declined'} by ${Math.abs(improvement * 100).toFixed(1)}%`)
      }
      
      if (hasClassification) {
        const classificationData = performanceTrend.filter(d => d.classification !== null).map(d => d.classification!)
        const improvement = classificationData[classificationData.length - 1] - classificationData[0]
        insights.push(`Classification accuracy ${improvement >= 0 ? 'improved' : 'declined'} by ${Math.abs(improvement * 100).toFixed(1)}%`)
      }
      
      insights.push(`Tracking ${performanceTrend.length} training iterations`)
      
      return insights
    }
  }

  const performanceDistribution = processPerformanceDistribution(models)
  const performanceTrend = processPerformanceTrend(models)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-6xl xl:max-w-7xl h-[95vh] sm:h-[90vh] p-0 gap-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b space-y-2">
          <DialogTitle className="text-lg sm:text-xl">
            {chartType === 'distribution' ? 'Model Performance Distribution' : 'Performance Progression'}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {chartType === 'distribution' 
              ? 'Detailed view of model performance across all trained models'
              : 'Track your improvement journey over time'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-3 sm:gap-4 overflow-auto p-4 sm:p-6">
          {/* Chart Container */}
          <div className="flex-1 min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] bg-card rounded-lg border-2 border-border p-3 sm:p-4">
            {chartType === 'distribution' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={performanceDistribution} 
                  layout="vertical" 
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="hsl(var(--border))" 
                    horizontal={true}
                    vertical={true}
                  />
                  <XAxis 
                    type="number" 
                    domain={[-5, 105]}
                    stroke="hsl(var(--foreground))"
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--foreground))', strokeWidth: 2 }}
                  >
                    <Label 
                      value="Performance (%)" 
                      position="insideBottom" 
                      offset={-15}
                      style={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 500 }}
                    />
                  </XAxis>
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={140}
                    stroke="hsl(var(--foreground))"
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
                    axisLine={{ stroke: 'hsl(var(--foreground))', strokeWidth: 2 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--popover-foreground))",
                      padding: "12px"
                    }}
                    formatter={(value: any, name: string, props: any) => [
                      `${value}% (${props.payload.type})`,
                      props.payload.model_type
                    ]}
                    labelStyle={{ color: 'hsl(var(--popover-foreground))', fontWeight: 600, marginBottom: '4px' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    wrapperStyle={{ paddingBottom: '20px' }}
                    content={() => (
                      <div className="flex items-center justify-center gap-4 text-xs sm:text-sm mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--primary))' }}></div>
                          <span>Regression Models</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--accent))' }}></div>
                          <span>Classification Models</span>
                        </div>
                      </div>
                    )}
                  />
                  <Bar dataKey="performance" name="Performance Score" radius={[0, 8, 8, 0]}>
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
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceTrend} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="hsl(var(--border))" 
                    horizontal={true}
                    vertical={true}
                  />
                  <XAxis 
                    dataKey="label" 
                    stroke="hsl(var(--foreground))"
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--foreground))', strokeWidth: 2 }}
                  >
                    <Label 
                      value="Training Iteration" 
                      position="insideBottom" 
                      offset={-15}
                      style={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 500 }}
                    />
                  </XAxis>
                  <YAxis 
                    domain={[0, 1]} 
                    stroke="hsl(var(--foreground))"
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--foreground))', strokeWidth: 2 }}
                  >
                    <Label 
                      value="Score" 
                      angle={-90} 
                      position="insideLeft"
                      style={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 500 }}
                    />
                  </YAxis>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--popover-foreground))",
                      padding: "12px"
                    }}
                    formatter={(value: any) => {
                      if (value !== null && typeof value === 'number') {
                        return value.toFixed(3)
                      }
                      return "N/A"
                    }}
                    labelStyle={{ color: 'hsl(var(--popover-foreground))', fontWeight: 600, marginBottom: '4px' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    wrapperStyle={{ paddingBottom: '20px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="regression" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3} 
                    dot={{ r: 5, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--background))" }}
                    activeDot={{ r: 7, strokeWidth: 2 }}
                    name="Regression (R²)"
                    connectNulls
                  />
                  <Line 
                    type="monotone" 
                    dataKey="classification" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={3} 
                    dot={{ r: 5, fill: "hsl(var(--accent))", strokeWidth: 2, stroke: "hsl(var(--background))" }}
                    activeDot={{ r: 7, strokeWidth: 2 }}
                    name="Classification (Acc)"
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Insights Panel */}
          <Card className="glass-strong border-2 flex-shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                {getChartInsights(chartType || 'distribution', performanceDistribution, performanceTrend).map((insight, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs sm:text-sm p-2 sm:p-3 rounded-lg bg-muted/30">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-foreground leading-relaxed">{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}