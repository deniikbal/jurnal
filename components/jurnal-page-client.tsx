"use client"

import { useMemo, useState } from "react"
import {
  CalendarDaysIcon,
  CalendarRangeIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  ClockIcon,
  FileTextIcon,
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

  const stats = [
    {
      label: "Sesi Hari Ini",
      value: schedulesToday.length,
      icon: ClockIcon,
      tone: "primary" as const,
      hint: selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1),
    },
    {
      label: "Sudah Diisi",
      value: `${filledSchedules}/${schedulesToday.length}`,
      icon: CheckCircle2Icon,
      tone: "secondary" as const,
      hint:
        schedulesToday.length > 0
          ? `${fillRate}% selesai`
          : "Tidak ada sesi",
    },
    {
      label: "Absensi Tercatat",
      value: attendanceRecorded,
      icon: UsersIcon,
      tone: "accent" as const,
      hint: `${attendanceTotal} siswa di ${schedulesToday.length} sesi`,
    },
    {
      label: "Total Jurnal",
      value: journals.length,
      icon: FileTextIcon,
      tone: "card" as const,
      hint: `${subjects.length} mapel · ${classrooms.length} kelas`,
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      <section className="relative border-4 border-foreground bg-primary p-6 text-primary-foreground shadow-[6px_6px_0px_0px_var(--foreground)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 border-2 border-foreground bg-background px-2.5 py-1 text-[11px] font-bold tracking-wider text-foreground uppercase">
              <PenLineIcon className="size-3" />
              Catatan Pembelajaran
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Jurnal
            </h1>
            <p className="max-w-lg text-sm font-medium text-primary-foreground/85">
              Catat materi, kegiatan, absensi, dan nilai per sesi jadwal dalam satu tempat.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 border-2 border-foreground bg-background px-3 py-2 text-foreground">
              <CalendarDaysIcon className="size-3.5" />
              <span className="border-2 border-foreground bg-foreground px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-background uppercase">
                {formatLongDate(date)}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 border-2 border-foreground bg-background px-3 py-2 text-foreground">
              <ClockIcon className="size-3.5" />
              <span className="text-[11px] font-bold tracking-wider uppercase">
                Sesi
              </span>
              <span className="border-2 border-foreground bg-foreground px-2 py-0.5 text-xs font-extrabold tabular-nums text-background">
                {schedulesToday.length}
              </span>
              <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                · {totalStudentsToday} siswa
              </span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="inline-block border-b-4 border-foreground pb-1 text-sm font-extrabold tracking-wider text-foreground uppercase">
            Ringkasan
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            const cardClass = {
              primary:
                "bg-primary text-primary-foreground",
              secondary:
                "bg-secondary text-secondary-foreground",
              accent: "bg-accent text-accent-foreground",
              card: "bg-card text-foreground",
            }[stat.tone]
            const subTextClass = {
              primary: "text-primary-foreground/80",
              secondary: "text-secondary-foreground/80",
              accent: "text-accent-foreground/80",
              card: "text-muted-foreground",
            }[stat.tone]
            return (
              <div
                key={stat.label}
                className={cn(
                  "border-2 border-foreground p-5 shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--foreground)]",
                  cardClass,
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p
                      className={cn(
                        "text-[11px] font-bold tracking-wider uppercase",
                        subTextClass,
                      )}
                    >
                      {stat.label}
                    </p>
                    <p className="text-5xl font-extrabold tabular-nums leading-none">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center border-2 border-foreground",
                      stat.tone === "card"
                        ? "bg-foreground text-background"
                        : "bg-background text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                </div>
                <p
                  className={cn(
                    "mt-4 text-xs font-bold tracking-wider uppercase",
                    subTextClass,
                  )}
                >
                  {stat.hint}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_var(--foreground)]">
        <div className="flex flex-col gap-3 border-b-2 border-foreground bg-accent px-4 py-4 text-accent-foreground sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center border-2 border-foreground bg-background text-foreground shadow-[2px_2px_0px_0px_var(--foreground)]">
              <ClipboardListIcon className="size-4" />
            </span>
            <div className="space-y-0.5">
              <h2 className="text-sm font-extrabold tracking-wider uppercase">
                Progres Input Jurnal
              </h2>
              <p className="text-xs font-medium text-accent-foreground/85">
                {schedulesToday.length === 0
                  ? "Tidak ada sesi pada hari ini."
                  : `${filledSchedules} dari ${schedulesToday.length} sesi telah dicatat.`}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 self-start border-2 border-foreground bg-foreground px-2.5 py-1.5 text-xs font-extrabold tracking-wider text-background uppercase tabular-nums sm:self-auto">
            Progres {fillRate}%
          </span>
        </div>
        <div className="space-y-3 px-4 py-4 sm:px-5">
          <div className="relative h-6 border-2 border-foreground bg-muted">
            <div
              className={cn(
                "h-full border-r-2 border-foreground transition-all",
                fillRate === 100 ? "bg-secondary" : "bg-primary",
              )}
              style={{ width: `${fillRate}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold tracking-wider text-foreground uppercase tabular-nums mix-blend-difference">
              {fillRate}%
            </span>
          </div>
          {attendanceTotal > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold tracking-wider text-foreground uppercase">
              <span className="inline-flex items-center gap-1.5 border-2 border-foreground bg-background px-2 py-1">
                <span className="size-2 bg-secondary" aria-hidden />
                Hadir {attendanceSummary.hadir}
              </span>
              <span className="inline-flex items-center gap-1.5 border-2 border-foreground bg-background px-2 py-1">
                <span className="size-2 bg-primary" aria-hidden />
                Sakit {attendanceSummary.sakit}
              </span>
              <span className="inline-flex items-center gap-1.5 border-2 border-foreground bg-background px-2 py-1">
                <span className="size-2 bg-accent" aria-hidden />
                Izin {attendanceSummary.izin}
              </span>
              <span className="inline-flex items-center gap-1.5 border-2 border-foreground bg-foreground px-2 py-1 text-background">
                <span className="size-2 bg-background" aria-hidden />
                Alfa {attendanceSummary.alfa}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t-2 border-foreground px-4 py-4 sm:px-5">
          <span className="inline-flex items-center gap-2 border-2 border-foreground bg-secondary px-2.5 py-1 text-[11px] font-bold tracking-wider text-secondary-foreground uppercase">
            <CalendarRangeIcon className="size-3" />
            Pilih Tanggal
          </span>
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
                  className={cn(
                    "relative flex min-w-14 cursor-pointer flex-col items-center gap-0.5 border-2 border-foreground px-2.5 py-1.5 text-xs transition-all",
                    isActive
                      ? "bg-foreground text-background shadow-[2px_2px_0px_0px_var(--foreground)]"
                      : "bg-background text-foreground hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--foreground)]",
                  )}
                >
                  {isToday && !isActive ? (
                    <span
                      className="absolute -top-1.5 -right-1.5 size-2 rounded-full bg-primary ring-2 ring-background"
                      aria-label="Hari ini"
                    />
                  ) : null}
                  <span
                    className={cn(
                      "text-[10px] font-extrabold tracking-wider uppercase",
                      isActive ? "text-background" : "text-muted-foreground",
                    )}
                  >
                    {dayLabel[dayName]}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-extrabold tabular-nums",
                      isActive ? "text-background" : "text-foreground",
                    )}
                  >
                    {Number(dayDate.slice(8))}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold tabular-nums",
                      isActive
                        ? "text-background"
                        : daySchedules > 0
                          ? "text-foreground"
                          : "text-muted-foreground",
                    )}
                  >
                    {daySchedules > 0
                      ? `${dayJournals}/${daySchedules}`
                      : "Libur"}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <label className="inline-flex items-center gap-2 border-2 border-foreground bg-muted px-2.5 py-1.5 text-[11px] font-bold tracking-wider text-foreground uppercase">
              <GraduationCapIcon className="size-3" />
              Manual
            </label>
            <Input
              type="date"
              value={date}
              onChange={(event) => {
                if (event.target.value) setDate(event.target.value)
              }}
              className="!h-9 w-auto border-2 border-foreground bg-background text-sm shadow-none"
              aria-label="Pilih tanggal jurnal"
            />
          </div>
        </div>
      </section>

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as "input" | "laporan" | "rekap")}
        className="gap-5"
      >
        <TabsList className="h-auto gap-2 bg-transparent p-0">
          <TabsTrigger
            value="input"
            className="cursor-pointer border-2 border-foreground bg-background px-4 py-2.5 text-xs font-extrabold tracking-wider text-foreground uppercase shadow-[3px_3px_0px_0px_var(--foreground)] transition-all data-[state=active]:-translate-x-0.5 data-[state=active]:-translate-y-0.5 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-[5px_5px_0px_0px_var(--foreground)] hover:-translate-x-0.5 hover:-translate-y-0.5"
          >
            <PenLineIcon className="size-3.5" />
            Input Jurnal
          </TabsTrigger>
          <TabsTrigger
            value="laporan"
            className="cursor-pointer border-2 border-foreground bg-background px-4 py-2.5 text-xs font-extrabold tracking-wider text-foreground uppercase shadow-[3px_3px_0px_0px_var(--foreground)] transition-all data-[state=active]:-translate-x-0.5 data-[state=active]:-translate-y-0.5 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-[5px_5px_0px_0px_var(--foreground)] hover:-translate-x-0.5 hover:-translate-y-0.5"
          >
            <ClipboardListIcon className="size-3.5" />
            Laporan
          </TabsTrigger>
          <TabsTrigger
            value="rekap"
            className="cursor-pointer border-2 border-foreground bg-background px-4 py-2.5 text-xs font-extrabold tracking-wider text-foreground uppercase shadow-[3px_3px_0px_0px_var(--foreground)] transition-all data-[state=active]:-translate-x-0.5 data-[state=active]:-translate-y-0.5 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-[5px_5px_0px_0px_var(--foreground)] hover:-translate-x-0.5 hover:-translate-y-0.5"
          >
            <GraduationCapIcon className="size-3.5" />
            Rekap Nilai
          </TabsTrigger>
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