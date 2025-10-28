import * as React from "react"

import { cn } from "@/lib/utils"

export interface BadgeProps extends React.ComponentProps<"span"> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variant === "default" && "bg-primary text-primary-foreground border-transparent",
        variant === "secondary" && "bg-secondary text-secondary-foreground border-transparent",
        variant === "destructive" && "bg-destructive text-destructive-foreground border-transparent",
        variant === "outline" && "text-foreground",
        className
      )}
      {...props}
    />
  )
}

export default Badge



