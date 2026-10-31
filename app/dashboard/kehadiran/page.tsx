import type { Metadata } from "next"
import Link from "next/link"
import { CalendarDaysIcon, ClipboardCheckIcon } from "lucide-react"

import { AttendanceDialog } from "@/components/attendance-dialog"
import { AttendanceReportFilter } from "@/components/attendance-report-filter"
import { KehadiranFilter } from "@/components/kehadiran-filter"
import { KehadiranReportTable } from "@/components/kehadiran/kehadiran-report-table"
import { KehadiranStats } from "@/components/kehadiran/kehadiran-stats"
import { PageHeader } from "@/components/page-header"
import { cn } from "@/lib/utils"
import {
  getAttendancesForCurrentUser,
  getKelasForCurrentUser,
  getSchedulesForCurrentUser,
  getSiswaForCurrentUser,
  getSubjectsForCurrentUser,
} from "@/lib/dal"

export const metadata: Metadata = { title: "Kehadiran" }

type KehadiranPageProps = {
  searchParams: Promise<{
    month?: string
    tab?: string
    classroomId?: string
    subjectId?: string
    page?: string
  }>
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

function formatLongDate(date: string) {
  return new Date(`${date}T12:00:00+07:00`).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
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

  const todaySummary = {
    hadir: attendancesToday.filter((i) => i.status === "hadir").length,
    sakit: attendancesToday.filter((i) => i.status === "sakit").length,
    izin: attendancesToday.filter((i) => i.status === "izin").length,
    alfa: attendancesToday.filter((i) => i.status === "alfa").length,
  }
  const todayTotal =
    todaySummary.hadir + todaySummary.sakit + todaySummary.izin + todaySummary.alfa
  const filledSchedulesToday = filteredSchedulesToday.filter((s) =>
    attendanceBySchedule.has(s.id),
  ).length
  const todayFillRate =
    filteredSchedulesToday.length > 0
      ? Math.round((filledSchedulesToday / filteredSchedulesToday.length) * 100)
      : 0

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

  const monthSummary = reportRows.reduce(
    (acc, row) => {
      acc.hadir += row.hadir
      acc.sakit += row.sakit
      acc.izin += row.izin
      acc.alfa += row.alfa
      acc.total += row.total
      return acc
    },
    { hadir: 0, sakit: 0, izin: 0, alfa: 0, total: 0 },
  )

  const totalPages = Math.max(1, Math.ceil(reportRows.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const pagedReportRows = reportRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

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
      <PageHeader
        title="Kehadiran"
        description="Isi absensi dari jadwal hari ini, atau lihat rekap bulanan per kelas dan mapel."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-lg bg-card px-2.5 py-1.5 text-xs text-muted-foreground ring-1 ring-foreground/10">
              <CalendarDaysIcon className="size-3.5" />
              <span className="tabular-nums">{formatLongDate(date)}</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg bg-card px-2.5 py-1.5 text-xs text-muted-foreground ring-1 ring-foreground/10">
              <span className="tabular-nums text-foreground">
                {filteredSchedulesToday.length}
              </span>
              sesi
              <span className="text-border">|</span>
              <span className="tabular-nums text-foreground">{todayTotal}</span>
              catatan
            </span>
          </div>
        }
      />

      <KehadiranStats
        filteredCount={filteredSchedulesToday.length}
        filledCount={filledSchedulesToday}
        fillRate={todayFillRate}
        summary={todaySummary}
        filteredHint={
          selectedClassroomId !== "all" || selectedSubjectId !== "all" ? "terfilter" : undefined
        }
      />

      <div className="flex items-center gap-1 border-b">
        <Link
          href={kehadiranHref}
          aria-current={selectedTab === "kehadiran" ? "page" : undefined}
          className={cn(
            "-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm transition-colors",
            selectedTab === "kehadiran"
              ? "border-foreground font-medium text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <ClipboardCheckIcon className="size-4" />
          Kehadiran
        </Link>
        <Link
          href={laporanHref}
          aria-current={selectedTab === "laporan" ? "page" : undefined}
          className={cn(
            "-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm transition-colors",
            selectedTab === "laporan"
              ? "border-foreground font-medium text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <CalendarDaysIcon className="size-4" />
          Laporan
        </Link>
      </div>

      {selectedTab === "kehadiran" ? (
        <section className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-medium text-foreground">Jadwal hari ini</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {labelDay(selectedDay)} · <span className="tabular-nums">{date}</span>
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

          <div>
            {filteredSchedulesToday.length > 0 ? (
              filteredSchedulesToday.map((schedule) => {
                const subject = subjectById.get(schedule.subjectId)
                const classroom = classroomById.get(schedule.classroomId)
                const classStudents = (
                  studentsByClassroom.get(schedule.classroomId) ?? []
                ).toSorted((a, b) =>
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
                    className="flex flex-col gap-3 border-b px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-medium tabular-nums",
                          isFilled
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {schedule.jamKe}
                      </span>
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <h3 className="text-sm font-medium text-foreground">
                            {subject?.name ?? "Mapel tidak ditemukan"}
                          </h3>
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <span
                              className={cn(
                                "size-1.5 shrink-0 rounded-full",
                                isFilled ? "bg-emerald-500" : "bg-muted-foreground/40"
                              )}
                              aria-hidden
                            />
                            {isFilled ? "Sudah diisi" : "Belum diisi"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          <span className="text-foreground/80">
                            {classroom?.name ?? "Kelas tidak ditemukan"}
                          </span>
                          <span className="mx-1.5">·</span>
                          <span className="tabular-nums">
                            {schedule.startTime}–{schedule.endTime}
                          </span>
                          <span className="mx-1.5">·</span>
                          <span className="tabular-nums">{classStudents.length}</span> siswa aktif
                        </p>
                      </div>
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
              <div className="px-4 py-14 text-center">
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
        <div className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
            <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-medium text-foreground">Filter laporan</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Pilih bulan, kelas, dan mapel untuk membatasi data.
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
            <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 text-xs text-muted-foreground">
              <CalendarDaysIcon className="size-3.5" />
              <span className="tabular-nums text-foreground">{labelMonth(reportMonth)}</span>
              <span className="text-border">|</span>
              <span className="tabular-nums text-foreground">{reportRows.length}</span> sesi
              tercatat
            </div>
          </section>

          <KehadiranReportTable
            monthLabel={labelMonth(reportMonth)}
            rows={reportRows}
            pagedRows={pagedReportRows}
            totalPages={totalPages}
            safePage={safePage}
            pageSize={PAGE_SIZE}
            monthSummary={monthSummary}
            buildHref={(p) =>
              buildHref({
                tab: "laporan",
                classroomId: selectedClassroomId,
                subjectId: selectedSubjectId,
                month: reportMonth,
                page: p.page,
              })
            }
            selectedClassroomId={selectedClassroomId}
            selectedSubjectId={selectedSubjectId}
            reportMonth={reportMonth}
          />
        </div>
      )}
    </div>
  )
}
