"use client"

import { useMemo, useState } from "react"
import {
  BookOpenIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  GraduationCapIcon,
  PenLineIcon,
  UsersIcon,
} from "lucide-react"

import { GradeRecap } from "@/components/grade-recap"
import { JurnalReportSection } from "@/components/jurnal/jurnal-report-section"
import { JurnalScheduleList } from "@/components/jurnal/jurnal-schedule-list"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const dayMap = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"]
const dayLabel: Record<string, string> = {
  minggu: "Min", senin: "Sen", selasa: "Sel",
  rabu: "Rab", kamis: "Kam", jumat: "Jum", sabtu: "Sab",
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
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  })
}

export type Schedule = {
  id: string; day: string; jamKe: number
  startTime: string; endTime: string
  subjectId: string; classroomId: string
}
export type Subject = { id: string; name: string; kode: string | null }
export type Classroom = { id: string; name: string }
export type Journal = {
  id: string; scheduleId: string; date: string; jamKe: number
  startTime: string; endTime: string; subjectName: string
  subjectKode: string | null; classroomId: string; classroomName: string
  materi: string; kegiatan: string; catatan: string | null
}
export type Student = {
  id: string; name: string; nis: string | null
  classroomId: string; status: "aktif" | "keluar"
}
export type Attendance = {
  scheduleId: string; date: string; siswaId: string
  status: "hadir" | "sakit" | "izin" | "alfa"
}
export type GradeWeight = {
  id: string; name: string; weight: number; subjectId: string; status: string
}
export type Assessment = {
  id: string; title: string; description: string | null; date: string | null
  gradeWeightId: string; gradeWeightName: string
  classroomId: string; subjectId: string
}
export type Grade = { assessmentId: string; siswaId: string; score: number }

export type JurnalPageClientProps = {
  schedules: Schedule[]; subjects: Subject[]; classrooms: Classroom[]
  journals: Journal[]; students: Student[]; attendances: Attendance[]
  grades: Grade[]; gradeWeights: GradeWeight[]; assessments: Assessment[]
}

export function JurnalPageClient({
  schedules, subjects, classrooms, journals, students,
  attendances, grades, gradeWeights, assessments,
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
        .filter((s) => s.day === selectedDay)
        .sort((a, b) => a.jamKe - b.jamKe || a.startTime.localeCompare(b.startTime)),
    [schedules, selectedDay],
  )

  const journalsToday = useMemo(
    () => journals.filter((j) => j.date === date),
    [journals, date],
  )

  const journalBySchedule = useMemo(
    () => new Map(journalsToday.map((j) => [j.scheduleId, j])),
    [journalsToday],
  )

  const filledSchedules = schedulesToday.filter((s) => journalBySchedule.has(s.id)).length
  const fillRate =
    schedulesToday.length > 0
      ? Math.round((filledSchedules / schedulesToday.length) * 100)
      : 0

  const studentsByClassroom = useMemo(() => {
    const map = new Map<string, Student[]>()
    for (const s of students.filter((s) => s.status === "aktif")) {
      const list = map.get(s.classroomId) ?? []
      list.push(s)
      map.set(s.classroomId, list)
    }
    return map
  }, [students])

  const attendancesOnDate = useMemo(
    () => attendances.filter((a) => a.date === date),
    [attendances, date],
  )

  const attendanceSummary = useMemo(() => {
    const counts = { hadir: 0, sakit: 0, izin: 0, alfa: 0 }
    for (const a of attendancesOnDate) counts[a.status] += 1
    return counts
  }, [attendancesOnDate])

  const attendanceTotal =
    attendanceSummary.hadir + attendanceSummary.sakit +
    attendanceSummary.izin + attendanceSummary.alfa

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-6">

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <BookOpenIcon className="size-4" />
          <span>Jurnal Mengajar</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {formatLongDate(date)}
        </h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CalendarIcon className="size-3.5" /> Sesi hari ini
          </p>
          <p className="text-2xl font-semibold tabular-nums">{schedulesToday.length}</p>
          <p className="text-xs text-muted-foreground">{filledSchedules} sudah diisi</p>
        </div>
        <div className="rounded-xl border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2Icon className="size-3.5" /> Progres
          </p>
          <p className="text-2xl font-semibold tabular-nums">{fillRate}%</p>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", fillRate === 100 ? "bg-emerald-500" : "bg-primary")}
              style={{ width: `${fillRate}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <UsersIcon className="size-3.5" /> Kehadiran
          </p>
          <p className="text-2xl font-semibold tabular-nums">{attendanceSummary.hadir}</p>
          {attendanceTotal > 0 ? (
            <p className="text-xs text-muted-foreground">
              dari {attendanceTotal} siswa
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">belum dicatat</p>
          )}
        </div>
      </div>

      {/* Week date picker */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-foreground">Pilih tanggal</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDate((d) => addDays(startOfWeek(d), -7))}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Minggu sebelumnya"
            >
              <ChevronLeftIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setDate((d) => addDays(startOfWeek(d), 7))}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Minggu berikutnya"
            >
              <ChevronRightIcon className="size-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((dayDate) => {
            const dayName = getDayName(dayDate)
            const daySessions = schedules.filter((s) => s.day === dayName).length
            const dayJournals = journals.filter((j) => j.date === dayDate).length
            const isActive = dayDate === date
            const isToday = dayDate === todayDate
            return (
              <button
                key={dayDate}
                type="button"
                onClick={() => setDate(dayDate)}
                aria-pressed={isActive}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-center transition-colors",
                  isActive
                    ? "bg-foreground text-background"
                    : "hover:bg-muted text-foreground",
                )}
              >
                {isToday && !isActive && (
                  <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary" />
                )}
                <span className="text-[10px] font-medium">{dayLabel[dayName]}</span>
                <span className="text-sm font-semibold tabular-nums">{Number(dayDate.slice(8))}</span>
                <span className={cn("text-[10px]", isActive ? "text-background/70" : "text-muted-foreground")}>
                  {daySessions > 0 ? `${dayJournals}/${daySessions}` : "—"}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 pt-1 border-t">
          <label className="text-xs text-muted-foreground" htmlFor="manual-date">
            Tanggal lain
          </label>
          <Input
            id="manual-date"
            type="date"
            value={date}
            onChange={(e) => { if (e.target.value) setDate(e.target.value) }}
            className="h-8 w-auto text-xs border-0 shadow-none bg-transparent focus-visible:ring-0 p-0"
            aria-label="Pilih tanggal manual"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as typeof tab)}
        className="space-y-4"
      >
        <TabsList className="h-9 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger
            value="input"
            className="rounded-md text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <PenLineIcon className="size-3.5" />
            Input Jurnal
          </TabsTrigger>
          <TabsTrigger
            value="laporan"
            className="rounded-md text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <ClipboardListIcon className="size-3.5" />
            Laporan
          </TabsTrigger>
          <TabsTrigger
            value="rekap"
            className="rounded-md text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <GraduationCapIcon className="size-3.5" />
            Rekap Nilai
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input">
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
