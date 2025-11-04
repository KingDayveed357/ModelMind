import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function MetricCardSkeleton() {
  return (
    <Card className="glass">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 sm:gap-8">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
    </div>
  )
}