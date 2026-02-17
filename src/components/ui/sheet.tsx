import * as React from "react"
import { cn } from "@/lib/utils"

type SheetContextValue = {
  open: boolean
  onOpenChange?: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue | null>(null)

export function Sheet({ open, onOpenChange, children }: React.PropsWithChildren<SheetContextValue>) {
  return <SheetContext.Provider value={{ open, onOpenChange }}>{children}</SheetContext.Provider>
}

export function SheetContent({
  side = "right",
  className,
  children,
}: React.PropsWithChildren<{ side?: "right" | "left"; className?: string }>) {
  const ctx = React.useContext(SheetContext)
  if (!ctx?.open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => ctx.onOpenChange?.(false)}
      />
      <div
        className={cn(
          "absolute top-0 h-full w-full bg-background shadow-lg",
          side === "right" ? "right-0" : "left-0",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1", className)} {...props} />
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold", className)} {...props} />
}

export function SheetClose({
  asChild,
  children,
}: React.PropsWithChildren<{ asChild?: boolean }>) {
  const ctx = React.useContext(SheetContext)
  if (!asChild) {
    return (
      <button type="button" onClick={() => ctx?.onOpenChange?.(false)}>
        {children}
      </button>
    )
  }

  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (event: React.MouseEvent) => {
        children.props?.onClick?.(event)
        ctx?.onOpenChange?.(false)
      },
    })
  }

  return null
}
