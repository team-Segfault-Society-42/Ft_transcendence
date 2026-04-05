// components/ui/spinner.tsx
import { cn } from "@/lib/utils"

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      // L'animation Tailwind est ici : animate-spin
      // text-slate-400 est la couleur par défaut
      className={cn("animate-spin text-slate-400 size-10", className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}