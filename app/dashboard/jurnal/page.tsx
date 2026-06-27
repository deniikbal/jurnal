import type { Metadata } from "next"
import { BookOpenTextIcon, CalendarDaysIcon, CheckCircleIcon, TableIcon } from "lucide-react"

import { AttendanceDialog } from "@/components/attendance-dialog"
import { GradeDialog } from "@/components/grade-dialog"
import { JournalDeleteButton } from "@/components/journal-delete-button"
import { JournalDialog } from "@/components/journal-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getAssessmentsForCurrentUser,
  getAttendancesForCurrentUser,
  getGradesForCurrentUser,
  getGradeWeightsForCurrentUser,
  getJournalsForCurrentUser,
  getKelasForCurrentUser,
  getSchedulesForCurrentUser,
  getSiswaForCurrentUser,
  getSubjectsForCurrentUser,
} from "@/lib/dal"

export const metadata: Metadata = {
  title: "Jurnal",
}

type JurnalPageProps = {
  searchParams: Promise<{ date?: string }>
}

const dayMap = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"]

function today() {
  return new Date().toISOString().slice(0, 10)
}

function getDayName(date: string) {
  return dayMap[new Date(`${date}T00:00:00`).getDay()]
}

function labelDay(day: string) {
  return day[0].toUpperCase() + day.slice(1)
}

export default async function JurnalPage({ searchParams }: JurnalPageProps) {
  const params = await searchParams
  const date = params.date ?? today()
  const selectedDay = getDayName(date)

  const [
    schedules,
    subjects,
    classrooms,
    journals,
    students,
    attendances,
    grades,
    gradeWeights,
    assessments,
  ] = await Promise.all([
    getSchedulesForCurrentUser(),
    getSubjectsForCurrentUser(),
    getKelasForCurrentUser(),
    getJournalsForCurrentUser(),
    getSiswaForCurrentUser(),
    getAttendancesForCurrentUser(),
    getGradesForCurrentUser(),
    getGradeWeightsForCurrentUser(),
    getAssessmentsForCurrentUser(),
  ])

  const subjectById = new Map(subjects.map((item) => [item.id, item]))
  const classroomById = new Map(classrooms.map((item) => [item.id, item]))

  const collator = new Intl.Collator("id-ID", { numeric: true, sensitivity: "base" })
  const studentsByClassroom = new Map<string, typeof students>()
  for (const student of students.filter((item) => item.status === "aktif")) {
    const list = studentsByClassroom.get(student.classroomId) ?? []
    list.push(student)
    studentsByClassroom.set(student.classroomId, list)
  }

  const attendancesToday = attendances.filter((item) => item.date === date)
  const attendanceBySchedule = new Map<string, typeof attendancesToday>()
  for (const item of attendancesToday) {
    const list = attendanceBySchedule.get(item.scheduleId) ?? []
    list.push(item)
    attendanceBySchedule.set(item.scheduleId, list)
  }

  const assessmentsByClassSubject = new Map<string, typeof assessments>()
  for (const item of assessments) {
    const key = `${item.classroomId}:${item.subjectId}`
    const list = assessmentsByClassSubject.get(key) ?? []
    list.push(item)
    assessmentsByClassSubject.set(key, list)
  }

  const scoresByAssessment = new Map<string, Record<string, number>>()
  for (const item of grades) {
    const scores = scoresByAssessment.get(item.assessmentId) ?? {}
    scores[item.siswaId] = item.score
    scoresByAssessment.set(item.assessmentId, scores)
  }

  const weightsBySubject = new Map<string, typeof gradeWeights>()
  for (const item of gradeWeights.filter((w) => w.status === "aktif")) {
    const list = weightsBySubject.get(item.subjectId) ?? []
    list.push(item)
    weightsBySubject.set(item.subjectId, list)
  }
  const schedulesToday = schedules
    .filter((item) => item.day === selectedDay)
    .sort((a, b) => a.jamKe - b.jamKe || a.startTime.localeCompare(b.startTime))
  const journalsToday = journals.filter((item) => item.date === date)
  const journalBySchedule = new Map(journalsToday.map((item) => [item.scheduleId, item]))
  const filledSchedules = schedulesToday.filter((item) => journalBySchedule.has(item.id)).length
  const reportRows = journalsToday.toSorted(
    (a, b) => a.jamKe - b.jamKe || a.startTime.localeCompare(b.startTime),
  )

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Jurnal</h1>
        <p className="text-sm text-muted-foreground">
          Isi jurnal pembelajaran harian berdasarkan jadwal yang sudah dibuat.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Jadwal Hari Ini
            </CardTitle>
            <CalendarDaysIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{schedulesToday.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sudah Diisi
            </CardTitle>
            <CheckCircleIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{filledSchedules}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Jurnal Tanggal Ini
            </CardTitle>
            <TableIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{journalsToday.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Jurnal
            </CardTitle>
            <BookOpenTextIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{journals.length}</p>
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="input" className="gap-4">
        <TabsList>
          <TabsTrigger value="input">Input Jurnal</TabsTrigger>
          <TabsTrigger value="laporan">Laporan Jurnal</TabsTrigger>
        </TabsList>

        <TabsContent value="input">
          <Card>
            <CardHeader className="gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-1">
                  <CardTitle>Daftar Jadwal Jurnal</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Pilih tanggal, lalu isi materi, kegiatan, dan catatan pembelajaran.
                  </p>
                </div>
                <form className="flex gap-2">
                  <Input type="date" name="date" defaultValue={date} className="w-auto" />
                  <Button type="submit">Tampilkan</Button>
                </form>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>{labelDay(selectedDay)}</Badge>
                <Badge variant="secondary">{date}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedulesToday.length > 0 ? (
                  schedulesToday.map((schedule) => {
                    const subject = subjectById.get(schedule.subjectId)
                    const classroom = classroomById.get(schedule.classroomId)
                    const journal = journalBySchedule.get(schedule.id)
                    const classStudents = (studentsByClassroom.get(schedule.classroomId) ?? [])
                      .toSorted((a, b) => collator.compare(a.name, b.name))
                    const scheduleAttendances = attendanceBySchedule.get(schedule.id) ?? []
                    const attendanceStatuses = Object.fromEntries(
                      scheduleAttendances.map((item) => [item.siswaId, item.status]),
                    )
                    const scheduleWeights = weightsBySubject.get(schedule.subjectId) ?? []
                    const scheduleAssessments = (
                      assessmentsByClassSubject.get(`${schedule.classroomId}:${schedule.subjectId}`) ?? []
                    ).toSorted((a, b) =>
                      (a.date ?? "").localeCompare(b.date ?? "") || collator.compare(a.title, b.title),
                    )
                    const scheduleScoresByAssessment = Object.fromEntries(
                      scheduleAssessments.map((assessment) => [
                        assessment.id,
                        scoresByAssessment.get(assessment.id) ?? {},
                      ]),
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
                              {subject?.kode ? <Badge variant="secondary">{subject.kode}</Badge> : null}
                              <Badge variant={journal ? "default" : "outline"}>
                                {journal ? "Sudah diisi" : "Belum diisi"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {classroom?.name ?? "Kelas tidak ditemukan"} • {schedule.startTime}–{schedule.endTime} • {classStudents.length} siswa aktif
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 sm:justify-end">
                            <JournalDialog
                              date={date}
                              schedule={schedule}
                              subjectName={subject?.name ?? "Mapel tidak ditemukan"}
                              classroomName={classroom?.name ?? "Kelas tidak ditemukan"}
                              journal={journal}
                            />
                            <AttendanceDialog
                              date={date}
                              schedule={schedule}
                              subjectName={subject?.name ?? "Mapel tidak ditemukan"}
                              classroomName={classroom?.name ?? "Kelas tidak ditemukan"}
                              students={classStudents}
                              statuses={attendanceStatuses}
                            />
                            <GradeDialog
                              schedule={schedule}
                              subjectName={subject?.name ?? "Mapel tidak ditemukan"}
                              classroomName={classroom?.name ?? "Kelas tidak ditemukan"}
                              students={classStudents}
                              weights={scheduleWeights}
                              assessments={scheduleAssessments}
                              scoresByAssessment={scheduleScoresByAssessment}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="rounded-lg border py-16 text-center text-sm text-muted-foreground">
                    Tidak ada jadwal untuk hari {labelDay(selectedDay)}.
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
                  <CardTitle>Laporan Jurnal</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Laporan memakai snapshot jadwal saat jurnal disimpan.
                  </p>
                </div>
                <form className="flex gap-2">
                  <Input type="date" name="date" defaultValue={date} className="w-auto" />
                  <Button type="submit">Tampilkan</Button>
                </form>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>{labelDay(selectedDay)}</Badge>
                <Badge variant="secondary">{date}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">No</TableHead>
                      <TableHead>Mapel</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>Jam</TableHead>
                      <TableHead>Materi</TableHead>
                      <TableHead>Kegiatan</TableHead>
                      <TableHead className="w-16 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportRows.length > 0 ? (
                      reportRows.map((journal, index) => (
                        <TableRow key={journal.id}>
                          <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                          <TableCell className="font-medium">
                            {journal.subjectName}
                            {journal.subjectKode ? ` (${journal.subjectKode})` : ""}
                          </TableCell>
                          <TableCell>{journal.classroomName}</TableCell>
                          <TableCell>
                            Jam {journal.jamKe} • {journal.startTime}–{journal.endTime}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{journal.materi}</TableCell>
                          <TableCell className="max-w-xs truncate">{journal.kegiatan}</TableCell>
                          <TableCell>
                            <div className="flex justify-end">
                              <JournalDeleteButton id={journal.id} title={journal.subjectName} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                          Belum ada jurnal pada tanggal ini.
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
