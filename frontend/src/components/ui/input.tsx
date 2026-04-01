import * as React from "react"
import { cn } from "@/lib/utils"

type InputProps = React.ComponentProps<"input"> & {
  label?: string
  error?: string
}

function Input({ className, type, label, error, ...props }: InputProps){
  return (
    <div className="flex flex-col gap-1 w-full">

      {label && (
        <label className="text-sm text-white/70">
          {label}
        </label>
      )}

      <input
        type={type}
        data-slot="input"
        className={cn("h-10 w-full rounded-lg border bg-white/5 px-3 py-2 text-white",
          "placeholder:text-white/30",
          "focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent",
          "transition-all",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />

      {error && (
        <span className="text-xs text-red-400">
          {error}
        </span>
      )}

    </div>
  )
}

export { Input }
