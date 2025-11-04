import { Card, CardContent } from "@/components/ui/card"
import { Upload, Brain, Activity } from "lucide-react"
import { useRouter } from "next/navigation"

interface ActionCardProps {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  iconBgColor: string
}

function ActionCard({ icon, title, description, href, iconBgColor }: ActionCardProps) {
  const router = useRouter()

  return (
    <Card 
      className="hover:border-primary/50 transition-smooth cursor-pointer group glass h-full"
      onClick={() => router.push(href)}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-3">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${iconBgColor} flex items-center justify-center group-hover:opacity-90 transition-colors`}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base mb-1">{title}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
      <ActionCard
        icon={<Upload className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />}
        title="Upload New Dataset"
        description="Import CSV files to start analysis"
        href="/dashboard/upload"
        iconBgColor="bg-primary/10"
      />
      
      <ActionCard
        icon={<Brain className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />}
        title="Train New Model"
        description="Configure and train ML models"
        href="/dashboard/train"
        iconBgColor="bg-accent/10"
      />
      
      <ActionCard
        icon={<Activity className="w-5 h-5 sm:w-6 sm:h-6 text-chart-3" />}
        title="Ask AI Assistant"
        description="Get help with your analysis"
        href="/coming-soon"
        iconBgColor="bg-chart-3/10"
      />
    </div>
  )
}
