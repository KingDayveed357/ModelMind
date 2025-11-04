

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl sm:text-3xl font-serif font-normal">
        Dashboard Overview
      </h1>
      <p className="text-sm sm:text-base text-muted-foreground">
        Track your machine learning models and performance metrics
      </p>
    </div>
  )
}