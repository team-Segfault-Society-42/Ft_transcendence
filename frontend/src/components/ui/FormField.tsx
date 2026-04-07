import type { FieldError } from "react-hook-form"
import { Label } from "@/components/ui/Label"

type FormFieldProps = {
    label: string
    error?: FieldError
    children: React.ReactNode
}

export function FormField({ label, error, children }: FormFieldProps) {
    return (
        <div className="flex flex-col gap-1">

        <Label>
            {label}
        </Label>

      {children}

      {error && (
        <p className="text-red-400 text-xs">
            {error.message}
        </p>
      )}
    </div>
  )
}