import type { Metadata } from "next"
import { BookOpenTextIcon, CalendarDaysIcon, CheckCircleIcon, FileTextIcon, TableIcon } from "lucide-react"

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
    <div className="flex flex-col gap-5">
      {/* ===== Page Header ===== */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-teal-600 via-teal-600/90 to-teal-500/80 p-5 shadow-lg shadow-teal-500/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-white/15 ring-2 ring-white/20">
            <BookOpenTextIcon className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Jurnal</h1>
            <p className="text-sm text-white/70">Isi jurnal pembelajaran harian berdasarkan jadwal yang sudah dibuat.</p>
          </div>
        </div>
      </div>

      {/* ===== Stat Cards ===== */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { key: "jadwal", icon: CalendarDaysIcon, label: "Jadwal Hari Ini", value: schedulesToday.length },
          { key: "diisi", icon: CheckCircleIcon, label: "Sudah Diisi", value: filledSchedules },
          { key: "hari", icon: TableIcon, label: "Jurnal Hari Ini", value: journalsToday.length },
          { key: "total", icon: BookOpenTextIcon, label: "Total Jurnal", value: journals.length },
        ].map((s) => {
          const gradients: Record<string, { gradient: string; iconBg: string; ring: string }> = {
            jadwal: { gradient: "from-teal-500/10 via-teal-500/5 to-transparent", iconBg: "bg-teal-500/15 text-teal-500", ring: "ring-teal-500/20" },
            diisi: { gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent", iconBg: "bg-emerald-500/15 text-emerald-500", ring: "ring-emerald-500/20" },
            hari: { gradient: "from-blue-500/10 via-blue-500/5 to-transparent", iconBg: "bg-blue-500/15 text-blue-500", ring: "ring-blue-500/20" },
            total: { gradient: "from-purple-500/10 via-purple-500/5 to-transparent", iconBg: "bg-purple-500/15 text-purple-500", ring: "ring-purple-500/20" },
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
                <div className="h-full rounded-full bg-gradient-to-r from-primary/40 to-primary/60 transition-all duration-500" style={{ width: `${Math.min((Number(s.value) / Math.max(schedulesToday.length, 1)) * 100, 100)}%` }} />
              </div>
            </div>
          )
        })}
      </section>

      {/* ===== Tabs ===== */}
      <Tabs defaultValue="input" className="gap-4">
        <TabsList>
          <TabsTrigger value="input" className="data-[state=active]:shadow-sm data-[state=active]:border-primary hover:bg-muted">
            <BookOpenTextIcon />
            Input Jurnal
          </TabsTrigger>
          <TabsTrigger value="laporan" className="data-[state=active]:shadow-sm data-[state=active]:border-primary hover:bg-muted">
            <FileTextIcon />
            Laporan Jurnal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input">
          <Card>
            <CardHeader className="gap-4 pb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-teal-500/10">
                    <BookOpenTextIcon className="size-4 text-teal-500" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">Daftar Jadwal Jurnal</CardTitle>
                    <p className="text-xs text-muted-foreground">Pilih tanggal, lalu isi materi, kegiatan, dan catatan pembelajaran</p>
                  </div>
                </div>
                <form className="flex gap-2">
                  <Input type="date" name="date" defaultValue={date} className="w-auto" />
                  <Button type="submit" size="sm">Tampilkan</Button>
                </form>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="default" className="text-[10px]">{labelDay(selectedDay)}</Badge>
                <Badge variant="secondary" className="text-[10px]">{date}</Badge>
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
                    const attendanceStatuses = Object.fromEntries(scheduleAttendances.map((item) => [item.siswaId, item.status]))
                    const scheduleWeights = weightsBySubject.get(schedule.subjectId) ?? []
                    const scheduleAssessments = (
                      assessmentsByClassSubject.get(`${schedule.classroomId}:${schedule.subjectId}`) ?? []
                    ).toSorted((a, b) =>
                      (a.date ?? "").localeCompare(b.date ?? "") || collator.compare(a.title, b.title),
                    )
                    const scheduleScoresByAssessment = Object.fromEntries(
                      scheduleAssessments.map((assessment) => [assessment.id, scoresByAssessment.get(assessment.id) ?? {}]),
                    )

                    const subjectClassrooms = classrooms.filter((c) =>
                      schedules.some((s) => s.subjectId === schedule.subjectId && s.classroomId === c.id),
                    )
                    const allSubjectAssessments = assessments.filter((a) => a.subjectId === schedule.subjectId)
                    const studentCountsByClassroom: Record<string, number> = {}
                    for (const c of subjectClassrooms) {
                      studentCountsByClassroom[c.id] = (studentsByClassroom.get(c.id) ?? []).length
                    }
                    const allScoresByAssessment = Object.fromEntries(scoresByAssessment)
                    const isFilled = !!journal

                    return (
                      <div key={schedule.id} className="group relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30">
                        <div className={`absolute inset-y-0 left-0 w-1 rounded-l-xl ${isFilled ? "bg-gradient-to-b from-teal-500 to-teal-400" : "bg-gradient-to-b from-muted-foreground/30 to-muted-foreground/10"}`} />
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pl-3">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-semibold">{subject?.name ?? "Mapel tidak ditemukan"}</h3>
                              <Badge variant="secondary" className="border-primary/20 bg-primary/10 text-[10px] font-medium text-primary">Jam {schedule.jamKe}</Badge>
                              {subject?.kode ? <Badge variant="outline" className="text-[10px]">{subject.kode}</Badge> : null}
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
                              allClassrooms={subjectClassrooms}
                              allAssessments={allSubjectAssessments}
                              studentCountsByClassroom={studentCountsByClassroom}
                              allScoresByAssessment={allScoresByAssessment}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="flex flex-col items-center gap-2 rounded-xl border py-12">
                    <BookOpenTextIcon className="size-8 text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground">Tidak ada jadwal untuk hari {labelDay(selectedDay)}.</p>
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
                  <div className="flex size-8 items-center justify-center rounded-lg bg-teal-500/10">
                    <FileTextIcon className="size-4 text-teal-500" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">Laporan Jurnal</CardTitle>
                    <p className="text-xs text-muted-foreground">Laporan memakai snapshot jadwal saat jurnal disimpan</p>
                  </div>
                </div>
                <form className="flex gap-2">
                  <Input type="date" name="date" defaultValue={date} className="w-auto" />
                  <Button type="submit" size="sm">Tampilkan</Button>
                </form>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="default" className="text-[10px]">{labelDay(selectedDay)}</Badge>
                <Badge variant="secondary" className="text-[10px]">{date}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-xl border shadow-xs">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-16 text-xs font-semibold text-muted-foreground">No</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">Mapel</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">Kelas</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">Jam</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">Materi</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">Kegiatan</TableHead>
                      <TableHead className="w-16 text-right text-xs font-semibold text-muted-foreground">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportRows.length > 0 ? (
                      reportRows.map((journal, index) => (
                        <TableRow key={journal.id} className="group transition-colors hover:bg-muted/40">
                          <TableCell className="text-xs text-muted-foreground">{index + 1}</TableCell>
                          <TableCell className="text-xs font-medium">{journal.subjectName}{journal.subjectKode ? ` (${journal.subjectKode})` : ""}</TableCell>
                          <TableCell className="text-xs">{journal.classroomName}</TableCell>
                          <TableCell className="text-xs">Jam {journal.jamKe} • {journal.startTime}–{journal.endTime}</TableCell>
                          <TableCell className="max-w-40 truncate text-xs">{journal.materi}</TableCell>
                          <TableCell className="max-w-40 truncate text-xs">{journal.kegiatan}</TableCell>
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
                          <div className="flex flex-col items-center gap-2">
                            <BookOpenTextIcon className="size-8 text-muted-foreground/40" />
                            <p className="text-xs">Belum ada jurnal pada tanggal ini.</p>
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
