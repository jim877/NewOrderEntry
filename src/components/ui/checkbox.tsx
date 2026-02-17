import * as React from "react"
import { cn } from "@/lib/utils"

type CheckboxProps = {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
}

export function Checkbox({ checked = false, onCheckedChange, className }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  )
}
