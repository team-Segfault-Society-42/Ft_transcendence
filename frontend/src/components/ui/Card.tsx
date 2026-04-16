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
            "bg-linear-to-r from-cyan-400 to-pink-500 border border-cyan-400/20 rounded-xl p-6 backdrop-blur transition hover:scale-105 hover:-translate-y-2 active:scale-95 group",
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
            "text-white text-sm",
            className
            )}>
            {children}
      </p>
    )
}