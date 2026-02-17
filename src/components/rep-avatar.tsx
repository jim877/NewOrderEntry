import { cn } from "@/lib/utils"
import { REPS } from "@/data/mock-data"

export function RepAvatar({ repId, size = "md" }: { repId: string; size?: "sm" | "md" }) {
  const rep = REPS.find((r) => r.id === repId) ?? REPS[0]
  const s = size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm"
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full text-white font-semibold shadow-sm",
        s,
        rep.colorClass
      )}
      title={rep.name}
      aria-label={rep.name}
    >
      {rep.initials}
    </div>
  )
}
