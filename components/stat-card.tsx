import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * Kartu statistik ringkas.
 *
 * Angka adalah elemen utama: tabular-nums supaya kolom angka sejajar dan
 * cepat dibandingkan. Ikon hanya penanda konteks, bukan hiasan berwarna.
 * `emphasis` dipakai untuk satu stat yang paling penting di halaman
 * (DESIGN.md: Total Siswa jadi focal), bukan untuk semua kartu.
 */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  emphasis = false,
  className,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon?: LucideIcon
  emphasis?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        {Icon ? (
          <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <p
          className={cn(
            "font-semibold tracking-tight text-foreground tabular-nums",
            emphasis ? "text-3xl" : "text-2xl"
          )}
        >
          {value}
        </p>
        {hint ? (
          <p className="text-xs leading-snug text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    </div>
  )
}
