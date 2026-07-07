import type { Metadata } from "next"
import { CalendarCheckIcon, CheckCircleIcon, ClipboardCheckIcon, FileTextIcon, TableIcon, XCircleIcon } from "lucide-react"

import { AttendanceDialog } from "@/components/attendance-dialog"
import { AttendanceReportFilter } from "@/components/attendance-report-filter"
import { KehadiranFilter } from "@/components/kehadiran-filter"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAttendancesForCurrentUser, getKelasForCurrentUser, getSchedulesForCurrentUser, getSiswaForCurrentUser, getSubjectsForCurrentUser } from "@/lib/dal"

export const metadata: Metadata = { title: "Kehadiran" }

type KehadiranPageProps = {
  searchParams: Promise<{ month?: string; tab?: string; classroomId?: string; subjectId?: string }>
}

const dayMap = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"]

function today() {
  return new Date().toISOString().slice(0, 10)
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
  return dayMap[new Date(`${date}T00:00:00`).getDay()]
}

function labelDay(day: string) {
  return day[0].toUpperCase() + day.slice(1)
}

export default async function KehadiranPage({ searchParams }: KehadiranPageProps) {
  const params = await searchParams
  const date = today()
  const reportMonth = isValidMonth(params.month) ? params.month! : currentMonth()
  const selectedTab = params.tab === "laporan" ? "laporan" : "kehadiran"
  const selectedClassroomId = params.classroomId ?? "all"
  const selectedSubjectId = params.subjectId ?? "all"
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

  const totalHadir = attendancesToday.filter((item) => item.status === "hadir").length
  const totalTidakHadir = attendancesToday.filter((item) => item.status !== "hadir").length
  const filledSchedules = filteredSchedulesToday.filter((item) => attendanceBySchedule.has(item.id)).length

  return (
    <div className="flex flex-col gap-5">
      {/* ===== Page Header ===== */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-600 via-rose-600/90 to-rose-500/80 p-5 shadow-lg shadow-rose-500/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-white/15 ring-2 ring-white/20">
            <ClipboardCheckIcon className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Kehadiran</h1>
            <p className="text-sm text-white/70">Isi kehadiran siswa berdasarkan jadwal yang sudah dibuat.</p>
          </div>
        </div>
      </div>

      {/* ===== Stat Cards ===== */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { key: "jadwal", icon: CalendarCheckIcon, label: "Jadwal Hari Ini", value: filteredSchedulesToday.length },
          { key: "diisi", icon: TableIcon, label: "Sudah Diisi", value: filledSchedules },
          { key: "hadir", icon: CheckCircleIcon, label: "Hadir", value: totalHadir },
          { key: "tidak", icon: XCircleIcon, label: "Tidak Hadir", value: totalTidakHadir },
        ].map((s) => {
          const gradients: Record<string, { gradient: string; iconBg: string; ring: string }> = {
            jadwal: { gradient: "from-rose-500/10 via-rose-500/5 to-transparent", iconBg: "bg-rose-500/15 text-rose-500", ring: "ring-rose-500/20" },
            diisi: { gradient: "from-blue-500/10 via-blue-500/5 to-transparent", iconBg: "bg-blue-500/15 text-blue-500", ring: "ring-blue-500/20" },
            hadir: { gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent", iconBg: "bg-emerald-500/15 text-emerald-500", ring: "ring-emerald-500/20" },
            tidak: { gradient: "from-red-500/10 via-red-500/5 to-transparent", iconBg: "bg-red-500/15 text-red-500", ring: "ring-red-500/20" },
          }
          const c = gradients[s.key]
          return (
            <div key={s.key} className={`group relative overflow-hidden rounded-xl p-4 ring-1 ${c.gradient} ${c.ring} shadow-sm transition-all duration-200 hover:shadow-md`}>
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground/80 uppercase">{s.label}</p>
                  <p className="text-2xl font-bold tabular-nums tracking-tight">{s.value}</p>
                </div>
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${c.iconBg}`}>
                  <s.icon className="size-4" />
                </div>
              </div>
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted/50">
                <div className="h-full rounded-full bg-gradient-to-r from-primary/40 to-primary/60 transition-all duration-500" style={{ width: `${Math.min((Number(s.value) / Math.max(filteredSchedulesToday.length, 1)) * 100, 100)}%` }} />
              </div>
            </div>
          )
        })}
      </section>

      {/* ===== Tabs ===== */}
      <Tabs defaultValue={selectedTab} className="gap-4">
        <TabsList>
          <TabsTrigger value="kehadiran" className="data-[state=active]:shadow-sm data-[state=active]:border-primary hover:bg-muted">
            <ClipboardCheckIcon />
            Kehadiran
          </TabsTrigger>
          <TabsTrigger value="laporan" className="data-[state=active]:shadow-sm data-[state=active]:border-primary hover:bg-muted">
            <FileTextIcon />
            Laporan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kehadiran">
          <Card>
            <CardHeader className="gap-4 pb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-rose-500/10">
                    <ClipboardCheckIcon className="size-4 text-rose-500" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">Daftar Jadwal Kehadiran</CardTitle>
                    <p className="text-xs text-muted-foreground">Filter kelas dan mapel, lalu isi keterangan hadir, sakit, izin, atau alfa</p>
                  </div>
                </div>
                <KehadiranFilter classroomId={selectedClassroomId} subjectId={selectedSubjectId} classrooms={classrooms} subjects={subjects} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: labelDay(selectedDay), variant: "default" as const },
                  { label: "Hari ini", variant: "secondary" as const },
                  { label: selectedClassroomId === "all" ? "Semua Kelas" : classroomById.get(selectedClassroomId)?.name ?? "Kelas tidak ditemukan", variant: "outline" as const },
                  { label: selectedSubjectId === "all" ? "Semua Mapel" : subjectById.get(selectedSubjectId)?.name ?? "Mapel tidak ditemukan", variant: "outline" as const },
                ].map((b) => (
                  <Badge key={b.label} variant={b.variant} className="text-[10px]">{b.label}</Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSchedulesToday.length > 0 ? (
                  filteredSchedulesToday.map((schedule) => {
                    const subject = subjectById.get(schedule.subjectId)
                    const classroom = classroomById.get(schedule.classroomId)
                    const classStudents = (studentsByClassroom.get(schedule.classroomId) ?? []).toSorted((a, b) =>
                      a.name.localeCompare(b.name, "id-ID", { numeric: true, sensitivity: "base" }),
                    )
                    const scheduleAttendances = attendanceBySchedule.get(schedule.id) ?? []
                    const statuses = Object.fromEntries(scheduleAttendances.map((item) => [item.siswaId, item.status]))
                    const isFilled = scheduleAttendances.length > 0

                    return (
                      <div key={schedule.id} className="group relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30">
                        <div className={`absolute inset-y-0 left-0 w-1 rounded-l-xl ${isFilled ? "bg-gradient-to-b from-emerald-500 to-emerald-400" : "bg-gradient-to-b from-muted-foreground/30 to-muted-foreground/10"}`} />
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pl-3">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-semibold">{subject?.name ?? "Mapel tidak ditemukan"}</h3>
                              <Badge variant="secondary" className="border-primary/20 bg-primary/10 text-[10px] font-medium text-primary">Jam {schedule.jamKe}</Badge>
                              <Badge variant="secondary" className={
                                isFilled
                                  ? "border-emerald-500/20 bg-emerald-500/10 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"
                                  : "border-muted-foreground/20 bg-muted/50 text-[10px] font-medium text-muted-foreground"
                              }>
                                <span className={`mr-1 inline-block size-1.5 rounded-full ${isFilled ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                                {isFilled ? "Sudah diisi" : "Belum diisi"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {classroom?.name ?? "Kelas tidak ditemukan"} • {schedule.startTime}–{schedule.endTime} • {classStudents.length} siswa aktif
                            </p>
                          </div>
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
                  <div className="flex flex-col items-center gap-2 rounded-xl border py-12">
                    <ClipboardCheckIcon className="size-8 text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground">Tidak ada jadwal yang sesuai dengan filter untuk hari {labelDay(selectedDay)}.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="laporan">
          <Card>
            <CardHeader className="gap-4 pb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-rose-500/10">
                    <FileTextIcon className="size-4 text-rose-500" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">Laporan Kehadiran</CardTitle>
                    <p className="text-xs text-muted-foreground">Ringkasan kehadiran berdasarkan data snapshot jadwal saat absensi disimpan</p>
                  </div>
                </div>
                <AttendanceReportFilter month={reportMonth} classroomId={selectedClassroomId} subjectId={selectedSubjectId} classrooms={classrooms} subjects={subjects} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Laporan Bulanan", variant: "default" as const },
                  { label: labelMonth(reportMonth), variant: "secondary" as const },
                  { label: selectedClassroomId === "all" ? "Semua Kelas" : classroomById.get(selectedClassroomId)?.name ?? "Kelas tidak ditemukan", variant: "outline" as const },
                  { label: selectedSubjectId === "all" ? "Semua Mapel" : subjectById.get(selectedSubjectId)?.name ?? "Mapel tidak ditemukan", variant: "outline" as const },
                ].map((b) => (
                  <Badge key={b.label} variant={b.variant} className="text-[10px]">{b.label}</Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-xl border shadow-xs">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-16 text-xs font-semibold text-muted-foreground">No</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">Tanggal</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">Mapel</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">Kelas</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">Jam</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground text-center">Hadir</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground text-center">Sakit</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground text-center">Izin</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground text-center">Alfa</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground text-center">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportRows.length > 0 ? (
                      reportRows.map((row, index) => (
                        <TableRow key={row.id} className="group transition-colors hover:bg-muted/40">
                          <TableCell className="text-xs text-muted-foreground">{index + 1}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium">{row.date}</span>
                              <span className="text-[10px] text-muted-foreground">{labelDay(row.day || getDayName(row.date))}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-medium">{row.subjectName}{row.subjectKode ? ` (${row.subjectKode})` : ""}</TableCell>
                          <TableCell className="text-xs">{row.classroomName}</TableCell>
                          <TableCell className="text-xs">Jam {row.jamKe} • {row.startTime}–{row.endTime}</TableCell>
                          <TableCell className="text-xs text-center font-medium text-emerald-600 dark:text-emerald-400">{row.hadir}</TableCell>
                          <TableCell className="text-xs text-center text-amber-600 dark:text-amber-400">{row.sakit}</TableCell>
                          <TableCell className="text-xs text-center text-blue-600 dark:text-blue-400">{row.izin}</TableCell>
                          <TableCell className="text-xs text-center text-red-600 dark:text-red-400">{row.alfa}</TableCell>
                          <TableCell className="text-xs text-center font-semibold">{row.total}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <FileTextIcon className="size-8 text-muted-foreground/40" />
                            <p className="text-xs">Belum ada data kehadiran pada bulan ini.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
