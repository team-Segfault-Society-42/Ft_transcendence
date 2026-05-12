import { Card, CardTitle } from "@/components/ui/Card"
import { cn } from "@/lib/utils"

type Props = {
  title: string
  icon: React.ReactNode
  message: string
  description?: string
  className?: string
  actions?: React.ReactNode
}

export function EmptyStateCard({ title, icon, message, description, className, actions } : Props) {
    return (
        <Card className={cn("h-full relative flex items-center justify-center bg-slate-900", className)}>
      
            <CardTitle className="absolute top-6 left-6 bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
                {title}
            </CardTitle>

            <div className="flex flex-col items-center justify-center text-center gap-4 pt-20 pb-20">
                <div className="w-14 h-14 rounded-full border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                {icon}
                </div>

                <div>
                    <p className="text-white font-medium">
                        {message}
                    </p>

                {description && (
                    <p className="text-sm text-white/40 mt-2">
                        {description}
                    </p>
                )}
                </div>

                {actions && (
                    <div className="flex gap-3 mt-4">
                        {actions}
                    </div>
                )}
            </div>

        </Card>
  )
}