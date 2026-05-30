import type { FieldError } from "react-hook-form"
import { Label } from "@/components/ui/Label"

type FormFieldProps = {
    label: string
    error?: FieldError
    children: React.ReactNode
}

/**
 * Displays a reusable form field wrapper.
 *
 * Combines:
 * - field label
 * - form input content
 * - validation error message
 *
 * Commonly used with react-hook-form fields.
 */
export function FormField({ label, error, children }: FormFieldProps) {
    return (
        <div className="flex flex-col gap-1">

          {/* FIELD LABEL */}
          <Label>
              {label}
          </Label>

          {/* FIELD CONTENT */}
          {children}

          {/* VALIDATION ERROR */}
          {error && (
            <p className="text-red-400 text-xs">
                {error.message}
            </p>
        )}
    </div>
  )
}