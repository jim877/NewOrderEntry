import * as React from "react"
import { cn } from "@/lib/utils"

type DialogContextValue = {
  open: boolean
  onOpenChange?: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

export function Dialog({ open, onOpenChange, children }: React.PropsWithChildren<DialogContextValue>) {
  return <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>
}

export function DialogContent({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  const ctx = React.useContext(DialogContext)
  if (!ctx?.open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => ctx.onOpenChange?.(false)}
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-xl border bg-background p-6 shadow-lg",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5", className)} {...props} />
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold", className)} {...props} />
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-4 flex justify-end", className)} {...props} />
}
