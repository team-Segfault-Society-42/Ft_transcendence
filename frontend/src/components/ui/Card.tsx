import * as React from "react"
import { cn } from "@/lib/utils"

type CardProps = {
  children: React.ReactNode
  className?: string
}

/**
 * Displays a reusable glassmorphism card container.
 *
 * Supports:
 * - custom content
 * - hover animations
 * - custom class names
 */
export function Card({ children, className }: CardProps) {
    return (
        <div
            className={cn(
                "bg-white/5",
                "backdrop-blur-xl",
                "border border-white/10",
                "rounded-2xl",
                "p-6",
                "shadow-xl",
        
                "transition-all duration-300",
                "hover:bg-white/10",
                "hover:scale-[1.02]",
            className
            )}>

            {/* CARD CONTENT */}
            {children}
        </div>
    )
}

type CardTitleProps = {
    children: React.ReactNode
    className?: string
}

/**
 * Displays a reusable card title component.
 *
 * Supports:
 * - custom title content
 * - custom class names
 */
export function CardTitle({ children, className }: CardTitleProps) {
    return (
        <h3
            className={cn(
            "font-bold text-lg mb-2",
            className
            )}>

            {/* TITLE CONTENT */}
            {children}
        </h3>
    )
}

type CardDescriptionProps = {
    children: React.ReactNode
    className?: string
}

/**
 * Displays a reusable card description component.
 *
 * Supports:
 * - multiline text content
 * - custom class names
 */
export function CardDescription({ children, className }: CardDescriptionProps) {
    return (
        <p
            className={cn(
            "text-white wrap-break-word",
            className
            )}>

            {/* DESCRIPTION CONTENT */}
            {children}
      </p>
    )
}