import Link from "next/link"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarRangeIcon,
  TrendingUpIcon,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { cn } from "@/lib/utils"

type ReportRow = {
  id: string
  date: string
  day: string
  subjectName: string
  subjectKode: string | null
  classroomName: string
  jamKe: number
  startTime: string
  endTime: string
  hadir: number
  sakit: number
  izin: number
  alfa: number
  total: number
}

const SEGMENTS = [
  { key: "hadir", className: "bg-emerald-500" },
  { key: "sakit", className: "bg-amber-500" },
  { key: "izin", className: "bg-sky-500" },
  { key: "alfa", className: "bg-rose-500" },
] as const

function AttendanceBar({
  hadir,
  sakit,
  izin,
  alfa,
}: {
  hadir: number
  sakit: number
  izin: number
  alfa: number
}) {
  const total = hadir + sakit + izin + alfa
  if (total === 0) return null
  const values = { hadir, sakit, izin, alfa }
  const pct = (n: number) => (n / total) * 100

  return (
    <div className="flex h-1.5 w-full min-w-24 overflow-hidden rounded-full bg-muted">
      {SEGMENTS.map((segment) =>
        values[segment.key] > 0 ? (
          <span
            key={segment.key}
            className={segment.className}
            style={{ width: `${pct(values[segment.key])}%` }}
            title={`${segment.key} ${values[segment.key]}`}
          />
        ) : null
      )}
    </div>
  )
}

function labelDay(day: string) {
  return day[0].toUpperCase() + day.slice(1)
}

function getDayName(date: string) {
  const dayMap = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"]
  return dayMap[new Date(`${date}T12:00:00+07:00`).getUTCDay()]
}

type Props = {
  monthLabel: string
  rows: ReportRow[]
  pagedRows: ReportRow[]
  totalPages: number
  safePage: number
  pageSize: number
  monthSummary: { hadir: number; sakit: number; izin: number; alfa: number; total: number }
  buildHref: (params: { page: number }) => string
  selectedClassroomId: string
  selectedSubjectId: string
  reportMonth: string
}

export function KehadiranReportTable({
  monthLabel,
  rows,
  pagedRows,
  totalPages,
  safePage,
  pageSize,
  monthSummary,
  buildHref,
}: Props) {
  const attendanceRate =
    monthSummary.total > 0 ? Math.round((monthSummary.hadir / monthSummary.total) * 100) : 0

  return (
    <section className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="flex flex-col gap-1 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-medium text-foreground">Laporan bulanan</h2>
        <p className="text-xs text-muted-foreground">
          {monthLabel} · <span className="tabular-nums">{rows.length}</span> sesi tercatat
        </p>
      </div>

      {rows.length > 0 && (
        <div className="grid gap-3 border-b p-4 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
              <TrendingUpIcon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                Tingkat kehadiran
              </p>
              <p className="text-xl font-semibold tabular-nums text-foreground">
                {attendanceRate}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
              <CalendarRangeIcon className="size-4" />
            </span>
            <div className="min-w-0 flex-1 space-y-1.5">
              <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                Distribusi absensi
              </p>
              <AttendanceBar
                hadir={monthSummary.hadir}
                sakit={monthSummary.sakit}
                izin={monthSummary.izin}
                alfa={monthSummary.alfa}
              />
              <p className="flex flex-wrap items-center gap-x-3 text-[11px] text-muted-foreground">
                <span className="tabular-nums">H {monthSummary.hadir}</span>
                <span className="tabular-nums">S {monthSummary.sakit}</span>
                <span className="tabular-nums">I {monthSummary.izin}</span>
                <span className="tabular-nums">A {monthSummary.alfa}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 pl-4">No</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Mapel</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Jam</TableHead>
              <TableHead className="text-center">H</TableHead>
              <TableHead className="text-center">S</TableHead>
              <TableHead className="text-center">I</TableHead>
              <TableHead className="text-center">A</TableHead>
              <TableHead className="w-32 pr-4 text-right">Distribusi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              pagedRows.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell className="pl-4 text-xs tabular-nums text-muted-foreground">
                    {(safePage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs tabular-nums text-foreground">{row.date}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {labelDay(row.day || getDayName(row.date))}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-foreground">{row.subjectName}</span>
                    {row.subjectKode ? (
                      <span className="ml-1.5 font-mono text-[11px] text-muted-foreground">
                        {row.subjectKode}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.classroomName}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs tabular-nums text-foreground">
                        Jam {row.jamKe}
                      </span>
                      <span className="text-[11px] tabular-nums text-muted-foreground">
                        {row.startTime}–{row.endTime}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-xs tabular-nums text-foreground">
                    {row.hadir}
                  </TableCell>
                  <TableCell className="text-center text-xs tabular-nums text-muted-foreground">
                    {row.sakit}
                  </TableCell>
                  <TableCell className="text-center text-xs tabular-nums text-muted-foreground">
                    {row.izin}
                  </TableCell>
                  <TableCell className="text-center text-xs tabular-nums text-rose-600 dark:text-rose-400">
                    {row.alfa}
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex justify-end">
                      <AttendanceBar
                        hadir={row.hadir}
                        sakit={row.sakit}
                        izin={row.izin}
                        alfa={row.alfa}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={10} className="h-40 text-center">
                  <p className="text-sm text-muted-foreground">
                    Belum ada data kehadiran pada bulan ini.
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="sm:hidden">
        {rows.length > 0 ? (
          <div className="divide-y">
            {pagedRows.map((row) => (
              <div key={row.id} className="space-y-3 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm text-foreground">{row.subjectName}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.classroomName}
                      <span className="mx-1.5">·</span>
                      <span className="tabular-nums">
                        Jam {row.jamKe} ({row.startTime}–{row.endTime})
                      </span>
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                    {row.date}
                  </span>
                </div>
                <AttendanceBar
                  hadir={row.hadir}
                  sakit={row.sakit}
                  izin={row.izin}
                  alfa={row.alfa}
                />
                <dl className="grid grid-cols-5 gap-2 text-center">
                  {[
                    { label: "H", value: row.hadir, className: "text-foreground" },
                    { label: "S", value: row.sakit, className: "text-muted-foreground" },
                    { label: "I", value: row.izin, className: "text-muted-foreground" },
                    {
                      label: "A",
                      value: row.alfa,
                      className: "text-rose-600 dark:text-rose-400",
                    },
                    { label: "Tot", value: row.total, className: "text-foreground" },
                  ].map((cell) => (
                    <div key={cell.label} className="rounded-md bg-muted/60 py-1">
                      <dt className="text-[10px] tracking-wide text-muted-foreground uppercase">
                        {cell.label}
                      </dt>
                      <dd className={cn("text-xs tabular-nums", cell.className)}>
                        {cell.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-14 text-center">
            <p className="text-sm text-muted-foreground">
              Belum ada data kehadiran pada bulan ini.
            </p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-xs text-muted-foreground sm:text-left">
            Halaman <span className="tabular-nums">{safePage}</span> dari{" "}
            <span className="tabular-nums">{totalPages}</span>
          </p>
          <nav className="flex items-center justify-center gap-1" aria-label="pagination">
            <Link
              href={buildHref({ page: safePage - 1 })}
              aria-disabled={safePage <= 1}
              tabIndex={safePage <= 1 ? -1 : 0}
              className={cn(
                "inline-flex size-7 items-center justify-center rounded-md border text-foreground transition-colors",
                safePage <= 1
                  ? "pointer-events-none opacity-40"
                  : "hover:bg-muted"
              )}
              aria-label="Halaman sebelumnya"
            >
              <ArrowLeftIcon className="size-3.5" />
            </Link>
            {(() => {
              const pages: (number | "ellipsis")[] = []
              for (let p = 1; p <= totalPages; p++) {
                if (p === 1 || p === totalPages || Math.abs(p - safePage) <= 1) {
                  pages.push(p)
                } else if (pages[pages.length - 1] !== "ellipsis") {
                  pages.push("ellipsis")
                }
              }
              return pages.map((p, idx) =>
                p === "ellipsis" ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-xs text-muted-foreground">
                    …
                  </span>
                ) : (
                  <Link
                    key={p}
                    href={buildHref({ page: p })}
                    aria-current={p === safePage ? "page" : undefined}
                    className={cn(
                      "inline-flex size-7 items-center justify-center rounded-md border text-xs tabular-nums transition-colors",
                      p === safePage
                        ? "border-primary bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    {p}
                  </Link>
                )
              )
            })()}
            <Link
              href={buildHref({ page: safePage + 1 })}
              aria-disabled={safePage >= totalPages}
              tabIndex={safePage >= totalPages ? -1 : 0}
              className={cn(
                "inline-flex size-7 items-center justify-center rounded-md border text-foreground transition-colors",
                safePage >= totalPages
                  ? "pointer-events-none opacity-40"
                  : "hover:bg-muted"
              )}
              aria-label="Halaman berikutnya"
            >
              <ArrowRightIcon className="size-3.5" />
            </Link>
          </nav>
        </div>
      )}
    </section>
  )
}
