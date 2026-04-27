import { cn } from "@/lib/utils"

type LabelProps = {
  children: React.ReactNode
  htmlFor?: string
  className?: string
}

export function Label({ children, htmlFor, className }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "text-sm font-medium bg-linear-to-br from-cyan-400 to-pink-500 bg-clip-text text-transparent inline-block min-w-50",
        className
      )}>
      {children}
    </label>
  )
}