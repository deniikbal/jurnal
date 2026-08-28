import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle2Icon,
  ClockIcon,
  UserCheckIcon,
  UserXIcon,
} from "lucide-react"

type StatCardProps = {
  label: string
  value: number | string
  hint?: string
  icon: React.ComponentType<{ className?: string }>
  accent?: "default" | "primary" | "success" | "destructive"
}

function StatCard({ label, value, hint, icon: Icon, accent = "default" }: StatCardProps) {
  const accentClass =
    accent === "primary"
      ? "bg-primary/10 text-primary"
      : accent === "success"
        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        : accent === "destructive"
          ? "bg-destructive/10 text-destructive"
          : "bg-muted text-muted-foreground"

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          <span
            className={`inline-flex size-8 items-center justify-center rounded-sm ${accentClass}`}
          >
            <Icon className="size-4" />
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {value}
          </span>
          {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
        </div>
      </CardContent>
    </Card>
  )
}

type Props = {
  filteredCount: number
  filledCount: number
  fillRate: number
  summary: { hadir: number; sakit: number; izin: number; alfa: number }
  filteredHint?: string
}

export function KehadiranStats({
  filteredCount,
  filledCount,
  fillRate,
  summary,
  filteredHint,
}: Props) {
  const total = summary.hadir + summary.sakit + summary.izin + summary.alfa
  const attendanceRate = total > 0 ? Math.round((summary.hadir / total) * 100) : 0

  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Sesi hari ini"
          value={filteredCount}
          icon={ClockIcon}
          hint={filteredHint}
        />
        <StatCard
          label="Sudah diisi"
          value={`${filledCount}/${filteredCount}`}
          icon={CheckCircle2Icon}
          accent={fillRate === 100 ? "success" : "primary"}
          hint={filteredCount > 0 ? `${fillRate}% selesai` : "—"}
        />
        <StatCard
          label="Hadir hari ini"
          value={summary.hadir}
          icon={UserCheckIcon}
          accent="success"
          hint={total > 0 ? `${attendanceRate}% dari total` : "—"}
        />
        <StatCard
          label="Tidak hadir"
          value={summary.sakit + summary.izin + summary.alfa}
          icon={UserXIcon}
          accent="destructive"
          hint={`S ${summary.sakit} · I ${summary.izin} · A ${summary.alfa}`}
        />
      </section>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-foreground">Progres absensi hari ini</h2>
              <p className="text-xs text-muted-foreground">
                {filteredCount === 0
                  ? "Tidak ada sesi jadwal untuk filter aktif."
                  : `${filledCount} dari ${filteredCount} sesi telah diabsen.`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={fillRate === 100 ? "default" : "secondary"}>
                {fillRate === 100 ? "Lengkap" : `${fillRate}%`}
              </Badge>
              {total > 0 && (
                <span className="hidden flex-wrap items-center gap-2 text-xs text-muted-foreground sm:inline-flex">
                  <span className="inline-flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-500" /> Hadir {summary.hadir}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-amber-500" /> Sakit {summary.sakit}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-sky-500" /> Izin {summary.izin}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-destructive" /> Alfa {summary.alfa}
                  </span>
                </span>
              )}
            </div>
          </div>
          <Progress value={fillRate} />
        </CardContent>
      </Card>
    </>
  )
}
