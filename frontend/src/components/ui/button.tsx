import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-linear-to-r from-cyan-500 to-purple-500 text-white hover:bg-cyan-400",
        secondary: "bg-linear-to-r from-cyan-500 to-purple-500 text-white hover:bg-cyan-400/80",
        ghost: "bg-transparent text-cyan-400 hover:bg-cyan-500/10",
        danger: "bg-red-500 text-white hover:bg-red-400",
      },
      size: {
        sm: "px-3 py-1 text-sm",
        md: "px-5 py-2",
        lg: "px-6 py-3 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean
  }

export function Button({
  className,
  variant,
  size,
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  )
}