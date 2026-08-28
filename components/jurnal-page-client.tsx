"use client"

import { useMemo, useState } from "react"
import {
  BookOpenIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  ClockIcon,
  FileTextIcon,
} from "lucide-react"

import { GradeRecap } from "@/components/grade-recap"
import { JurnalReportSection } from "@/components/jurnal/jurnal-report-section"
import { JurnalScheduleList } from "@/components/jurnal/jurnal-schedule-list"
import { Badge } from "@/components/ui/badge"
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

type Accent = "default" | "primary" | "success" | "warning" | "info" | "violet"

const accentPalette: Record<Accent, { bg: string; fg: string; ring: string; bar: string; chip: string }> = {
  default: {
    bg: "bg-slate-500/10",
    fg: "text-slate-700 dark:text-slate-300",
    ring: "ring-slate-500/20",
    bar: "bg-slate-500",
    chip: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
  },
  primary: {
    bg: "bg-sky-500/15",
    fg: "text-sky-700 dark:text-sky-300",
    ring: "ring-sky-500/25",
    bar: "bg-sky-500",
    chip: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  },
  success: {
    bg: "bg-emerald-500/15",
    fg: "text-emerald-700 dark:text-emerald-300",
    ring: "ring-emerald-500/25",
    bar: "bg-emerald-500",
    chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  warning: {
    bg: "bg-amber-500/20",
    fg: "text-amber-700 dark:text-amber-300",
    ring: "ring-amber-500/30",
    bar: "bg-amber-500",
    chip: "bg-amber-500/20 text-amber-800 dark:text-amber-300",
  },
  info: {
    bg: "bg-cyan-500/15",
    fg: "text-cyan-700 dark:text-cyan-300",
    ring: "ring-cyan-500/25",
    bar: "bg-cyan-500",
    chip: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
  },
  violet: {
    bg: "bg-violet-500/15",
    fg: "text-violet-700 dark:text-violet-300",
    ring: "ring-violet-500/25",
    bar: "bg-violet-500",
    chip: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  },
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "default",
}: {
  label: string
  value: number | string
  hint?: string
  icon: React.ComponentType<{ className?: string }>
  accent?: Accent
}) {
  const palette = accentPalette[accent]
  return (
    <Card className="relative overflow-hidden border-border/60 ring-1 ring-transparent transition-shadow hover:shadow-md">
      <span
        aria-hidden
        className={`absolute inset-x-0 top-0 h-1 ${palette.bar}`}
      />
      <CardContent className="flex flex-col gap-3 pt-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {label}
          </span>
          <span
            className={`inline-flex size-9 items-center justify-center rounded-lg ring-1 ${palette.bg} ${palette.fg} ${palette.ring}`}
          >
            <Icon className="size-4" />
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
            {value}
          </span>
          {hint ? (
            <span className={`text-[11px] font-medium ${palette.chip} rounded-full px-1.5 py-0.5`}>
              {hint}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
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

  return (
    <div className="flex flex-col gap-6">
      <div className="relative -mx-4 overflow-hidden border-b border-border/60 bg-gradient-to-r from-sky-500/10 via-violet-500/10 to-amber-500/10 px-4 pb-6 sm:-mx-6 sm:px-6">
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-sky-500 via-violet-500 to-amber-500"
        />
        <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-violet-700 uppercase dark:text-violet-300">
              Pembelajaran
            </p>
            <h1 className="bg-gradient-to-r from-sky-700 via-violet-700 to-amber-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              Jurnal
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Catat materi, kegiatan, absensi, dan nilai per sesi jadwal dalam satu tempat.
            </p>
          </div>

          <div className="flex flex-col items-start gap-1 sm:items-end">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-violet-700 uppercase dark:text-violet-300">
              <CalendarDaysIcon className="size-3" />
              {formatLongDate(date)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {schedulesToday.length} sesi · {totalStudentsToday} siswa
            </span>
          </div>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Sesi hari ini"
          value={schedulesToday.length}
          icon={ClockIcon}
          accent="primary"
          hint="sesi terjadwal"
        />
        <StatCard
          label="Sudah diisi"
          value={`${filledSchedules}/${schedulesToday.length}`}
          icon={CheckCircle2Icon}
          accent={fillRate === 100 ? "success" : "warning"}
          hint={schedulesToday.length > 0 ? `${fillRate}% selesai` : "—"}
        />
        <StatCard
          label="Absensi tercatat"
          value={attendanceRecorded}
          icon={BookOpenIcon}
          accent="info"
          hint={`dari ${schedulesToday.length} sesi`}
        />
        <StatCard
          label="Total jurnal"
          value={journals.length}
          icon={FileTextIcon}
          accent="violet"
          hint={`${subjects.length} mapel · ${classrooms.length} kelas`}
        />
      </section>

      <Card className="overflow-hidden border-border/60">
        <CardContent className="flex flex-col gap-4 pt-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-foreground">Progres input jurnal</h2>
              <p className="text-xs text-muted-foreground">
                {schedulesToday.length === 0
                  ? "Tidak ada sesi pada hari ini."
                  : `${filledSchedules} dari ${schedulesToday.length} sesi telah dicatat.`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className={
                  fillRate === 100
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300"
                }
                variant="outline"
              >
                {fillRate === 100 ? "Lengkap" : `${fillRate}%`}
              </Badge>
              {attendanceSummary.hadir +
                attendanceSummary.sakit +
                attendanceSummary.izin +
                attendanceSummary.alfa >
                0 && (
                <span className="hidden flex-wrap items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
                  <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 font-medium text-emerald-700 dark:text-emerald-300">
                    Hadir {attendanceSummary.hadir}
                  </span>
                  <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 font-medium text-amber-700 dark:text-amber-300">
                    Sakit {attendanceSummary.sakit}
                  </span>
                  <span className="rounded-full bg-sky-500/15 px-1.5 py-0.5 font-medium text-sky-700 dark:text-sky-300">
                    Izin {attendanceSummary.izin}
                  </span>
                  <span className="rounded-full bg-rose-500/15 px-1.5 py-0.5 font-medium text-rose-700 dark:text-rose-300">
                    Alfa {attendanceSummary.alfa}
                  </span>
                </span>
              )}
            </div>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full transition-all ${
                fillRate === 100
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                  : "bg-gradient-to-r from-sky-500 via-violet-500 to-amber-500"
              }`}
              style={{ width: `${fillRate}%` }}
            />
          </div>
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
                  className={`flex min-w-14 flex-col items-center gap-0.5 rounded-lg border px-2.5 py-1.5 text-xs transition-all ${
                    isActive
                      ? "border-transparent bg-gradient-to-br from-sky-500 to-violet-500 text-white shadow-sm shadow-violet-500/30"
                      : "border-border bg-background text-muted-foreground hover:border-sky-400/50 hover:text-sky-600"
                  }`}
                >
                  <span className="text-[10px] font-semibold tracking-wide uppercase">
                    {dayLabel[dayName]}
                  </span>
                  <span
                    className={`text-sm font-bold tabular-nums ${
                      isActive ? "" : "text-foreground"
                    }`}
                  >
                    {Number(dayDate.slice(8))}
                  </span>
                  <span
                    className={`text-[10px] tabular-nums ${
                      isActive ? "text-white/80" : "text-muted-foreground"
                    }`}
                  >
                    {daySchedules > 0 ? `${dayJournals}/${daySchedules}` : "—"}
                  </span>
                  {isToday && !isActive ? (
                    <span className="size-1.5 rounded-full bg-amber-500 ring-2 ring-amber-500/30" aria-hidden />
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
                className="h-9 w-auto border-violet-500/30 bg-violet-500/5 text-sm shadow-none focus-visible:ring-violet-500/40"
                aria-label="Tanggal jurnal"
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="inline-flex h-auto gap-1 rounded-xl border border-border/60 bg-muted/40 p-1">
            <TabsTrigger
              value="input"
              className="rounded-lg px-3.5 py-1.5 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              Input jurnal
            </TabsTrigger>
            <TabsTrigger
              value="laporan"
              className="rounded-lg px-3.5 py-1.5 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              Laporan
            </TabsTrigger>
            <TabsTrigger
              value="rekap"
              className="rounded-lg px-3.5 py-1.5 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              Rekap nilai
            </TabsTrigger>
          </TabsList>
        </div>

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
