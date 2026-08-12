"use client"

import { useMemo, useState } from "react"

import { AttendanceDialog } from "@/components/attendance-dialog"
import { GradeDialog } from "@/components/grade-dialog"
import { GradeRecap } from "@/components/grade-recap"
import { JournalDeleteButton } from "@/components/journal-delete-button"
import { JournalDialog } from "@/components/journal-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

const dayMap = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"]

function today() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function getDayName(date: string) {
  return dayMap[new Date(`${date}T00:00:00`).getDay()]
}

function labelDay(day: string) {
  return day[0].toUpperCase() + day.slice(1)
}

type Schedule = {
  id: string
  day: string
  jamKe: number
  startTime: string
  endTime: string
  subjectId: string
  classroomId: string
}

type Subject = {
  id: string
  name: string
  kode: string | null
}

type Classroom = {
  id: string
  name: string
}

type Journal = {
  id: string
  scheduleId: string
  date: string
  jamKe: number
  startTime: string
  endTime: string
  subjectName: string
  subjectKode: string | null
  classroomId: string
  classroomName: string
  materi: string
  kegiatan: string
  catatan: string | null
}

type Student = {
  id: string
  name: string
  nis: string | null
  classroomId: string
  status: "aktif" | "keluar"
}

type Attendance = {
  scheduleId: string
  date: string
  siswaId: string
  status: "hadir" | "sakit" | "izin" | "alfa"
}

type GradeWeight = {
  id: string
  name: string
  weight: number
  subjectId: string
  status: string
}

type Assessment = {
  id: string
  title: string
  description: string | null
  date: string | null
  gradeWeightId: string
  gradeWeightName: string
  classroomId: string
  subjectId: string
}

type Grade = {
  assessmentId: string
  siswaId: string
  score: number
}

type JurnalPageClientProps = {
  schedules: Schedule[]
  subjects: Subject[]
  classrooms: Classroom[]
  journals: Journal[]
  students: Student[]
  attendances: Attendance[]
  grades: Grade[]
  gradeWeights: GradeWeight[]
  assessments: Assessment[]
}

export function JurnalPageClient({
  schedules,
  subjects,
  classrooms,
  journals,
  students,
  attendances,
  grades,
  gradeWeights,
  assessments,
}: JurnalPageClientProps) {
  const [date, setDate] = useState(today)
  const [tab, setTab] = useState<"input" | "laporan" | "rekap">("input")

  const [reportClassroomId, setReportClassroomId] = useState("all")
  const [reportPage, setReportPage] = useState(0)

  const PAGE_SIZE = 10

  const selectedDay = getDayName(date)

  const subjectById = useMemo(() => new Map(subjects.map((item) => [item.id, item])), [subjects])
  const classroomById = useMemo(
    () => new Map(classrooms.map((item) => [item.id, item])),
    [classrooms],
  )

  const collator = useMemo(
    () => new Intl.Collator("id-ID", { numeric: true, sensitivity: "base" }),
    [],
  )

  const studentsByClassroom = useMemo(() => {
    const map = new Map<string, Student[]>()
    for (const student of students.filter((item) => item.status === "aktif")) {
      const list = map.get(student.classroomId) ?? []
      list.push(student)
      map.set(student.classroomId, list)
    }
    return map
  }, [students])

  const attendancesOnDate = useMemo(
    () => attendances.filter((item) => item.date === date),
    [attendances, date],
  )

  const attendanceBySchedule = useMemo(() => {
    const map = new Map<string, Attendance[]>()
    for (const item of attendancesOnDate) {
      const list = map.get(item.scheduleId) ?? []
      list.push(item)
      map.set(item.scheduleId, list)
    }
    return map
  }, [attendancesOnDate])

  const assessmentsByClassSubject = useMemo(() => {
    const map = new Map<string, Assessment[]>()
    for (const item of assessments) {
      const key = `${item.classroomId}:${item.subjectId}`
      const list = map.get(key) ?? []
      list.push(item)
      map.set(key, list)
    }
    return map
  }, [assessments])

  const scoresByAssessment = useMemo(() => {
    const map = new Map<string, Record<string, number>>()
    for (const item of grades) {
      const scores = map.get(item.assessmentId) ?? {}
      scores[item.siswaId] = item.score
      map.set(item.assessmentId, scores)
    }
    return map
  }, [grades])

  const weightsBySubject = useMemo(() => {
    const map = new Map<string, GradeWeight[]>()
    for (const item of gradeWeights.filter((w) => w.status === "aktif")) {
      const list = map.get(item.subjectId) ?? []
      list.push(item)
      map.set(item.subjectId, list)
    }
    return map
  }, [gradeWeights])

  const schedulesToday = useMemo(
    () =>
      schedules
        .filter((item) => item.day === selectedDay)
        .sort((a, b) => a.jamKe - b.jamKe || a.startTime.localeCompare(b.startTime)),
    [schedules, selectedDay],
  )

  const journalsToday = useMemo(
    () => journals.filter((item) => item.date === date),
    [journals, date],
  )

  const journalBySchedule = useMemo(
    () => new Map(journalsToday.map((item) => [item.scheduleId, item])),
    [journalsToday],
  )

  const filledSchedules = schedulesToday.filter((item) => journalBySchedule.has(item.id)).length

  const reportJournals = useMemo(() => {
    const rows = journals
      .filter((j) => reportClassroomId === "all" || j.classroomId === reportClassroomId)
      .sort((a, b) => a.date.localeCompare(b.date) || a.jamKe - b.jamKe)
    return rows
  }, [journals, reportClassroomId])

  const reportTotalPages = Math.max(Math.ceil(reportJournals.length / PAGE_SIZE), 1)
  const reportSafePage = Math.min(reportPage, reportTotalPages - 1)
  const paginatedReport = reportJournals.slice(
    reportSafePage * PAGE_SIZE,
    (reportSafePage + 1) * PAGE_SIZE,
  )

  const allScoresByAssessment = useMemo(
    () => Object.fromEntries(scoresByAssessment),
    [scoresByAssessment],
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Pembelajaran
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Jurnal</h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Catat materi dan kegiatan per jadwal, plus absensi dan nilai di sesi yang sama.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4 sm:gap-x-8">
          <div>
            <dt className="text-[11px] text-muted-foreground">Jadwal</dt>
            <dd className="font-semibold tabular-nums text-foreground">{schedulesToday.length}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Sudah diisi</dt>
            <dd className="font-semibold tabular-nums text-foreground">{filledSchedules}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Jurnal hari ini</dt>
            <dd className="font-semibold tabular-nums text-foreground">{journalsToday.length}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Total jurnal</dt>
            <dd className="font-semibold tabular-nums text-foreground">{journals.length}</dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-col gap-3 border-b border-border sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="button"
            onClick={() => setTab("input")}
            className={`-mb-px border-b-2 pb-2.5 text-sm transition-colors ${
              tab === "input"
                ? "border-foreground font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Input
          </button>
          <button
            type="button"
            onClick={() => setTab("laporan")}
            className={`-mb-px border-b-2 pb-2.5 text-sm transition-colors ${
              tab === "laporan"
                ? "border-foreground font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Laporan
          </button>
          <button
            type="button"
            onClick={() => setTab("rekap")}
            className={`-mb-px border-b-2 pb-2.5 text-sm transition-colors ${
              tab === "rekap"
                ? "border-foreground font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Rekap Nilai
          </button>
        </div>

        <div className="pb-2">
          <Input
            type="date"
            value={date}
            onChange={(event) => {
              if (event.target.value) setDate(event.target.value)
            }}
            className="h-9 w-auto border-border/80 bg-background text-sm shadow-none"
            aria-label="Tanggal jurnal"
          />
        </div>
      </div>

      {tab === "input" ? (
        <section className="overflow-hidden rounded-md border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Jadwal hari ini</h2>
              <p className="text-xs text-muted-foreground">
                {labelDay(selectedDay)} · {date}
              </p>
            </div>
          </div>

          <div className="divide-y divide-border">
            {schedulesToday.length > 0 ? (
              schedulesToday.map((schedule) => {
                const subject = subjectById.get(schedule.subjectId)
                const classroom = classroomById.get(schedule.classroomId)
                const journal = journalBySchedule.get(schedule.id)
                const classStudents = [
                  ...(studentsByClassroom.get(schedule.classroomId) ?? []),
                ].sort((a, b) => collator.compare(a.name, b.name))
                const scheduleAttendances = attendanceBySchedule.get(schedule.id) ?? []
                const attendanceStatuses = Object.fromEntries(
                  scheduleAttendances.map((item) => [item.siswaId, item.status]),
                )
                const scheduleWeights = weightsBySubject.get(schedule.subjectId) ?? []
                const scheduleAssessments = [
                  ...(assessmentsByClassSubject.get(
                    `${schedule.classroomId}:${schedule.subjectId}`,
                  ) ?? []),
                ].sort(
                  (a, b) =>
                    (a.date ?? "").localeCompare(b.date ?? "") ||
                    collator.compare(a.title, b.title),
                )
                const scheduleScoresByAssessment = Object.fromEntries(
                  scheduleAssessments.map((assessment) => [
                    assessment.id,
                    scoresByAssessment.get(assessment.id) ?? {},
                  ]),
                )

                const subjectClassrooms = classrooms.filter((c) =>
                  schedules.some(
                    (s) =>
                      s.subjectId === schedule.subjectId && s.classroomId === c.id,
                  ),
                )
                const allSubjectAssessments = assessments.filter(
                  (a) => a.subjectId === schedule.subjectId,
                )
                const studentCountsByClassroom: Record<string, number> = {}
                for (const c of subjectClassrooms) {
                  studentCountsByClassroom[c.id] = (
                    studentsByClassroom.get(c.id) ?? []
                  ).length
                }
                const isFilled = !!journal

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
                                    {subject?.kode ? (
                                      <span className="text-xs text-muted-foreground">
                                        ({subject.kode})
                                      </span>
                                    ) : null}
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
                                  {journal?.materi ? (
                                    <p className="line-clamp-1 text-xs text-muted-foreground">
                                      Materi: {journal.materi}
                                    </p>
                                  ) : null}
                                </div>

                                <div className="flex flex-wrap gap-2 self-end sm:self-center sm:justify-end">
                                  <JournalDialog
                                    date={date}
                                    schedule={schedule}
                                    subjectName={subject?.name ?? "Mapel tidak ditemukan"}
                                    classroomName={classroom?.name ?? "Kelas tidak ditemukan"}
                                    journal={journal}
                                    historyJournals={journals.filter(
                                      (j) => j.classroomId === schedule.classroomId,
                                    )}
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
                            )
                          })
              ) : (
                <div className="px-4 py-14 text-center sm:px-5">
                  <p className="text-sm text-muted-foreground">
                    Tidak ada jadwal untuk {labelDay(selectedDay)}.
                  </p>
                </div>
              )}
          </div>
        </section>
      ) : tab === "laporan" ? (
        <section className="overflow-hidden rounded-md border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Laporan jurnal</h2>
              <p className="text-xs text-muted-foreground">
                {reportJournals.length} entri
              </p>
            </div>
            <Select
              value={reportClassroomId}
              onValueChange={(value) => {
                setReportClassroomId(value)
                setReportPage(0)
              }}
            >
              <SelectTrigger
                className="h-9 w-full text-sm shadow-none sm:w-40"
                aria-label="Filter kelas laporan"
              >
                <SelectValue placeholder="Semua kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua kelas</SelectItem>
                {[...classrooms]
                  .sort((a, b) =>
                    a.name.localeCompare(b.name, undefined, {
                      numeric: true,
                      sensitivity: "base",
                    }),
                  )
                  .map((classroom) => (
                    <SelectItem key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
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
                  <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    Materi
                  </TableHead>
                  <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    Kegiatan
                  </TableHead>
                  <TableHead className="w-16 pr-5 text-right text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReport.length > 0 ? (
                  paginatedReport.map((journal, index) => (
                    <TableRow key={journal.id} className="group">
                      <TableCell className="pl-5 text-xs tabular-nums text-muted-foreground">
                        {reportSafePage * PAGE_SIZE + index + 1}
                      </TableCell>
                      <TableCell className="text-xs tabular-nums text-foreground whitespace-nowrap">
                        {journal.date}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">
                        {journal.subjectName}
                        {journal.subjectKode ? (
                          <span className="ml-1 text-xs font-normal text-muted-foreground">
                            ({journal.subjectKode})
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {journal.classroomName}
                      </TableCell>
                      <TableCell className="text-xs tabular-nums text-muted-foreground whitespace-nowrap">
                        {journal.jamKe} · {journal.startTime}–{journal.endTime}
                      </TableCell>
                      <TableCell className="max-w-[12rem] truncate text-xs text-muted-foreground">
                        {journal.materi}
                      </TableCell>
                      <TableCell className="max-w-[12rem] truncate text-xs text-muted-foreground">
                        {journal.kegiatan}
                      </TableCell>
                      <TableCell className="pr-5">
                        <div className="flex justify-end">
                          <JournalDeleteButton id={journal.id} title={journal.subjectName} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={8} className="h-40 text-center">
                      <p className="text-sm text-muted-foreground">
                        Belum ada jurnal pada bulan ini.
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="divide-y divide-border sm:hidden">
            {paginatedReport.length > 0 ? (
              paginatedReport.map((journal) => (
                <div key={journal.id} className="space-y-2 px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-medium text-foreground">{journal.subjectName}</p>
                      <p className="text-xs text-muted-foreground">
                        {journal.date}
                        <span className="mx-1.5 text-border">·</span>
                        {journal.classroomName}
                        <span className="mx-1.5 text-border">·</span>
                        Jam {journal.jamKe} ({journal.startTime}–{journal.endTime})
                      </p>
                    </div>
                    <JournalDeleteButton id={journal.id} title={journal.subjectName} />
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>
                      <span className="text-foreground/70">Materi:</span> {journal.materi}
                    </p>
                    <p>
                      <span className="text-foreground/70">Kegiatan:</span> {journal.kegiatan}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-14 text-center">
                <p className="text-sm text-muted-foreground">
                  Belum ada jurnal pada bulan ini.
                </p>
              </div>
            )}
          </div>

          {reportTotalPages > 1 && (
            <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3 sm:px-5">
              <p className="text-xs text-muted-foreground">
                Menampilkan {reportSafePage * PAGE_SIZE + 1}–
                {Math.min((reportSafePage + 1) * PAGE_SIZE, reportJournals.length)} dari{" "}
                {reportJournals.length} entri
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={reportSafePage === 0}
                  onClick={() => setReportPage((p) => Math.max(p - 1, 0))}
                  className="text-xs"
                >
                  Prev
                </Button>
                {Array.from({ length: reportTotalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === reportTotalPages ||
                      Math.abs(p - (reportSafePage + 1)) <= 1,
                  )
                  .map((p) => (
                    <Button
                      key={p}
                      variant={p === reportSafePage + 1 ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setReportPage(p - 1)}
                      className="text-xs min-w-[32px]"
                    >
                      {p}
                    </Button>
                  ))}
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={reportSafePage === reportTotalPages - 1}
                  onClick={() => setReportPage((p) => Math.min(p + 1, reportTotalPages - 1))}
                  className="text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </section>
      ) : tab === "rekap" ? (
        <GradeRecap
          classrooms={classrooms}
          subjects={subjects}
          students={students}
          assessments={assessments}
          grades={grades}
          gradeWeights={gradeWeights}
        />
      ) : null}
    </div>
  )
}
