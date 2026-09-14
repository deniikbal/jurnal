import {
  CheckCircle2Icon,
  ClockIcon,
  TrendingUpIcon,
  UserCheckIcon,
  UserXIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

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
  const notPresent = summary.sakit + summary.izin + summary.alfa

  return (
    <>
      <section>
        <div className="mb-4">
          <h2 className="inline-block border-b-4 border-foreground pb-1 text-sm font-extrabold tracking-wider text-foreground uppercase">
            Ringkasan Hari Ini
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-2 border-foreground bg-card p-5 text-foreground shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--foreground)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Sesi Hari Ini
                </p>
                <p className="text-5xl font-extrabold tabular-nums leading-none">
                  {filteredCount}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground">
                <ClockIcon className="size-4" />
              </div>
            </div>
            <p className="mt-4 text-xs font-bold tracking-wider uppercase text-muted-foreground">
              {filteredHint ? (
                <span className="inline-block border-2 border-foreground bg-foreground px-1.5 py-0.5 text-[10px] font-extrabold text-background">
                  {filteredHint}
                </span>
              ) : (
                "Total sesi jadwal"
              )}
            </p>
          </div>

          <div className="border-2 border-foreground bg-secondary p-5 text-secondary-foreground shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--foreground)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-wider text-secondary-foreground/80 uppercase">
                  Sudah Diisi
                </p>
                <p className="text-5xl font-extrabold tabular-nums leading-none">
                  {filledCount}
                  <span className="ml-1 text-base font-bold text-secondary-foreground/70">
                    / {filteredCount}
                  </span>
                </p>
              </div>
              <div className="flex size-10 items-center justify-center border-2 border-foreground bg-background text-foreground">
                <CheckCircle2Icon className="size-4" />
              </div>
            </div>
            <p className="mt-4 text-xs font-bold tracking-wider uppercase text-secondary-foreground/80">
              {filteredCount > 0 ? (
                <span className="inline-block border-2 border-foreground bg-background px-1.5 py-0.5 font-extrabold tabular-nums text-foreground">
                  {fillRate}%
                </span>
              ) : (
                "—"
              )}{" "}
              selesai
            </p>
          </div>

          <div className="border-2 border-foreground bg-accent p-5 text-accent-foreground shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--foreground)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-wider text-accent-foreground/80 uppercase">
                  Hadir
                </p>
                <p className="text-5xl font-extrabold tabular-nums leading-none">
                  {summary.hadir}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center border-2 border-foreground bg-background text-foreground">
                <UserCheckIcon className="size-4" />
              </div>
            </div>
            <p className="mt-4 text-xs font-bold tracking-wider uppercase text-accent-foreground/80">
              {total > 0 ? (
                <span className="inline-block border-2 border-foreground bg-background px-1.5 py-0.5 font-extrabold tabular-nums text-foreground">
                  {attendanceRate}%
                </span>
              ) : (
                "—"
              )}{" "}
              dari total catatan
            </p>
          </div>

          <div className="border-2 border-foreground bg-card p-5 text-foreground shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--foreground)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Tidak Hadir
                </p>
                <p className="text-5xl font-extrabold tabular-nums leading-none">
                  {notPresent}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center border-2 border-foreground bg-foreground text-background">
                <UserXIcon className="size-4" />
              </div>
            </div>
            <p className="mt-4 text-xs font-bold tracking-wider uppercase text-muted-foreground">
              S{" "}
              <span className="border-2 border-foreground bg-background px-1 py-0.5 font-extrabold tabular-nums">
                {summary.sakit}
              </span>{" "}
              · I{" "}
              <span className="border-2 border-foreground bg-background px-1 py-0.5 font-extrabold tabular-nums">
                {summary.izin}
              </span>{" "}
              · A{" "}
              <span className="border-2 border-foreground bg-background px-1 py-0.5 font-extrabold tabular-nums">
                {summary.alfa}
              </span>
            </p>
          </div>
        </div>
      </section>

      <section className="border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_var(--foreground)]">
        <div className="flex flex-col gap-3 border-b-2 border-foreground px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_var(--foreground)]">
              <TrendingUpIcon className="size-4" />
            </span>
            <div className="space-y-0.5">
              <h2 className="text-sm font-extrabold tracking-wider text-foreground uppercase">
                Progres Absensi Hari Ini
              </h2>
              <p className="text-xs font-medium text-muted-foreground">
                {filteredCount === 0
                  ? "Tidak ada sesi jadwal untuk filter aktif."
                  : `${filledCount} dari ${filteredCount} sesi telah diabsen.`}
              </p>
            </div>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-2 border-2 border-foreground px-2.5 py-1.5 text-xs font-extrabold tracking-wider uppercase",
              fillRate === 100
                ? "bg-secondary text-secondary-foreground shadow-[2px_2px_0px_0px_var(--foreground)]"
                : "bg-background text-foreground",
            )}
          >
            {fillRate === 100 ? "Lengkap" : `${fillRate}%`}
          </span>
        </div>
        <div className="space-y-3 px-4 py-4 sm:px-5">
          <div className="relative h-6 border-2 border-foreground bg-muted">
            <div
              className={cn(
                "h-full border-r-2 border-foreground transition-all",
                fillRate === 100 ? "bg-secondary" : "bg-primary",
              )}
              style={{ width: `${fillRate}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold tracking-wider text-foreground uppercase tabular-nums mix-blend-difference">
              {fillRate}%
            </span>
          </div>
          {total > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold tracking-wider text-foreground uppercase">
              <span className="inline-flex items-center gap-1.5 border-2 border-foreground bg-background px-2 py-1">
                <span className="size-2 bg-secondary" aria-hidden />
                Hadir {summary.hadir}
              </span>
              <span className="inline-flex items-center gap-1.5 border-2 border-foreground bg-background px-2 py-1">
                <span className="size-2 bg-primary" aria-hidden />
                Sakit {summary.sakit}
              </span>
              <span className="inline-flex items-center gap-1.5 border-2 border-foreground bg-background px-2 py-1">
                <span className="size-2 bg-accent" aria-hidden />
                Izin {summary.izin}
              </span>
              <span className="inline-flex items-center gap-1.5 border-2 border-foreground bg-foreground px-2 py-1 text-background">
                <span className="size-2 bg-background" aria-hidden />
                Alfa {summary.alfa}
              </span>
            </div>
          )}
        </div>
      </section>
    </>
  )
}