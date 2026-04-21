import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-linear-to-r from-cyan-500 to-purple-500 text-white hover:bg-cyan-400 hover:scale-110 active:scale-95",
        secondary: "bg-slate-800 text-white border border-white/10 hover:scale-110 active:scale-95",
        danger: "bg-red-500 text-white hover:bg-red-400 hover:scale-110 active:scale-95",
      },
      size: {
        sm: "px-3 py-1 text-sm rounded-2xl shadow-xl",
        md: "px-5 py-2 rounded-2xl shadow-xl",
        lg: "px-6 py-3 text-lg rounded-2xl shadow-xl",
        xl: "px-12 py-4 text-2xl font-black rounded-2xl shadow-xl",
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