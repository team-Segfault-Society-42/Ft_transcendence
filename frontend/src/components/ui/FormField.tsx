import type { FieldError } from "react-hook-form"

type FormFieldProps = {
    label: string
    error?: FieldError
    children: React.ReactNode
}

export function FormField({ label, error, children }: FormFieldProps) {
    return (
        <div className="flex flex-col gap-1">

        <label className="text-sm text-white/70">
            {label}
        </label>

      {children}

      {error && (
        <p className="text-red-400 text-xs">
            {error.message}
        </p>
      )}
    </div>
  )
}