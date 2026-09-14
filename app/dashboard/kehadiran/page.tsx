import type { Metadata } from "next"
import Link from "next/link"
import { CalendarDaysIcon, ClipboardCheckIcon } from "lucide-react"

import { AttendanceDialog } from "@/components/attendance-dialog"
import { AttendanceReportFilter } from "@/components/attendance-report-filter"
import { KehadiranFilter } from "@/components/kehadiran-filter"
import { KehadiranReportTable } from "@/components/kehadiran/kehadiran-report-table"
import { KehadiranStats } from "@/components/kehadiran/kehadiran-stats"
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
    <div className="flex flex-col gap-8">
      <section className="relative border-4 border-foreground bg-primary p-6 text-primary-foreground shadow-[6px_6px_0px_0px_var(--foreground)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 border-2 border-foreground bg-background px-2.5 py-1 text-[11px] font-bold tracking-wider text-foreground uppercase">
              <ClipboardCheckIcon className="size-3" />
              Absensi Harian
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Kehadiran
            </h1>
            <p className="max-w-lg text-sm font-medium text-primary-foreground/85">
              Isi absensi dari jadwal hari ini, atau lihat rekap bulanan per kelas dan mapel.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 border-2 border-foreground bg-background px-3 py-2 text-foreground">
              <CalendarDaysIcon className="size-3.5" />
              <span className="border-2 border-foreground bg-foreground px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-background uppercase">
                {formatLongDate(date)}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 border-2 border-foreground bg-background px-3 py-2 text-foreground">
              <span className="size-3 bg-foreground" aria-hidden />
              <span className="text-[11px] font-bold tracking-wider uppercase">
                Sesi
              </span>
              <span className="border-2 border-foreground bg-foreground px-2 py-0.5 text-xs font-extrabold tabular-nums text-background">
                {filteredSchedulesToday.length}
              </span>
              <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                · {todayTotal} catatan
              </span>
            </div>
          </div>
        </div>
      </section>

      <KehadiranStats
        filteredCount={filteredSchedulesToday.length}
        filledCount={filledSchedulesToday}
        fillRate={todayFillRate}
        summary={todaySummary}
        filteredHint={
          selectedClassroomId !== "all" || selectedSubjectId !== "all" ? "terfilter" : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-3 border-b-2 border-foreground pb-0">
        <Link
          href={kehadiranHref}
          aria-current={selectedTab === "kehadiran" ? "page" : undefined}
          className={`-mb-[2px] inline-flex items-center gap-2 border-2 border-foreground px-4 py-2.5 text-xs font-extrabold tracking-wider uppercase transition-all ${
            selectedTab === "kehadiran"
              ? "bg-foreground text-background shadow-[3px_3px_0px_0px_var(--foreground)]"
              : "bg-background text-foreground hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--foreground)]"
          }`}
        >
          <ClipboardCheckIcon className="size-3.5" />
          Kehadiran
        </Link>
        <Link
          href={laporanHref}
          aria-current={selectedTab === "laporan" ? "page" : undefined}
          className={`-mb-[2px] inline-flex items-center gap-2 border-2 border-foreground px-4 py-2.5 text-xs font-extrabold tracking-wider uppercase transition-all ${
            selectedTab === "laporan"
              ? "bg-foreground text-background shadow-[3px_3px_0px_0px_var(--foreground)]"
              : "bg-background text-foreground hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--foreground)]"
          }`}
        >
          <CalendarDaysIcon className="size-3.5" />
          Laporan
        </Link>
      </div>

      {selectedTab === "kehadiran" ? (
        <section className="border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_var(--foreground)]">
          <div className="flex flex-col gap-3 border-b-2 border-foreground px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2 className="text-sm font-extrabold tracking-wider text-foreground uppercase">
                Jadwal Hari Ini
              </h2>
              <p className="mt-0.5 text-xs font-medium text-muted-foreground">
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

          <div>
            {filteredSchedulesToday.length > 0 ? (
              filteredSchedulesToday.map((schedule, idx) => {
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
                const isLast = idx === filteredSchedulesToday.length - 1

                return (
                  <div
                    key={schedule.id}
                    className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 ${
                      isLast ? "" : "border-b-2 border-foreground"
                    }`}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className={`flex size-10 shrink-0 items-center justify-center border-2 border-foreground text-xs font-extrabold tabular-nums shadow-[2px_2px_0px_0px_var(--foreground)] ${
                          isFilled
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-foreground"
                        }`}
                      >
                        {schedule.jamKe}
                      </span>
                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <h3 className="text-sm font-extrabold tracking-tight text-foreground">
                            {subject?.name ?? "Mapel tidak ditemukan"}
                          </h3>
                          <span className="border-2 border-foreground bg-muted px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider text-foreground uppercase">
                            Jam ke-{schedule.jamKe}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 border-2 border-foreground px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider uppercase ${
                              isFilled
                                ? "bg-secondary text-secondary-foreground"
                                : "bg-background text-muted-foreground"
                            }`}
                          >
                            <span
                              className={`size-1.5 shrink-0 ${isFilled ? "bg-foreground" : "bg-muted-foreground"}`}
                              aria-hidden
                            />
                            {isFilled ? "Sudah Diisi" : "Belum Diisi"}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground">
                          <span className="font-extrabold text-foreground/90">
                            {classroom?.name ?? "Kelas tidak ditemukan"}
                          </span>
                          <span className="mx-1.5 text-foreground">·</span>
                          <span className="tabular-nums">{schedule.startTime}–{schedule.endTime}</span>
                          <span className="mx-1.5 text-foreground">·</span>
                          <span className="inline-flex items-center gap-1">
                            <span className="border-2 border-foreground bg-foreground px-1 py-0.5 text-[10px] font-extrabold tabular-nums text-background">
                              {classStudents.length}
                            </span>
                            siswa aktif
                          </span>
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
              <div className="px-4 py-14 text-center sm:px-5">
                <p className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
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
        <div className="flex flex-col gap-5">
          <section className="border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_var(--foreground)]">
            <div className="flex flex-col gap-3 border-b-2 border-foreground px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div>
                <h2 className="text-sm font-extrabold tracking-wider text-foreground uppercase">
                  Filter Laporan
                </h2>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground">
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
            <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-5">
              <span className="inline-flex items-center gap-2 border-2 border-foreground bg-accent px-2.5 py-1 text-[11px] font-bold tracking-wider text-accent-foreground uppercase">
                <CalendarDaysIcon className="size-3" />
                Periode
              </span>
              <span className="border-2 border-foreground bg-foreground px-2.5 py-1 text-xs font-extrabold tracking-wider text-background uppercase tabular-nums">
                {labelMonth(reportMonth)}
              </span>
              <span className="border-2 border-foreground bg-background px-2.5 py-1 text-xs font-bold tracking-wider text-foreground uppercase tabular-nums">
                {reportRows.length} sesi tercatat
              </span>
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