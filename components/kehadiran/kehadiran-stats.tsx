import {
  CheckCircle2Icon,
  ClockIcon,
  TrendingUpIcon,
  UserCheckIcon,
  UserXIcon,
} from "lucide-react"

import { StatCard } from "@/components/stat-card"
import { cn } from "@/lib/utils"

type Props = {
  filteredCount: number
  filledCount: number
  fillRate: number
  summary: { hadir: number; sakit: number; izin: number; alfa: number }
  filteredHint?: string
}

const statusItems = [
  { key: "hadir", label: "Hadir", dot: "bg-emerald-500" },
  { key: "sakit", label: "Sakit", dot: "bg-amber-500" },
  { key: "izin", label: "Izin", dot: "bg-sky-500" },
  { key: "alfa", label: "Alfa", dot: "bg-rose-500" },
] as const

export function KehadiranStats({
  filteredCount,
  filledCount,
  fillRate,
  summary,
  filteredHint,
}: Props) {
  const total = summary.hadir + summary.sakit + summary.izin + summary.alfa
  const attendanceRate = total > 0 ? Math.round((summary.hadir / total) * 100) : 0
  const notPresent = summary.sakit + summary.izin + summary.alfa

  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Sesi hari ini"
          value={filteredCount}
          hint={filteredHint ? `Terfilter: ${filteredHint}` : "Total sesi jadwal"}
          icon={ClockIcon}
        />
        <StatCard
          label="Sudah diisi"
          value={`${filledCount} / ${filteredCount}`}
          hint={`${fillRate}% selesai`}
          icon={CheckCircle2Icon}
          emphasis
        />
        <StatCard
          label="Hadir"
          value={summary.hadir}
          hint={`${attendanceRate}% dari total catatan`}
          icon={UserCheckIcon}
        />
        <StatCard
          label="Tidak hadir"
          value={notPresent}
          hint={
            <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="tabular-nums">S {summary.sakit}</span>
              <span className="tabular-nums">I {summary.izin}</span>
              <span className="tabular-nums">A {summary.alfa}</span>
            </span>
          }
          icon={UserXIcon}
        />
      </section>

      <section className="rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
              <TrendingUpIcon className="size-4" />
            </span>
            <div className="space-y-0.5">
              <h2 className="text-sm font-medium text-foreground">
                Progres absensi hari ini
              </h2>
              <p className="text-xs text-muted-foreground">
                {filteredCount === 0
                  ? "Tidak ada sesi jadwal untuk filter aktif."
                  : `${filledCount} dari ${filteredCount} sesi telah diabsen.`}
              </p>
            </div>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs tabular-nums",
              fillRate === 100
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "bg-muted text-muted-foreground"
            )}
          >
            {fillRate === 100 ? "Lengkap" : `${fillRate}%`}
          </span>
        </div>

        <div className="space-y-3 px-4 py-4">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                fillRate === 100 ? "bg-emerald-500" : "bg-primary"
              )}
              style={{ width: `${fillRate}%` }}
            />
          </div>

          {total > 0 && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              {statusItems.map((item) => (
                <span key={item.key} className="inline-flex items-center gap-1.5">
                  <span className={cn("size-1.5 rounded-full", item.dot)} aria-hidden />
                  {item.label}
                  <span className="tabular-nums text-foreground">{summary[item.key]}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
