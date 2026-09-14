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
  const pct = (n: number) => Math.round((n / total) * 100)
  return (
    <div className="flex h-3 w-full min-w-24 overflow-hidden border-2 border-foreground bg-muted">
      {hadir > 0 ? (
        <span
          className="bg-secondary"
          style={{ width: `${pct(hadir)}%` }}
          title={`Hadir ${hadir}`}
        />
      ) : null}
      {sakit > 0 ? (
        <span
          className="bg-primary"
          style={{ width: `${pct(sakit)}%` }}
          title={`Sakit ${sakit}`}
        />
      ) : null}
      {izin > 0 ? (
        <span
          className="bg-accent"
          style={{ width: `${pct(izin)}%` }}
          title={`Izin ${izin}`}
        />
      ) : null}
      {alfa > 0 ? (
        <span
          className="bg-foreground"
          style={{ width: `${pct(alfa)}%` }}
          title={`Alfa ${alfa}`}
        />
      ) : null}
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
  selectedClassroomId,
  selectedSubjectId,
  reportMonth,
}: Props) {
  const attendanceRate =
    monthSummary.total > 0 ? Math.round((monthSummary.hadir / monthSummary.total) * 100) : 0

  return (
    <section className="border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_var(--foreground)]">
      <div className="flex flex-col gap-3 border-b-2 border-foreground px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h2 className="text-sm font-extrabold tracking-wider text-foreground uppercase">
            Laporan Bulanan
          </h2>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">
            {monthLabel} · {rows.length} sesi tercatat
          </p>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="grid gap-4 border-b-2 border-foreground p-4 sm:grid-cols-2 sm:px-5">
          <div className="border-2 border-foreground bg-secondary p-4 text-secondary-foreground shadow-[3px_3px_0px_0px_var(--foreground)]">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center border-2 border-foreground bg-background text-foreground">
                <TrendingUpIcon className="size-4" />
              </span>
              <div className="min-w-0 space-y-1">
                <p className="text-[10px] font-bold tracking-wider text-secondary-foreground/80 uppercase">
                  Tingkat Kehadiran
                </p>
                <p className="text-3xl font-extrabold tabular-nums leading-none">
                  {attendanceRate}
                  <span className="ml-1 text-base font-bold text-secondary-foreground/70">
                    %
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className="border-2 border-foreground bg-card p-4 text-foreground shadow-[3px_3px_0px_0px_var(--foreground)]">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center border-2 border-foreground bg-accent text-accent-foreground">
                <CalendarRangeIcon className="size-4" />
              </span>
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Distribusi Absensi
                </p>
                <AttendanceBar
                  hadir={monthSummary.hadir}
                  sakit={monthSummary.sakit}
                  izin={monthSummary.izin}
                  alfa={monthSummary.alfa}
                />
                <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase tabular-nums">
                  H{" "}
                  <span className="border-2 border-foreground bg-background px-1 font-extrabold text-foreground">
                    {monthSummary.hadir}
                  </span>{" "}
                  · S{" "}
                  <span className="border-2 border-foreground bg-background px-1 font-extrabold text-foreground">
                    {monthSummary.sakit}
                  </span>{" "}
                  · I{" "}
                  <span className="border-2 border-foreground bg-background px-1 font-extrabold text-foreground">
                    {monthSummary.izin}
                  </span>{" "}
                  · A{" "}
                  <span className="border-2 border-foreground bg-background px-1 font-extrabold text-foreground">
                    {monthSummary.alfa}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 border-b-2 border-foreground bg-muted pl-5 text-[11px] font-extrabold tracking-wider text-foreground uppercase">
                No
              </TableHead>
              <TableHead className="border-b-2 border-foreground bg-muted text-[11px] font-extrabold tracking-wider text-foreground uppercase">
                Tanggal
              </TableHead>
              <TableHead className="border-b-2 border-foreground bg-muted text-[11px] font-extrabold tracking-wider text-foreground uppercase">
                Mapel
              </TableHead>
              <TableHead className="border-b-2 border-foreground bg-muted text-[11px] font-extrabold tracking-wider text-foreground uppercase">
                Kelas
              </TableHead>
              <TableHead className="border-b-2 border-foreground bg-muted text-[11px] font-extrabold tracking-wider text-foreground uppercase">
                Jam
              </TableHead>
              <TableHead className="border-b-2 border-foreground bg-muted text-center text-[11px] font-extrabold tracking-wider text-foreground uppercase">
                H
              </TableHead>
              <TableHead className="border-b-2 border-foreground bg-muted text-center text-[11px] font-extrabold tracking-wider text-foreground uppercase">
                S
              </TableHead>
              <TableHead className="border-b-2 border-foreground bg-muted text-center text-[11px] font-extrabold tracking-wider text-foreground uppercase">
                I
              </TableHead>
              <TableHead className="border-b-2 border-foreground bg-muted text-center text-[11px] font-extrabold tracking-wider text-foreground uppercase">
                A
              </TableHead>
              <TableHead className="w-32 border-b-2 border-foreground bg-muted pr-5 text-center text-[11px] font-extrabold tracking-wider text-foreground uppercase">
                Distribusi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              pagedRows.map((row, index) => (
                <TableRow key={row.id} className="group border-b-2 border-foreground hover:bg-muted/40">
                  <TableCell className="pl-5 text-xs font-extrabold tabular-nums text-foreground">
                    {(safePage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="border-2 border-foreground bg-background px-1.5 py-0.5 font-mono text-[11px] font-extrabold tabular-nums text-foreground">
                        {row.date}
                      </span>
                      <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                        {labelDay(row.day || getDayName(row.date))}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-extrabold text-foreground">
                      {row.subjectName}
                      {row.subjectKode ? (
                        <span className="ml-1.5 border-2 border-foreground bg-secondary px-1 py-0.5 text-[10px] font-bold tracking-wider text-secondary-foreground uppercase">
                          {row.subjectKode}
                        </span>
                      ) : null}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="border-2 border-foreground bg-muted px-1.5 py-0.5 text-xs font-bold tracking-wider text-foreground uppercase">
                      {row.classroomName}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="border-2 border-foreground bg-primary px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider text-primary-foreground uppercase tabular-nums">
                        Jam {row.jamKe}
                      </span>
                      <span className="text-[10px] tabular-nums text-muted-foreground">
                        {row.startTime}–{row.endTime}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="border-2 border-foreground bg-secondary px-2 py-0.5 text-xs font-extrabold tabular-nums text-secondary-foreground">
                      {row.hadir}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="border-2 border-foreground bg-background px-2 py-0.5 text-xs font-extrabold tabular-nums text-foreground">
                      {row.sakit}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="border-2 border-foreground bg-background px-2 py-0.5 text-xs font-extrabold tabular-nums text-foreground">
                      {row.izin}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="border-2 border-foreground bg-foreground px-2 py-0.5 text-xs font-extrabold tabular-nums text-background">
                      {row.alfa}
                    </span>
                  </TableCell>
                  <TableCell className="pr-5">
                    <AttendanceBar
                      hadir={row.hadir}
                      sakit={row.sakit}
                      izin={row.izin}
                      alfa={row.alfa}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={10} className="h-40 border-b-2 border-foreground text-center">
                  <p className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
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
          <div>
            {pagedRows.map((row, idx) => (
              <div
                key={row.id}
                className={cn(
                  "space-y-3 px-4 py-4",
                  idx === pagedRows.length - 1 ? "" : "border-b-2 border-foreground",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-extrabold text-foreground">
                      {row.subjectName}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">
                      <span className="border-2 border-foreground bg-muted px-1 py-0.5 font-bold tracking-wider text-foreground uppercase">
                        {row.classroomName}
                      </span>
                      <span className="mx-1.5 text-foreground">·</span>
                      <span className="tabular-nums">
                        Jam {row.jamKe} ({row.startTime}–{row.endTime})
                      </span>
                    </p>
                  </div>
                  <span className="shrink-0 border-2 border-foreground bg-background px-1.5 py-0.5 font-mono text-[11px] font-extrabold tabular-nums text-foreground">
                    {row.date}
                  </span>
                </div>
                <AttendanceBar
                  hadir={row.hadir}
                  sakit={row.sakit}
                  izin={row.izin}
                  alfa={row.alfa}
                />
                <dl className="grid grid-cols-5 gap-2 text-center text-xs">
                  <div>
                    <dt className="border-2 border-foreground bg-muted py-0.5 text-[10px] font-bold tracking-wider text-foreground uppercase">
                      H
                    </dt>
                    <dd className="mt-1 border-2 border-foreground bg-secondary py-0.5 font-extrabold tabular-nums text-secondary-foreground">
                      {row.hadir}
                    </dd>
                  </div>
                  <div>
                    <dt className="border-2 border-foreground bg-muted py-0.5 text-[10px] font-bold tracking-wider text-foreground uppercase">
                      S
                    </dt>
                    <dd className="mt-1 border-2 border-foreground bg-background py-0.5 font-extrabold tabular-nums text-foreground">
                      {row.sakit}
                    </dd>
                  </div>
                  <div>
                    <dt className="border-2 border-foreground bg-muted py-0.5 text-[10px] font-bold tracking-wider text-foreground uppercase">
                      I
                    </dt>
                    <dd className="mt-1 border-2 border-foreground bg-background py-0.5 font-extrabold tabular-nums text-foreground">
                      {row.izin}
                    </dd>
                  </div>
                  <div>
                    <dt className="border-2 border-foreground bg-muted py-0.5 text-[10px] font-bold tracking-wider text-foreground uppercase">
                      A
                    </dt>
                    <dd className="mt-1 border-2 border-foreground bg-foreground py-0.5 font-extrabold tabular-nums text-background">
                      {row.alfa}
                    </dd>
                  </div>
                  <div>
                    <dt className="border-2 border-foreground bg-muted py-0.5 text-[10px] font-bold tracking-wider text-foreground uppercase">
                      Tot
                    </dt>
                    <dd className="mt-1 border-2 border-foreground bg-primary py-0.5 font-extrabold tabular-nums text-primary-foreground">
                      {row.total}
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-14 text-center">
            <p className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
              Belum ada data kehadiran pada bulan ini.
            </p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 border-t-2 border-foreground px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-center text-[11px] font-bold tracking-wider text-muted-foreground uppercase sm:text-left sm:text-xs">
            Halaman {safePage} dari {totalPages}
          </p>
          <nav className="flex items-center justify-center gap-1.5" aria-label="pagination">
            <Link
              href={buildHref({ page: safePage - 1 })}
              aria-disabled={safePage <= 1}
              tabIndex={safePage <= 1 ? -1 : 0}
              className={cn(
                "inline-flex size-8 items-center justify-center border-2 border-foreground bg-background text-foreground transition-all",
                safePage <= 1
                  ? "pointer-events-none opacity-40"
                  : "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--foreground)]",
              )}
              aria-label="Halaman sebelumnya"
            >
              <ArrowLeftIcon className="size-3.5" />
            </Link>
            {(() => {
              const pages: (number | "ellipsis")[] = []
              for (let p = 1; p <= totalPages; p++) {
                if (
                  p === 1 ||
                  p === totalPages ||
                  Math.abs(p - safePage) <= 1
                ) {
                  pages.push(p)
                } else if (pages[pages.length - 1] !== "ellipsis") {
                  pages.push("ellipsis")
                }
              }
              return pages.map((p, idx) =>
                p === "ellipsis" ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-1 text-xs font-extrabold text-foreground"
                  >
                    …
                  </span>
                ) : (
                  <Link
                    key={p}
                    href={buildHref({ page: p })}
                    aria-current={p === safePage ? "page" : undefined}
                    className={cn(
                      "inline-flex size-8 items-center justify-center border-2 border-foreground text-xs font-extrabold tabular-nums transition-all",
                      p === safePage
                        ? "bg-foreground text-background shadow-[2px_2px_0px_0px_var(--foreground)]"
                        : "bg-background text-foreground hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--foreground)]",
                    )}
                  >
                    {p}
                  </Link>
                ),
              )
            })()}
            <Link
              href={buildHref({ page: safePage + 1 })}
              aria-disabled={safePage >= totalPages}
              tabIndex={safePage >= totalPages ? -1 : 0}
              className={cn(
                "inline-flex size-8 items-center justify-center border-2 border-foreground bg-background text-foreground transition-all",
                safePage >= totalPages
                  ? "pointer-events-none opacity-40"
                  : "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--foreground)]",
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