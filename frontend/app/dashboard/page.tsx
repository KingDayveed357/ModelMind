"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, Brain, TrendingUp, Activity, Clock, CheckCircle2, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Mock data for charts
const performanceData = [
  { name: "Jan", models: 4 },
  { name: "Feb", models: 7 },
  { name: "Mar", models: 5 },
  { name: "Apr", models: 9 },
  { name: "May", models: 12 },
  { name: "Jun", models: 15 },
]

const accuracyData = [
  { name: "Week 1", accuracy: 0.82 },
  { name: "Week 2", accuracy: 0.85 },
  { name: "Week 3", accuracy: 0.88 },
  { name: "Week 4", accuracy: 0.91 },
]

const recentModels = [
  {
    id: 1,
    name: "Housing Price Prediction",
    type: "Multiple Regression",
    accuracy: 0.87,
    date: "2 hours ago",
    status: "completed",
  },
  {
    id: 2,
    name: "Sales Forecast Q4",
    type: "Polynomial Regression",
    accuracy: 0.92,
    date: "5 hours ago",
    status: "completed",
  },
  {
    id: 3,
    name: "Stock Market Analysis",
    type: "SVR",
    accuracy: 0.79,
    date: "1 day ago",
    status: "completed",
  },
]

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 sm:gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-serif font-normal">Dashboard Overview</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Track your regression models and performance metrics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="glass transition-smooth hover:shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Models</p>
                  <p className="text-xl sm:text-2xl font-semibold">24</p>
                  <p className="text-[10px] sm:text-xs text-accent flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    +12% from last month
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass transition-smooth hover:shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Avg Accuracy</p>
                  <p className="text-xl sm:text-2xl font-semibold">87.3%</p>
                  <p className="text-[10px] sm:text-xs text-accent flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    +5.2% improvement
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass transition-smooth hover:shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Active Projects</p>
                  <p className="text-xl sm:text-2xl font-semibold">8</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">3 in training</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-chart-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass transition-smooth hover:shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Datasets</p>
                  <p className="text-xl sm:text-2xl font-semibold">16</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">2.4GB total</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-chart-4/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-chart-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="glass-strong">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Models Trained</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Monthly training activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="models" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-strong">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Model Accuracy Trend</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Average R² score over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={accuracyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis domain={[0.7, 1]} className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Models */}
        <Card className="glass">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg">Recent Models</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Your latest regression analysis projects
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild className="bg-transparent w-full sm:w-auto">
                <Link href="/dashboard/history">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {recentModels.map((model) => (
                <div
                  key={model.id}
                  className="flex flex-col gap-3 p-3 sm:p-4 rounded-lg border border-border hover:border-primary/50 transition-smooth cursor-pointer group"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <h4 className="font-semibold text-xs sm:text-sm group-hover:text-primary transition-colors">
                        {model.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] sm:text-xs">
                          {model.type}
                        </Badge>
                        <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {model.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 pl-11 sm:pl-14">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                      <span className="text-xs sm:text-sm font-medium">R² {model.accuracy}</span>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="bg-transparent text-xs">
                      <Link href={`/dashboard/models/${model.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <Card className="hover:border-primary/50 transition-smooth cursor-pointer group glass">
            <CardContent className="p-4 sm:p-6">
              <Link href="/dashboard/upload" className="flex flex-col gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base mb-1">Upload New Dataset</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Import CSV files to start analysis</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-smooth cursor-pointer group glass">
            <CardContent className="p-4 sm:p-6">
              <Link href="/dashboard/train" className="flex flex-col gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base mb-1">Train New Model</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Configure and train regression models</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-smooth cursor-pointer group glass">
            <CardContent className="p-4 sm:p-6">
              <Link href="/dashboard/assistant" className="flex flex-col gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-chart-3/10 flex items-center justify-center group-hover:bg-chart-3/20 transition-colors">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-chart-3" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base mb-1">Ask AI Assistant</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Get help with your analysis</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
