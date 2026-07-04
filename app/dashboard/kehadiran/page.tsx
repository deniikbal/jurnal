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
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Kehadiran</h1>
        <p className="text-sm text-muted-foreground">
          Isi kehadiran siswa berdasarkan jadwal yang sudah dibuat.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Jadwal Hari Ini
            </CardTitle>
            <CalendarCheckIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{filteredSchedulesToday.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sudah Diisi
            </CardTitle>
            <TableIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{filledSchedules}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hadir
            </CardTitle>
            <CheckCircleIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalHadir}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tidak Hadir
            </CardTitle>
            <XCircleIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalTidakHadir}</p>
          </CardContent>
        </Card>
      </section>

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
            <CardHeader className="gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-1">
                  <CardTitle>Daftar Jadwal Kehadiran</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Filter kelas dan mapel, lalu isi keterangan hadir, sakit, izin, atau alfa untuk hari ini.
                  </p>
                </div>
                <KehadiranFilter
                  classroomId={selectedClassroomId}
                  subjectId={selectedSubjectId}
                  classrooms={classrooms}
                  subjects={subjects}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>{labelDay(selectedDay)}</Badge>
                <Badge variant="secondary">Hari ini</Badge>
                <Badge variant="outline">{selectedClassroomId === "all" ? "Semua Kelas" : classroomById.get(selectedClassroomId)?.name ?? "Kelas tidak ditemukan"}</Badge>
                <Badge variant="outline">{selectedSubjectId === "all" ? "Semua Mapel" : subjectById.get(selectedSubjectId)?.name ?? "Mapel tidak ditemukan"}</Badge>
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
                    const statuses = Object.fromEntries(
                      scheduleAttendances.map((item) => [item.siswaId, item.status]),
                    )

                    return (
                      <div key={schedule.id} className="rounded-lg border bg-card p-4 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold tracking-tight">
                                {subject?.name ?? "Mapel tidak ditemukan"}
                              </h3>
                              <Badge>Jam {schedule.jamKe}</Badge>
                              <Badge variant={scheduleAttendances.length ? "default" : "outline"}>
                                {scheduleAttendances.length ? "Sudah diisi" : "Belum diisi"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
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
                  <div className="rounded-lg border py-16 text-center text-sm text-muted-foreground">
                    Tidak ada jadwal yang sesuai dengan filter kelas dan mapel untuk hari {labelDay(selectedDay)}.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="laporan">
          <Card>
            <CardHeader className="gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-1">
                  <CardTitle>Laporan Kehadiran</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Ringkasan kehadiran berdasarkan data snapshot jadwal saat absensi disimpan.
                  </p>
                </div>
                <AttendanceReportFilter
                  month={reportMonth}
                  classroomId={selectedClassroomId}
                  subjectId={selectedSubjectId}
                  classrooms={classrooms}
                  subjects={subjects}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>Laporan Bulanan</Badge>
                <Badge variant="secondary">{labelMonth(reportMonth)}</Badge>
                <Badge variant="outline">{selectedClassroomId === "all" ? "Semua Kelas" : classroomById.get(selectedClassroomId)?.name ?? "Kelas tidak ditemukan"}</Badge>
                <Badge variant="outline">{selectedSubjectId === "all" ? "Semua Mapel" : subjectById.get(selectedSubjectId)?.name ?? "Mapel tidak ditemukan"}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">No</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Mapel</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>Jam</TableHead>
                      <TableHead>Hadir</TableHead>
                      <TableHead>Sakit</TableHead>
                      <TableHead>Izin</TableHead>
                      <TableHead>Alfa</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportRows.length > 0 ? (
                      reportRows.map((row, index) => (
                        <TableRow key={row.id}>
                          <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                          <TableCell>
                            <div className="font-medium">{row.date}</div>
                            <div className="text-xs text-muted-foreground">{labelDay(row.day || getDayName(row.date))}</div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {row.subjectName}
                            {row.subjectKode ? ` (${row.subjectKode})` : ""}
                          </TableCell>
                          <TableCell>{row.classroomName}</TableCell>
                          <TableCell>
                            Jam {row.jamKe} • {row.startTime}–{row.endTime}
                          </TableCell>
                          <TableCell>{row.hadir}</TableCell>
                          <TableCell>{row.sakit}</TableCell>
                          <TableCell>{row.izin}</TableCell>
                          <TableCell>{row.alfa}</TableCell>
                          <TableCell>{row.total}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                          Belum ada data kehadiran pada bulan ini.
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
    </>
  )
}
