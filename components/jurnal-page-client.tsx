"use client"

import { useMemo, useState, type ReactNode } from "react"
import {
  BookOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  GraduationCapIcon,
  PenLineIcon,
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
  const todayDate = useMemo(() => today(), [])
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

  const pendingSessions = schedulesToday.length - filledSchedules

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 py-2">

      {/* Header */}
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          <BookOpenIcon className="size-3.5" />
          Jurnal Mengajar
        </div>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {formatLongDate(date)}
          </h1>
          <span className="text-xs text-muted-foreground">
            {pendingSessions > 0 ? (
              <>
                <span className="font-medium text-foreground tabular-nums">{pendingSessions}</span>{" "}
                sesi belum diisi
              </>
            ) : schedulesToday.length > 0 ? (
              "Semua sesi hari ini sudah diisi"
            ) : (
              "Tidak ada sesi mengajar"
            )}
          </span>
        </div>
      </header>

      {/* Ringkasan hari ini */}
      <section className="brand-wash grid gap-px overflow-hidden rounded-xl sm:grid-cols-3">
        <RingkasanCell
          label="Sesi"
          value={schedulesToday.length}
          hint={`${filledSchedules} sudah diisi`}
        />
        <RingkasanCell
          label="Progres jurnal"
          value={`${fillRate}%`}
          hint={
            <span className="brand-meter block h-1.5 overflow-hidden rounded-full">
              <span
                className="block h-full rounded-full transition-all"
                style={{ width: `${fillRate}%` }}
              />
            </span>
          }
        />
        <RingkasanCell
          label="Kehadiran"
          value={
            attendanceTotal > 0
              ? `${Math.round((attendanceSummary.hadir / attendanceTotal) * 100)}%`
              : "—"
          }
          hint={
            attendanceTotal > 0
              ? `${attendanceSummary.hadir}/${attendanceTotal} hadir · ${attendanceSummary.alfa} alfa`
              : "belum dicatat"
          }
        />
      </section>

      {/* Date picker */}
      <div className="surface rounded-xl bg-card p-2.5 ring-1 ring-foreground/10 sm:p-3">
        <div className="mb-2 flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground">Pilih tanggal</span>
            <button
              type="button"
              onClick={() => setDate(todayDate)}
              disabled={date === todayDate}
              className="rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:invisible"
            >
              Hari ini
            </button>
          </div>
          <div className="flex items-center gap-1">
            <Input
              id="manual-date"
              type="date"
              value={date}
              onChange={(e) => { if (e.target.value) setDate(e.target.value) }}
              className="h-7 w-auto border-0 bg-transparent p-0 text-xs shadow-none focus-visible:ring-0"
              aria-label="Pilih tanggal manual"
            />
            <button
              type="button"
              onClick={() => setDate(addDays(startOfWeek(date), -7))}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Minggu sebelumnya"
            >
              <ChevronLeftIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setDate(addDays(startOfWeek(date), 7))}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
            const isTodayWeek = dayDate === todayDate
            const complete = daySessions > 0 && dayJournals >= daySessions
            return (
              <button
                key={dayDate}
                type="button"
                onClick={() => setDate(dayDate)}
                aria-pressed={isActive}
                className={cn(
                  "relative flex flex-col items-center gap-1 rounded-lg py-2 transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent",
                )}
              >
                <span className="text-[10px] font-medium opacity-70">{dayLabel[dayName]}</span>
                <span className="text-sm font-semibold tabular-nums">
                  {Number(dayDate.slice(8))}
                </span>
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    daySessions === 0
                      ? "opacity-0"
                      : complete
                        ? isActive ? "bg-primary-foreground" : "bg-primary"
                        : isActive ? "bg-primary-foreground/40" : "bg-foreground/20",
                  )}
                  aria-hidden
                />
                {isTodayWeek && !isActive ? (
                  <span className="absolute inset-x-3 bottom-0.5 h-px bg-primary" aria-hidden />
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as typeof tab)}
        className="space-y-4"
      >
        <TabsList className="h-8 w-fit rounded-lg bg-muted p-0.5">
          <TabsTrigger
            value="input"
            className="gap-1.5 rounded-md px-2.5 text-xs data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <PenLineIcon className="size-3.5" />
            Input Jurnal
          </TabsTrigger>
          <TabsTrigger
            value="laporan"
            className="gap-1.5 rounded-md px-2.5 text-xs data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <ClipboardListIcon className="size-3.5" />
            Laporan
          </TabsTrigger>
          <TabsTrigger
            value="rekap"
            className="gap-1.5 rounded-md px-2.5 text-xs data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
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

function RingkasanCell({
  label,
  value,
  hint,
}: {
  label: string
  value: ReactNode
  hint: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5 bg-card/60 px-4 py-3 first:rounded-l-xl last:rounded-r-xl">
      <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <span className="text-xl font-semibold tracking-tight tabular-nums text-brand-ink">
        {value}
      </span>
      <span className="block text-[11px] leading-snug text-muted-foreground">{hint}</span>
    </div>
  )
}
