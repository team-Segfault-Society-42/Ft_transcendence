import * as React from "react"
import { cn } from "@/lib/utils"

type CardProps = {
  children: React.ReactNode
  className?: string
}

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
            {children}
        </div>
    )
}

type CardTitleProps = {
    children: React.ReactNode
    className?: string
}

export function CardTitle({ children, className }: CardTitleProps) {
    return (
        <h3
            className={cn(
            "font-bold text-lg mb-2",
            className
            )}>
            {children}
        </h3>
    )
}

type CardDescriptionProps = {
    children: React.ReactNode
    className?: string
}
  
export function CardDescription({ children, className }: CardDescriptionProps) {
    return (
        <p
            className={cn(
            "text-white",
            className
            )}>
            {children}
      </p>
    )
}