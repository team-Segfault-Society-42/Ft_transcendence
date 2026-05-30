import { cn } from "@/lib/utils"

type AvatarProps = {
    src?: string
    alt?: string
    fallback?: string
    size?: "sm" | "md" | "lg"
    className?: string
}

/**
 * Displays a reusable user avatar component.
 *
 * Supports:
 * - image avatars
 * - fallback text
 * - multiple predefined sizes
 * - custom styling
 */
export function Avatar({
    src,
    alt = "",
    fallback = "?",
    size = "md",
    className,
}: AvatarProps) {

    /* AVATAR SIZE VARIANTS */
    const sizes = {
        sm: "w-8 h-8 text-xs",
        md: "w-12 h-12 text-sm",
        lg: "w-16 h-16 text-lg",
  }

  return (
    <div
        className={cn("flex items-center justify-center rounded-full bg-white/10 text-white font-bold overflow-hidden",
        sizes[size],
        className
    )}>

    {/* AVATAR IMAGE */}
    {src ? (
        <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"/>
    ) : (
        fallback
        )}
    </div>
  )
}