import * as React from "react"
import { cn } from "@/lib/utils"

type PopoverContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null)

export function Popover({ children }: React.PropsWithChildren) {
  const [open, setOpen] = React.useState(false)
  return <PopoverContext.Provider value={{ open, setOpen }}>{children}</PopoverContext.Provider>
}

export function PopoverTrigger({ asChild, children }: React.PropsWithChildren<{ asChild?: boolean }>) {
  const ctx = React.useContext(PopoverContext)
  if (!ctx) return null

  const toggle = () => ctx.setOpen(!ctx.open)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (event: React.MouseEvent) => {
        children.props?.onClick?.(event)
        toggle()
      },
    })
  }

  return (
    <button type="button" onClick={toggle}>
      {children}
    </button>
  )
}

export function PopoverContent({
  className,
  align = "center",
  children,
}: React.PropsWithChildren<{ className?: string; align?: "start" | "center" | "end" }>) {
  const ctx = React.useContext(PopoverContext)
  if (!ctx?.open) return null

  const alignClass =
    align === "start"
      ? "left-0"
      : align === "end"
      ? "right-0"
      : "left-1/2 -translate-x-1/2"

  return (
    <div className="relative">
      <div
        className="fixed inset-0 z-40"
        onClick={() => ctx.setOpen(false)}
      />
      <div
        className={cn(
          "absolute z-50 mt-2 rounded-md border bg-popover p-4 text-popover-foreground shadow-md",
          alignClass,
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}
