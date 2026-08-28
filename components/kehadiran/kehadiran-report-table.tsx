import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { CalendarRangeIcon, TrendingUpIcon } from "lucide-react"

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
    <div className="flex h-2 w-full min-w-24 overflow-hidden rounded-full bg-muted">
      {hadir > 0 ? (
        <span className="bg-emerald-500" style={{ width: `${pct(hadir)}%` }} title={`Hadir ${hadir}`} />
      ) : null}
      {sakit > 0 ? (
        <span className="bg-amber-500" style={{ width: `${pct(sakit)}%` }} title={`Sakit ${sakit}`} />
      ) : null}
      {izin > 0 ? (
        <span className="bg-sky-500" style={{ width: `${pct(izin)}%` }} title={`Izin ${izin}`} />
      ) : null}
      {alfa > 0 ? (
        <span className="bg-destructive" style={{ width: `${pct(alfa)}%` }} title={`Alfa ${alfa}`} />
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
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Laporan bulanan</h2>
            <p className="text-xs text-muted-foreground">
              {monthLabel} · {rows.length} sesi tercatat
            </p>
          </div>
        </div>

        {rows.length > 0 && (
          <div className="grid gap-3 border-b border-border px-4 py-4 sm:grid-cols-2 sm:px-5">
            <div className="flex items-center gap-3 rounded-sm border border-border bg-muted/30 p-3">
              <span className="inline-flex size-9 items-center justify-center rounded-sm bg-primary/10 text-primary">
                <TrendingUpIcon className="size-4" />
              </span>
              <div className="min-w-0 space-y-0.5">
                <p className="text-[11px] text-muted-foreground">Tingkat kehadiran</p>
                <p className="text-lg font-semibold tabular-nums text-foreground">
                  {attendanceRate}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-sm border border-border bg-muted/30 p-3">
              <span className="inline-flex size-9 items-center justify-center rounded-sm bg-muted text-muted-foreground">
                <CalendarRangeIcon className="size-4" />
              </span>
              <div className="min-w-0 space-y-1.5">
                <p className="text-[11px] text-muted-foreground">Distribusi absensi</p>
                <AttendanceBar
                  hadir={monthSummary.hadir}
                  sakit={monthSummary.sakit}
                  izin={monthSummary.izin}
                  alfa={monthSummary.alfa}
                />
                <p className="text-[10px] tabular-nums text-muted-foreground">
                  H {monthSummary.hadir} · S {monthSummary.sakit} · I {monthSummary.izin} · A{" "}
                  {monthSummary.alfa}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 pl-5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  No
                </TableHead>
                <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Tanggal
                </TableHead>
                <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Mapel
                </TableHead>
                <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Kelas
                </TableHead>
                <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Jam
                </TableHead>
                <TableHead className="text-center text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  H
                </TableHead>
                <TableHead className="text-center text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  S
                </TableHead>
                <TableHead className="text-center text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  I
                </TableHead>
                <TableHead className="text-center text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  A
                </TableHead>
                <TableHead className="w-32 pr-5 text-center text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Distribusi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length > 0 ? (
                pagedRows.map((row, index) => (
                  <TableRow key={row.id} className="group">
                    <TableCell className="pl-5 text-xs tabular-nums text-muted-foreground">
                      {(safePage - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-xs tabular-nums text-foreground">
                          {row.date}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {labelDay(row.day || getDayName(row.date))}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {row.subjectName}
                      {row.subjectKode ? (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({row.subjectKode})
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {row.classroomName}
                    </TableCell>
                    <TableCell className="text-xs tabular-nums text-muted-foreground">
                      {row.jamKe} · {row.startTime}–{row.endTime}
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
                    <TableCell className="text-center text-xs tabular-nums text-muted-foreground">
                      {row.alfa}
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

        <div className="divide-y divide-border sm:hidden">
          {rows.length > 0 ? (
            pagedRows.map((row) => (
              <div key={row.id} className="space-y-3 px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-medium text-foreground">{row.subjectName}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.classroomName}
                      <span className="mx-1.5 text-border">·</span>
                      Jam {row.jamKe} ({row.startTime}–{row.endTime})
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
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
                    <dt className="text-[10px] text-muted-foreground">H</dt>
                    <dd className="font-medium tabular-nums text-foreground">{row.hadir}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-muted-foreground">S</dt>
                    <dd className="tabular-nums text-muted-foreground">{row.sakit}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-muted-foreground">I</dt>
                    <dd className="tabular-nums text-muted-foreground">{row.izin}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-muted-foreground">A</dt>
                    <dd className="tabular-nums text-muted-foreground">{row.alfa}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-muted-foreground">Tot</dt>
                    <dd className="font-medium tabular-nums text-foreground">{row.total}</dd>
                  </div>
                </dl>
              </div>
            ))
          ) : (
            <div className="px-4 py-14 text-center">
              <p className="text-sm text-muted-foreground">
                Belum ada data kehadiran pada bulan ini.
              </p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="border-t border-border px-4 py-3">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    text="Sebelumnya"
                    href={buildHref({ page: safePage - 1 })}
                    aria-disabled={safePage <= 1}
                    className={safePage <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const showPage = p === 1 || p === totalPages || Math.abs(p - safePage) <= 1
                  const showEllipsisBefore = p === safePage - 2 && safePage - 2 > 1
                  const showEllipsisAfter = p === safePage + 2 && safePage + 2 < totalPages

                  if (showEllipsisBefore) {
                    return (
                      <PaginationItem key="ellipsis-before">
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }
                  if (showEllipsisAfter) {
                    return (
                      <PaginationItem key="ellipsis-after">
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }
                  if (!showPage) return null

                  return (
                    <PaginationItem key={p}>
                      <PaginationLink href={buildHref({ page: p })} isActive={p === safePage}>
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}

                <PaginationItem>
                  <PaginationNext
                    text="Berikutnya"
                    href={buildHref({ page: safePage + 1 })}
                    aria-disabled={safePage >= totalPages}
                    className={safePage >= totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
