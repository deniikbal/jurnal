import type { Metadata } from "next"
import Link from "next/link"

import { AttendanceDialog } from "@/components/attendance-dialog"
import { AttendanceReportFilter } from "@/components/attendance-report-filter"
import { KehadiranFilter } from "@/components/kehadiran-filter"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  getAttendancesForCurrentUser,
  getKelasForCurrentUser,
  getSchedulesForCurrentUser,
  getSiswaForCurrentUser,
  getSubjectsForCurrentUser,
} from "@/lib/dal"

export const metadata: Metadata = { title: "Kehadiran" }

type KehadiranPageProps = {
  searchParams: Promise<{ month?: string; tab?: string; classroomId?: string; subjectId?: string; page?: string }>
}

const dayMap = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"]

function today() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

function currentMonth() {
  return today().slice(0, 7)
}

function isValidMonth(month?: string) {
  return /^\d{4}-\d{2}$/.test(month ?? "")
}

function labelMonth(month: string) {
  return new Date(`${month}-01T00:00:00`).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  })
}

function getDayName(date: string) {
  return dayMap[new Date(`${date}T12:00:00+07:00`).getUTCDay()]
}

function labelDay(day: string) {
  return day[0].toUpperCase() + day.slice(1)
}

function buildHref(params: {
  tab?: string
  classroomId?: string
  subjectId?: string
  month?: string
  page?: number
}) {
  const search = new URLSearchParams()
  if (params.tab && params.tab !== "kehadiran") search.set("tab", params.tab)
  if (params.classroomId && params.classroomId !== "all") {
    search.set("classroomId", params.classroomId)
  }
  if (params.subjectId && params.subjectId !== "all") {
    search.set("subjectId", params.subjectId)
  }
  if (params.month && params.month !== currentMonth()) search.set("month", params.month)
  if (params.page && params.page > 1) search.set("page", String(params.page))
  const query = search.toString()
  return query ? `/dashboard/kehadiran?${query}` : "/dashboard/kehadiran"
}

export default async function KehadiranPage({ searchParams }: KehadiranPageProps) {
  const params = await searchParams
  const date = today()
  const reportMonth = isValidMonth(params.month) ? params.month! : currentMonth()
  const selectedTab = params.tab === "laporan" ? "laporan" : "kehadiran"
  const selectedClassroomId = params.classroomId ?? "all"
  const selectedSubjectId = params.subjectId ?? "all"
  const PAGE_SIZE = 10
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10) || 1)
  const selectedDay = getDayName(date)

  const [schedules, subjects, classrooms, students, attendances] = await Promise.all([
    getSchedulesForCurrentUser(),
    getSubjectsForCurrentUser(),
    getKelasForCurrentUser(),
    getSiswaForCurrentUser(),
    getAttendancesForCurrentUser(),
  ])

  const subjectById = new Map(subjects.map((item) => [item.id, item]))
  const classroomById = new Map(classrooms.map((item) => [item.id, item]))
  const studentsByClassroom = new Map<string, typeof students>()

  for (const student of students.filter((item) => item.status === "aktif")) {
    const list = studentsByClassroom.get(student.classroomId) ?? []
    list.push(student)
    studentsByClassroom.set(student.classroomId, list)
  }

  const schedulesToday = schedules
    .filter((item) => item.day === selectedDay)
    .sort((a, b) => a.jamKe - b.jamKe || a.startTime.localeCompare(b.startTime))
  const filteredSchedulesToday = schedulesToday.filter(
    (item) =>
      (selectedClassroomId === "all" || item.classroomId === selectedClassroomId) &&
      (selectedSubjectId === "all" || item.subjectId === selectedSubjectId),
  )
  const attendancesToday = attendances.filter((item) => item.date === date)
  const attendanceBySchedule = new Map<string, typeof attendancesToday>()

  for (const item of attendancesToday) {
    const list = attendanceBySchedule.get(item.scheduleId) ?? []
    list.push(item)
    attendanceBySchedule.set(item.scheduleId, list)
  }

  const reportAttendances = attendances.filter(
    (item) =>
      item.date.startsWith(`${reportMonth}-`) &&
      (selectedClassroomId === "all" || item.classroomId === selectedClassroomId) &&
      (selectedSubjectId === "all" || item.subjectId === selectedSubjectId),
  )
  const reportAttendanceByDateAndSchedule = new Map<string, typeof reportAttendances>()

  for (const item of reportAttendances) {
    const key = `${item.date}:${item.scheduleId}`
    const list = reportAttendanceByDateAndSchedule.get(key) ?? []
    list.push(item)
    reportAttendanceByDateAndSchedule.set(key, list)
  }

  const reportRows = Array.from(reportAttendanceByDateAndSchedule.entries())
    .map(([id, items]) => {
      const first = items[0]
      return {
        id,
        date: first.date,
        day: first.day,
        subjectName: first.subjectName,
        subjectKode: first.subjectKode,
        classroomName: first.classroomName,
        jamKe: first.jamKe,
        startTime: first.startTime,
        endTime: first.endTime,
        hadir: items.filter((item) => item.status === "hadir").length,
        sakit: items.filter((item) => item.status === "sakit").length,
        izin: items.filter((item) => item.status === "izin").length,
        alfa: items.filter((item) => item.status === "alfa").length,
        total: items.length,
      }
    })
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || a.jamKe - b.jamKe || a.startTime.localeCompare(b.startTime),
    )

  const totalPages = Math.max(1, Math.ceil(reportRows.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const pagedReportRows = reportRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const totalHadir = attendancesToday.filter((item) => item.status === "hadir").length
  const totalTidakHadir = attendancesToday.filter((item) => item.status !== "hadir").length
  const filledSchedules = filteredSchedulesToday.filter((item) =>
    attendanceBySchedule.has(item.id),
  ).length

  const kehadiranHref = buildHref({
    tab: "kehadiran",
    classroomId: selectedClassroomId,
    subjectId: selectedSubjectId,
  })
  const laporanHref = buildHref({
    tab: "laporan",
    classroomId: selectedClassroomId,
    subjectId: selectedSubjectId,
    month: reportMonth,
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Absensi harian
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Kehadiran</h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Isi absensi dari jadwal hari ini, atau lihat rekap bulanan per kelas dan mapel.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4 sm:gap-x-8">
          <div>
            <dt className="text-[11px] text-muted-foreground">Jadwal hari ini</dt>
            <dd className="font-semibold tabular-nums text-foreground">
              {filteredSchedulesToday.length}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Sudah diisi</dt>
            <dd className="font-semibold tabular-nums text-foreground">{filledSchedules}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Hadir</dt>
            <dd className="font-semibold tabular-nums text-foreground">{totalHadir}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Tidak hadir</dt>
            <dd className="font-semibold tabular-nums text-foreground">{totalTidakHadir}</dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border">
        <Link
          href={kehadiranHref}
          className={`-mb-px border-b-2 pb-2.5 text-sm transition-colors ${
            selectedTab === "kehadiran"
              ? "border-foreground font-medium text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Kehadiran
        </Link>
        <Link
          href={laporanHref}
          className={`-mb-px border-b-2 pb-2.5 text-sm transition-colors ${
            selectedTab === "laporan"
              ? "border-foreground font-medium text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Laporan
        </Link>
      </div>

      {selectedTab === "kehadiran" ? (
        <section className="overflow-hidden rounded-md border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Jadwal hari ini</h2>
              <p className="text-xs text-muted-foreground">
                {labelDay(selectedDay)} · {date}
                {selectedClassroomId !== "all" &&
                  ` · ${classroomById.get(selectedClassroomId)?.name ?? "Kelas"}`}
                {selectedSubjectId !== "all" &&
                  ` · ${subjectById.get(selectedSubjectId)?.name ?? "Mapel"}`}
              </p>
            </div>
            <KehadiranFilter
              classroomId={selectedClassroomId}
              subjectId={selectedSubjectId}
              classrooms={classrooms}
              subjects={subjects}
            />
          </div>

          <div className="divide-y divide-border">
            {filteredSchedulesToday.length > 0 ? (
              filteredSchedulesToday.map((schedule) => {
                const subject = subjectById.get(schedule.subjectId)
                const classroom = classroomById.get(schedule.classroomId)
                const classStudents = (studentsByClassroom.get(schedule.classroomId) ?? []).toSorted(
                  (a, b) =>
                    a.name.localeCompare(b.name, "id-ID", {
                      numeric: true,
                      sensitivity: "base",
                    }),
                )
                const scheduleAttendances = attendanceBySchedule.get(schedule.id) ?? []
                const statuses = Object.fromEntries(
                  scheduleAttendances.map((item) => [item.siswaId, item.status]),
                )
                const isFilled = scheduleAttendances.length > 0

                return (
                  <div
                    key={schedule.id}
                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <h3 className="text-sm font-medium text-foreground">
                          {subject?.name ?? "Mapel tidak ditemukan"}
                        </h3>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          Jam ke-{schedule.jamKe}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <span
                            className={`size-1.5 shrink-0 rounded-full ${
                              isFilled
                                ? "bg-emerald-600 dark:bg-emerald-400"
                                : "bg-stone-400"
                            }`}
                            aria-hidden
                          />
                          <span
                            className={
                              isFilled ? "text-foreground" : "text-muted-foreground"
                            }
                          >
                            {isFilled ? "Sudah diisi" : "Belum diisi"}
                          </span>
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {classroom?.name ?? "Kelas tidak ditemukan"}
                        <span className="mx-1.5 text-border">·</span>
                        {schedule.startTime}–{schedule.endTime}
                        <span className="mx-1.5 text-border">·</span>
                        {classStudents.length} siswa aktif
                      </p>
                    </div>
                    <div className="shrink-0 self-end sm:self-center">
                      <AttendanceDialog
                        date={date}
                        schedule={schedule}
                        subjectName={subject?.name ?? "Mapel tidak ditemukan"}
                        classroomName={classroom?.name ?? "Kelas tidak ditemukan"}
                        students={classStudents}
                        statuses={statuses}
                      />
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="px-4 py-14 text-center sm:px-5">
                <p className="text-sm text-muted-foreground">
                  Tidak ada jadwal untuk {labelDay(selectedDay)}
                  {selectedClassroomId !== "all" || selectedSubjectId !== "all"
                    ? " dengan filter ini"
                    : ""}
                  .
                </p>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="overflow-hidden rounded-md border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Laporan bulanan</h2>
              <p className="text-xs text-muted-foreground">
                {labelMonth(reportMonth)} · {reportRows.length} sesi tercatat
              </p>
            </div>
            <AttendanceReportFilter
              month={reportMonth}
              currentMonth={currentMonth()}
              classroomId={selectedClassroomId}
              subjectId={selectedSubjectId}
              classrooms={classrooms}
              subjects={subjects}
            />
          </div>

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
                  <TableHead className="pr-5 text-center text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportRows.length > 0 ? (
                  pagedReportRows.map((row, index) => (
                    <TableRow key={row.id} className="group">
                      <TableCell className="pl-5 text-xs tabular-nums text-muted-foreground">
                        {(safePage - 1) * PAGE_SIZE + index + 1}
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
                      <TableCell className="pr-5 text-center text-xs font-medium tabular-nums text-foreground">
                        {row.total}
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
            {reportRows.length > 0 ? (
              pagedReportRows.map((row) => (
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
                      href={buildHref({
                        tab: "laporan",
                        classroomId: selectedClassroomId,
                        subjectId: selectedSubjectId,
                        month: reportMonth,
                        page: safePage - 1,
                      })}
                      aria-disabled={safePage <= 1}
                      className={safePage <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const showPage =
                      p === 1 || p === totalPages || Math.abs(p - safePage) <= 1
                    const showEllipsisBefore = p === safePage - 2 && safePage - 2 > 1
                    const showEllipsisAfter = p === safePage + 2 && safePage + 2 < totalPages

                    if (showEllipsisBefore) {
                      return (
                        <PaginationItem key={`ellipsis-before`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    }
                    if (showEllipsisAfter) {
                      return (
                        <PaginationItem key={`ellipsis-after`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    }
                    if (!showPage) return null

                    return (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href={buildHref({
                            tab: "laporan",
                            classroomId: selectedClassroomId,
                            subjectId: selectedSubjectId,
                            month: reportMonth,
                            page: p,
                          })}
                          isActive={p === safePage}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}

                  <PaginationItem>
                    <PaginationNext
                      text="Berikutnya"
                      href={buildHref({
                        tab: "laporan",
                        classroomId: selectedClassroomId,
                        subjectId: selectedSubjectId,
                        month: reportMonth,
                        page: safePage + 1,
                      })}
                      aria-disabled={safePage >= totalPages}
                      className={safePage >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
