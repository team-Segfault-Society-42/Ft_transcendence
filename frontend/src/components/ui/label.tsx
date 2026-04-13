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
        "text-sm font-medium text-white/70",
        className
      )}>
      {children}
    </label>
  )
}