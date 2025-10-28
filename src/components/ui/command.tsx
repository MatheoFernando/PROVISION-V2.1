"use client"

import * as React from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface CommandProps extends React.ComponentPropsWithoutRef<"div"> {}

function Command({ className, ...props }: CommandProps) {
  return (
    <div
      role="dialog"
      aria-label="Command Menu"
      className={cn(
        "bg-background grid w-full gap-1 rounded-md border p-2 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CommandInput({ className, ...props }: React.ComponentPropsWithoutRef<"input">) {
  return (
    <div className="flex items-center gap-2 rounded-sm border bg-muted/30 px-2">
      <input
        className={cn(
          "placeholder:text-muted-foreground flex h-9 w-full bg-transparent text-sm outline-none",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("max-h-80 overflow-auto py-2", className)} {...props} />
}

function CommandEmpty(props: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div className="text-muted-foreground py-6 text-center text-sm" {...props} />
  )
}

interface CommandGroupProps extends React.ComponentPropsWithoutRef<"div"> {
  heading?: string
}

function CommandGroup({ className, heading, children, ...props }: CommandGroupProps) {
  return (
    <div className={cn("px-2 py-1.5", className)} {...props}>
      {heading ? (
        <div className="text-muted-foreground mb-1 select-none px-1 text-[10px] font-medium uppercase tracking-wide">
          {heading}
        </div>
      ) : null}
      <div className="grid gap-1">
        {children}
      </div>
    </div>
  )
}

function CommandItem({ className, ...props }: React.ComponentPropsWithoutRef<"button">) {
  return (
    <button
      className={cn(
        "hover:bg-accent focus:bg-accent focus:text-accent-foreground inline-flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none",
        className
      )}
      {...props}
    />
  )
}

function CommandSeparator() {
  return <div className="bg-border my-2 h-px w-full" />
}

function CommandShortcut({ className, ...props }: React.ComponentPropsWithoutRef<"kbd">) {
  return (
    <kbd
      className={cn(
        "text-muted-foreground ml-auto text-[10px] font-medium",
        className
      )}
      {...props}
    />
  )
}

interface CommandDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

function CommandDialog({ open, onOpenChange, children }: CommandDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        <Command className="w-full max-w-lg">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
}


