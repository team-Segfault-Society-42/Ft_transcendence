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
            "bg-linear-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-400/20 rounded-xl p-6 backdrop-blur transition hover:scale-105 group",
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
            "font-bold text-lg mb-2 transition group-hover:text-cyan-300",
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
            "text-white/70 text-sm",
            className
            )}>
            {children}
      </p>
    )
}