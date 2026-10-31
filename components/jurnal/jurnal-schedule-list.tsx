"use client"

import { AttendanceDialog } from "@/components/attendance-dialog"
import { GradeDialog } from "@/components/grade-dialog"
import { JournalDialog } from "@/components/journal-dialog"
import { CalendarOffIcon } from "lucide-react"

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { Card, CardContent } from "@/components/ui/card"
import { subjectToneClass } from "@/lib/subject-tone"
import { cn } from "@/lib/utils"
import type {
  Assessment,
  Attendance,
  Classroom,
  Grade,
  GradeWeight,
  Journal,
  Schedule,
  Student,
  Subject,
} from "@/components/jurnal-page-client"

type Props = {
  date: string
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

export function JurnalScheduleList({
  date,
  schedules,
  subjects,
  classrooms,
  journals,
  students,
  attendances,
  grades,
  gradeWeights,
  assessments,
}: Props) {
  const subjectById = new Map(subjects.map((s) => [s.id, s]))
  const classroomById = new Map(classrooms.map((c) => [c.id, c]))

  const collator = new Intl.Collator("id-ID", {
    numeric: true,
    sensitivity: "base",
  })

  const studentsByClassroom = new Map<string, Student[]>()
  for (const s of students.filter((s) => s.status === "aktif")) {
    const list = studentsByClassroom.get(s.classroomId) ?? []
    list.push(s)
    studentsByClassroom.set(s.classroomId, list)
  }

  const attendancesOnDate = attendances.filter((a) => a.date === date)
  const attendanceBySchedule = new Map<string, Attendance[]>()
  for (const a of attendancesOnDate) {
    const list = attendanceBySchedule.get(a.scheduleId) ?? []
    list.push(a)
    attendanceBySchedule.set(a.scheduleId, list)
  }

  const assessmentsByKey = new Map<string, Assessment[]>()
  for (const a of assessments) {
    const key = `${a.classroomId}:${a.subjectId}`
    const list = assessmentsByKey.get(key) ?? []
    list.push(a)
    assessmentsByKey.set(key, list)
  }

  const scoresByAssessment = new Map<string, Record<string, number>>()
  for (const g of grades) {
    const scores = scoresByAssessment.get(g.assessmentId) ?? {}
    scores[g.siswaId] = g.score
    scoresByAssessment.set(g.assessmentId, scores)
  }

  const weightsBySubject = new Map<string, GradeWeight[]>()
  for (const w of gradeWeights.filter((w) => w.status === "aktif")) {
    const list = weightsBySubject.get(w.subjectId) ?? []
    list.push(w)
    weightsBySubject.set(w.subjectId, list)
  }

  const journalsToday = journals.filter((j) => j.date === date)
  const journalBySchedule = new Map(journalsToday.map((j) => [j.scheduleId, j]))

  if (schedules.length === 0) {
    return (
      <Card className="surface">
        <CardContent className="p-0">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarOffIcon />
              </EmptyMedia>
              <EmptyTitle>Tidak ada sesi mengajar</EmptyTitle>
              <EmptyDescription>
                Pilih hari lain di pemilih tanggal, atau tambahkan jadwal
                mengajar terlebih dahulu.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="surface">
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {schedules.map((schedule) => {
            const subject = subjectById.get(schedule.subjectId)
            const classroom = classroomById.get(schedule.classroomId)
            const journal = journalBySchedule.get(schedule.id)
            const scheduleAttendances =
              attendanceBySchedule.get(schedule.id) ?? []
            const scheduleWeights =
              weightsBySubject.get(schedule.subjectId) ?? []

            // Sengaja tanpa useMemo: nilai ini dihitung di dalam map, dan hook
            // tidak boleh dipanggil di dalam loop (jumlah sesi berubah saat
            // tanggal diganti, yang membuat urutan hook ikut berubah).
            const subjectClassrooms = classrooms.filter((c) =>
              schedules.some(
                (s) =>
                  s.subjectId === schedule.subjectId && s.classroomId === c.id
              )
            )
            const studentCountsByClassroom: Record<string, number> = {}
            for (const c of subjectClassrooms) {
              studentCountsByClassroom[c.id] = (
                studentsByClassroom.get(c.id) ?? []
              ).length
            }
            const isFilled = !!journal

            const classStudents = (
              studentsByClassroom.get(schedule.classroomId) ?? []
            )
              .slice()
              .sort((a, b) => collator.compare(a.name, b.name))
            const attendanceStatuses = Object.fromEntries(
              scheduleAttendances.map((a) => [a.siswaId, a.status])
            )
            const scheduleAssessments = (
              assessmentsByKey.get(
                `${schedule.classroomId}:${schedule.subjectId}`
              ) ?? []
            )
              .slice()
              .sort(
                (a, b) =>
                  (a.date ?? "").localeCompare(b.date ?? "") ||
                  collator.compare(a.title, b.title)
              )
            const scheduleScoresByAssessment = Object.fromEntries(
              scheduleAssessments.map((a) => [
                a.id,
                scoresByAssessment.get(a.id) ?? {},
              ])
            )
            const allSubjectAssessments = assessments.filter(
              (a) => a.subjectId === schedule.subjectId
            )

            return (
              <li
                key={schedule.id}
                className={cn(
                  "subject-edge subject-wash group grid gap-3 py-3.5 pr-4 pl-4 transition-colors sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-4 sm:pl-3.5",
                  subjectToneClass(schedule.subjectId)
                )}
              >
                {/* Jam */}
                <div className="flex items-center gap-2 sm:flex-col sm:items-start sm:gap-0 sm:border-r sm:border-border sm:pr-3 sm:pl-1">
                  <span className="text-sm leading-tight font-semibold text-foreground tabular-nums">
                    {schedule.startTime}
                  </span>
                  <span className="text-[11px] text-muted-foreground tabular-nums sm:mt-0.5">
                    {schedule.endTime}
                  </span>
                  <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:mt-1.5 sm:ml-0">
                    Jam {schedule.jamKe}
                  </span>
                </div>

                {/* Info */}
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span
                      className="subject-dot size-2 shrink-0 rounded-full"
                      aria-hidden
                    />
                    <h3 className="truncate text-sm font-semibold text-foreground">
                      {subject?.name ?? "Mapel tidak ditemukan"}
                    </h3>
                    {subject?.kode ? (
                      <span className="subject-chip rounded px-1.5 py-0.5 font-mono text-[10px] font-medium">
                        {subject.kode}
                      </span>
                    ) : null}
                  </div>
                  <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
                    <span>{classroom?.name ?? "Kelas tidak ditemukan"}</span>
                    <span className="text-border">·</span>
                    <span className="tabular-nums">
                      {classStudents.length} siswa
                    </span>
                    {scheduleAttendances.length > 0 ? (
                      <>
                        <span className="text-border">·</span>
                        <span className="tabular-nums">
                          {
                            scheduleAttendances.filter(
                              (a) => a.status === "hadir"
                            ).length
                          }{" "}
                          hadir
                        </span>
                      </>
                    ) : null}
                    <span className="text-border">·</span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1",
                        isFilled ? "text-brand-ink" : "text-muted-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          isFilled ? "bg-brand" : "bg-muted-foreground/40"
                        )}
                        aria-hidden
                      />
                      {isFilled ? "Jurnal terisi" : "Belum diisi"}
                    </span>
                  </p>
                  {journal?.materi ? (
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      <span className="text-foreground/70">Materi:</span>{" "}
                      {journal.materi}
                    </p>
                  ) : null}
                </div>

                {/* Aksi */}
                <div className="flex flex-wrap gap-1.5 sm:justify-end">
                  <JournalDialog
                    date={date}
                    schedule={schedule}
                    subjectName={subject?.name ?? "Mapel tidak ditemukan"}
                    classroomName={classroom?.name ?? "Kelas tidak ditemukan"}
                    journal={journal}
                    historyJournals={journals.filter(
                      (j) => j.classroomId === schedule.classroomId
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
                    allScoresByAssessment={Object.fromEntries(
                      scoresByAssessment
                    )}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
