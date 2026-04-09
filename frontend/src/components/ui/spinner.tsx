import { cn } from "@/lib/utils"

type SpinnerProps = {
  size?: "sm" | "md" | "lg"
  variant?: "default" | "cyan" | "white"
  className?: string
}

export function Spinner({
  size = "md",
  variant = "default",
  className,
}: SpinnerProps) {
  const sizes = {
    sm: "size-6",
    md: "size-10",
    lg: "size-16",
  }

  const variants = {
    default: "text-slate-400",
    cyan: "text-cyan-400",
    white: "text-white",
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin", sizes[size], variants[variant], className)}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}