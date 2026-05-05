import { cn } from "@/lib/utils"

type Variant = "topbar" | "card" | "profile" | "full"

interface UsernameProps {
    name: string
    variant?: Variant
    className?: string
}

const variantStyles: Record<Variant, string> = {
    topbar: "max-w-[80px]",
    card: "max-w-[140px]",
    profile: "max-w-[220px]",
    full: "max-w-none",
}

export function Username({
    name,
    variant = "card",
    className = "",
}: UsernameProps) {
    return (
    <div className="relative group inline-block">
      
      {/* texte tronqué */}
      <span
        className={cn(
            "block truncate",
            variant !== "full" && variantStyles[variant],
            className
        )}>
        {name}
      </span>

      {/* uniquement si tronqué */}
      {variant !== "full" && (
        <span
            className="
            absolute left-1/2 top-full mt-1
            -translate-x-1/2
            hidden group-hover:block
            bg-black/90 text-white text-xs
            px-2 py-1 rounded
            whitespace-nowrap
            z-50
            opacity-0 group-hover:opacity-100
            transition">
            {name}
        </span>
      )}
    </div>
  )
}