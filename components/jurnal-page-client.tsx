"use client"

import { useMemo, useState } from "react"
import {
  CalendarDaysIcon,
  CheckCircle2Icon,
  ClockIcon,
  FileTextIcon,
  UsersIcon,
} from "lucide-react"

import { GradeRecap } from "@/components/grade-recap"
import { JurnalReportSection } from "@/components/jurnal/jurnal-report-section"
import { JurnalScheduleList } from "@/components/jurnal/jurnal-schedule-list"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const dayMap = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"]
const dayLabel: Record<string, string> = {
  minggu: "Min",
  senin: "Sen",
  selasa: "Sel",
  rabu: "Rab",
  kamis: "Kam",
  jumat: "Jum",
  sabtu: "Sab",
}

function today() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

function getDayName(date: string) {
  return dayMap[new Date(`${date}T00:00:00`).getDay()]
}

function startOfWeek(date: string) {
  const d = new Date(`${date}T00:00:00`)
  const offset = d.getDay() === 0 ? -6 : 1 - d.getDay()
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function addDays(date: string, n: number) {
  const d = new Date(`${date}T00:00:00`)
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function formatLongDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export type Schedule = {
  id: string
  day: string
  jamKe: number
  startTime: string
  endTime: string
  subjectId: string
  classroomId: string
}

export type Subject = { id: string; name: string; kode: string | null }
export type Classroom = { id: string; name: string }

export type Journal = {
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

export type Student = {
  id: string
  name: string
  nis: string | null
  classroomId: string
  status: "aktif" | "keluar"
}

export type Attendance = {
  scheduleId: string
  date: string
  siswaId: string
  status: "hadir" | "sakit" | "izin" | "alfa"
}

export type GradeWeight = {
  id: string
  name: string
  weight: number
  subjectId: string
  status: string
}

export type Assessment = {
  id: string
  title: string
  description: string | null
  date: string | null
  gradeWeightId: string
  gradeWeightName: string
  classroomId: string
  subjectId: string
}

export type Grade = { assessmentId: string; siswaId: string; score: number }

export type JurnalPageClientProps = {
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

type StatCardProps = {
  label: string
  value: number | string
  hint?: string
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
  emphasis?: boolean
}

function StatCard({ label, value, hint, icon: Icon, emphasis = false }: StatCardProps) {
  return (
    <div
      className={
        emphasis
          ? "rounded-md border border-primary/20 bg-primary/5 px-4 py-3"
          : "rounded-md border border-border bg-card px-4 py-3"
      }
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className={
            emphasis
              ? "text-[11px] font-medium tracking-wide text-primary uppercase"
              : "text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
          }
        >
          {label}
        </p>
        <Icon
          className={
            emphasis
              ? "size-3.5 shrink-0 text-primary/70"
              : "size-3.5 shrink-0 text-muted-foreground/70"
          }
          aria-hidden
        />
      </div>
      <p
        className={
          emphasis
            ? "mt-1 font-mono text-2xl font-semibold tabular-nums text-primary"
            : "mt-1 font-mono text-xl font-semibold tabular-nums text-foreground"
        }
      >
        {value}
      </p>
      {hint ? (
        <p
          className={
            emphasis
              ? "mt-0.5 text-[11px] text-primary/80"
              : "mt-0.5 text-[11px] text-muted-foreground"
          }
        >
          {hint}
        </p>
      ) : null}
    </div>
  )
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

  const selectedDay = getDayName(date)
  const todayDate = useMemo(today, [])
  const weekStart = useMemo(() => startOfWeek(date), [date])
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  )

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

  const filledSchedules = schedulesToday.filter((item) =>
    journalBySchedule.has(item.id),
  ).length
  const fillRate =
    schedulesToday.length > 0
      ? Math.round((filledSchedules / schedulesToday.length) * 100)
      : 0

  const studentsByClassroom = useMemo(() => {
    const map = new Map<string, Student[]>()
    for (const student of students.filter((item) => item.status === "aktif")) {
      const list = map.get(student.classroomId) ?? []
      list.push(student)
      map.set(student.classroomId, list)
    }
    return map
  }, [students])

  const totalStudentsToday = useMemo(() => {
    const ids = new Set<string>()
    for (const schedule of schedulesToday) {
      for (const student of studentsByClassroom.get(schedule.classroomId) ?? []) {
        ids.add(student.id)
      }
    }
    return ids.size
  }, [schedulesToday, studentsByClassroom])

  const attendancesOnDate = useMemo(
    () => attendances.filter((item) => item.date === date),
    [attendances, date],
  )

  const attendanceSummary = useMemo(() => {
    const counts = { hadir: 0, sakit: 0, izin: 0, alfa: 0 }
    for (const item of attendancesOnDate) counts[item.status] += 1
    return counts
  }, [attendancesOnDate])

  const attendanceRecorded = useMemo(
    () => new Set(attendancesOnDate.map((a) => a.scheduleId)).size,
    [attendancesOnDate],
  )

  const attendanceTotal =
    attendanceSummary.hadir +
    attendanceSummary.sakit +
    attendanceSummary.izin +
    attendanceSummary.alfa

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Jurnal
          </h1>
          <p className="text-sm text-muted-foreground">
            Catat materi, kegiatan, absensi, dan nilai per sesi jadwal dalam satu tempat.
          </p>
        </div>

        <div className="flex flex-col items-start gap-1 sm:items-end">
          <time
            dateTime={date}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground"
          >
            <CalendarDaysIcon className="size-3.5 text-muted-foreground" aria-hidden />
            {formatLongDate(date)}
          </time>
          <p className="text-xs text-muted-foreground">
            <span className="font-mono tabular-nums text-foreground">
              {schedulesToday.length}
            </span>{" "}
            sesi ·{" "}
            <span className="font-mono tabular-nums text-foreground">
              {totalStudentsToday}
            </span>{" "}
            siswa
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <StatCard
          label="Sesi hari ini"
          value={schedulesToday.length}
          icon={ClockIcon}
          emphasis
        />
        <StatCard
          label="Sudah diisi"
          value={`${filledSchedules}/${schedulesToday.length}`}
          icon={CheckCircle2Icon}
          hint={
            schedulesToday.length > 0
              ? `${fillRate}% selesai`
              : "Tidak ada sesi"
          }
        />
        <StatCard
          label="Absensi tercatat"
          value={attendanceRecorded}
          icon={UsersIcon}
          hint={`dari ${schedulesToday.length} sesi`}
        />
        <StatCard
          label="Total jurnal"
          value={journals.length}
          icon={FileTextIcon}
          hint={`${subjects.length} mapel · ${classrooms.length} kelas`}
        />
      </dl>

      <Card className="overflow-hidden border-border shadow-none ring-0">
        <CardContent className="flex flex-col gap-4 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-foreground">
                Progres input jurnal
              </h2>
              <p className="text-xs text-muted-foreground">
                {schedulesToday.length === 0
                  ? "Tidak ada sesi pada hari ini."
                  : `${filledSchedules} dari ${schedulesToday.length} sesi telah dicatat.`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>
                Progres{" "}
                <span className="font-mono font-medium tabular-nums text-foreground">
                  {fillRate}%
                </span>
              </span>
              {attendanceTotal > 0 ? (
                <>
                  <span className="text-border" aria-hidden>
                    ·
                  </span>
                  <span className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                    <span>
                      Hadir{" "}
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {attendanceSummary.hadir}
                      </span>
                    </span>
                    <span>
                      Sakit{" "}
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {attendanceSummary.sakit}
                      </span>
                    </span>
                    <span>
                      Izin{" "}
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {attendanceSummary.izin}
                      </span>
                    </span>
                    <span>
                      Alfa{" "}
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {attendanceSummary.alfa}
                      </span>
                    </span>
                  </span>
                </>
              ) : null}
            </div>
          </div>
          <Progress
            value={fillRate}
            className="h-1.5"
            aria-label={`Progres input jurnal ${fillRate}%`}
          />
          <div className="flex flex-wrap items-center gap-1.5">
            {weekDays.map((dayDate) => {
              const dayName = getDayName(dayDate)
              const daySchedules = schedules.filter((s) => s.day === dayName).length
              const dayJournals = journals.filter((j) => j.date === dayDate).length
              const isActive = dayDate === date
              const isToday = dayDate === todayDate
              return (
                <button
                  key={dayDate}
                  type="button"
                  onClick={() => setDate(dayDate)}
                  aria-pressed={isActive}
                  className={
                    isActive
                      ? "flex min-w-14 flex-col items-center gap-0.5 rounded-md border border-primary/30 bg-primary px-2.5 py-1.5 text-xs"
                      : "flex min-w-14 flex-col items-center gap-0.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs transition-colors hover:border-primary/40"
                  }
                >
                  <span
                    className={
                      isActive
                        ? "text-[10px] font-semibold tracking-wide text-primary-foreground uppercase"
                        : "text-[10px] font-semibold tracking-wide text-muted-foreground uppercase"
                    }
                  >
                    {dayLabel[dayName]}
                  </span>
                  <span
                    className={
                      isActive
                        ? "font-mono text-sm font-bold tabular-nums text-primary-foreground"
                        : "font-mono text-sm font-bold tabular-nums text-foreground"
                    }
                  >
                    {Number(dayDate.slice(8))}
                  </span>
                  <span
                    className={
                      isActive
                        ? "font-mono text-[10px] tabular-nums text-primary-foreground/85"
                        : "font-mono text-[10px] tabular-nums text-muted-foreground"
                    }
                  >
                    {daySchedules > 0
                      ? `${dayJournals}/${daySchedules}`
                      : "Libur"}
                  </span>
                  {isToday && !isActive ? (
                    <span
                      className="size-1.5 rounded-full bg-primary"
                      aria-label="Hari ini"
                    />
                  ) : null}
                </button>
              )
            })}
            <div className="ml-auto flex items-center gap-2">
              <Input
                type="date"
                value={date}
                onChange={(event) => {
                  if (event.target.value) setDate(event.target.value)
                }}
                className="!h-9 w-auto text-sm shadow-none"
                aria-label="Pilih tanggal jurnal"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as "input" | "laporan" | "rekap")}
        className="gap-4"
      >
        <TabsList className="h-9">
          <TabsTrigger value="input">Input jurnal</TabsTrigger>
          <TabsTrigger value="laporan">Laporan</TabsTrigger>
          <TabsTrigger value="rekap">Rekap nilai</TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="flex flex-col gap-4">
          <JurnalScheduleList
            date={date}
            schedules={schedulesToday}
            subjects={subjects}
            classrooms={classrooms}
            journals={journals}
            students={students}
            attendances={attendances}
            grades={grades}
            gradeWeights={gradeWeights}
            assessments={assessments}
          />
        </TabsContent>

        <TabsContent value="laporan">
          <JurnalReportSection journals={journals} classrooms={classrooms} />
        </TabsContent>

        <TabsContent value="rekap">
          <GradeRecap
            classrooms={classrooms}
            subjects={subjects}
            students={students}
            assessments={assessments}
            grades={grades}
            gradeWeights={gradeWeights}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
