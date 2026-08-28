"use client"

import { AttendanceDialog } from "@/components/attendance-dialog"
import { GradeDialog } from "@/components/grade-dialog"
import { JournalDialog } from "@/components/journal-dialog"
import { Card, CardContent } from "@/components/ui/card"
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

  const collator = new Intl.Collator("id-ID", { numeric: true, sensitivity: "base" })

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
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-14 text-center">
          <p className="text-sm font-medium text-foreground">Tidak ada sesi jadwal</p>
          <p className="text-xs text-muted-foreground">
            Pilih hari lain atau tambahkan jadwal mengajar.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {schedules.map((schedule) => {
            const subject = subjectById.get(schedule.subjectId)
            const classroom = classroomById.get(schedule.classroomId)
            const journal = journalBySchedule.get(schedule.id)
            const classStudents = (studentsByClassroom.get(schedule.classroomId) ?? [])
              .slice()
              .sort((a, b) => collator.compare(a.name, b.name))
            const scheduleAttendances = attendanceBySchedule.get(schedule.id) ?? []
            const attendanceStatuses = Object.fromEntries(
              scheduleAttendances.map((a) => [a.siswaId, a.status]),
            )
            const scheduleWeights = weightsBySubject.get(schedule.subjectId) ?? []
            const scheduleAssessments = (
              assessmentsByKey.get(`${schedule.classroomId}:${schedule.subjectId}`) ?? []
            )
              .slice()
              .sort(
                (a, b) =>
                  (a.date ?? "").localeCompare(b.date ?? "") ||
                  collator.compare(a.title, b.title),
              )
            const scheduleScoresByAssessment = Object.fromEntries(
              scheduleAssessments.map((a) => [
                a.id,
                scoresByAssessment.get(a.id) ?? {},
              ]),
            )

            const subjectClassrooms = classrooms.filter((c) =>
              schedules.some(
                (s) => s.subjectId === schedule.subjectId && s.classroomId === c.id,
              ),
            )
            const allSubjectAssessments = assessments.filter(
              (a) => a.subjectId === schedule.subjectId,
            )
            const studentCountsByClassroom: Record<string, number> = {}
            for (const c of subjectClassrooms) {
              studentCountsByClassroom[c.id] = (studentsByClassroom.get(c.id) ?? []).length
            }
            const isFilled = !!journal

            return (
              <li
                key={schedule.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <h3 className="text-sm font-semibold text-foreground">
                      {subject?.name ?? "Mapel tidak ditemukan"}
                    </h3>
                    {subject?.kode ? (
                      <span className="text-xs text-muted-foreground">({subject.kode})</span>
                    ) : null}
                    <span className="text-xs tabular-nums text-muted-foreground">
                      Jam ke-{schedule.jamKe}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <span
                        className={`size-1.5 shrink-0 rounded-full ${
                          isFilled ? "bg-emerald-600 dark:bg-emerald-400" : "bg-stone-400"
                        }`}
                        aria-hidden
                      />
                      <span className={isFilled ? "text-foreground" : "text-muted-foreground"}>
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
                      <span className="text-foreground/70">Materi:</span> {journal.materi}
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
                    allScoresByAssessment={Object.fromEntries(scoresByAssessment)}
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
