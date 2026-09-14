"use client"

import { useMemo, useState } from "react"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ClockIcon,
  GraduationCapIcon,
  HashIcon,
  LayersIcon,
  PlusIcon,
  TimerIcon,
} from "lucide-react"

import { ScheduleActions } from "@/components/schedule-actions"
import { ScheduleCreateDialog } from "@/components/schedule-create-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 12
const days = ["senin", "selasa", "rabu", "kamis", "jumat"] as const

function labelDay(d: string) {
  return d.charAt(0).toUpperCase() + d.slice(1)
}

function shortDay(d: string) {
  return labelDay(d).slice(0, 3)
}

function todayWeekday() {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
  }).format(new Date()).toLowerCase()
}

function formatRange(start: string, end: string) {
  return `${start} – ${end}`
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

type Subject = { id: string; name: string; kode: string | null }
type Classroom = { id: string; name: string }

type JadwalPageClientProps = {
  schedules: Schedule[]
  subjects: Subject[]
  classrooms: Classroom[]
}

export function JadwalPageClient({
  schedules,
  subjects,
  classrooms,
}: JadwalPageClientProps) {
  const today = todayWeekday()
  const [day, setDay] = useState<string>((days as readonly string[]).includes(today) ? today : "senin")
  const [page, setPage] = useState(0)

  const subjectById = useMemo(
    () => new Map(subjects.map((s) => [s.id, s])),
    [subjects],
  )
  const subjectsAsOptions = useMemo(
    () => subjects.map((s) => ({ id: s.id, name: s.name, kode: s.kode ?? undefined })),
    [subjects],
  )
  const classroomById = useMemo(
    () => new Map(classrooms.map((c) => [c.id, c])),
    [classrooms],
  )
  const countByDay = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of schedules) {
      map.set(s.day, (map.get(s.day) ?? 0) + 1)
    }
    return map
  }, [schedules])

  const filtered = useMemo(
    () =>
      schedules
        .filter((s) => s.day === day)
        .sort(
          (a, b) => a.jamKe - b.jamKe || a.startTime.localeCompare(b.startTime),
        ),
    [schedules, day],
  )

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1)
  const safePage = Math.min(page, totalPages - 1)
  const startIdx = safePage * PAGE_SIZE
  const paginated = filtered.slice(startIdx, startIdx + PAGE_SIZE)

  const firstSlot = filtered[0]
  const lastSlot = filtered[filtered.length - 1]
  const peakDay = days.reduce((best, d) => {
    const count = countByDay.get(d) ?? 0
    const bestCount = countByDay.get(best) ?? 0
    return count > bestCount ? d : best
  }, days[0])
  const peakCount = countByDay.get(peakDay) ?? 0
  const activeDayCount = days.filter((d) => (countByDay.get(d) ?? 0) > 0).length
  const totalJam = schedules.reduce((acc, s) => acc + Math.max(0, s.jamKe), 0)
  const uniqueMapel = new Set(schedules.map((s) => s.subjectId)).size
  const uniqueKelas = new Set(schedules.map((s) => s.classroomId)).size
  const maxDayCount = Math.max(...days.map((d) => countByDay.get(d) ?? 0), 1)

  const filteredUniqueMapel = new Set(filtered.map((s) => s.subjectId)).size
  const filteredUniqueKelas = new Set(filtered.map((s) => s.classroomId)).size

  function handleDayChange(d: string) {
    setDay(d)
    setPage(0)
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="relative border-4 border-foreground bg-primary p-6 text-primary-foreground shadow-[6px_6px_0px_0px_var(--foreground)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 border-2 border-foreground bg-background px-2.5 py-1 text-[11px] font-bold tracking-wider text-foreground uppercase">
              <CalendarDaysIcon className="size-3" />
              Agenda Mingguan
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Jadwal Pelajaran
            </h1>
            <p className="max-w-lg text-sm font-medium text-primary-foreground/85">
              Susun slot per hari — ringkas di desktop, nyaman dibaca di mobile.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 border-2 border-foreground bg-background px-3 py-2 text-foreground">
              <span className="size-3 bg-foreground" aria-hidden />
              <span className="text-[11px] font-bold tracking-wider uppercase">
                Total Slot
              </span>
              <span className="border-2 border-foreground bg-foreground px-2 py-0.5 text-xs font-extrabold tabular-nums text-background">
                {schedules.length}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 border-2 border-foreground bg-background px-3 py-2 text-foreground">
              <TimerIcon className="size-3.5" />
              <span className="text-[11px] font-bold tracking-wider uppercase">
                Hari Aktif
              </span>
              <span className="border-2 border-foreground bg-foreground px-2 py-0.5 text-xs font-extrabold tabular-nums text-background">
                {activeDayCount}/5
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
          <div className="border-2 border-foreground bg-primary p-5 text-primary-foreground shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--foreground)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-wider text-primary-foreground/80 uppercase">
                  Total Slot
                </p>
                <p className="text-5xl font-extrabold tabular-nums leading-none">
                  {schedules.length}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center border-2 border-foreground bg-background text-foreground">
                <LayersIcon className="size-4" />
              </div>
            </div>
            <p className="mt-4 text-xs font-bold tracking-wider text-primary-foreground/80 uppercase">
              {uniqueMapel} mapel &middot; {uniqueKelas} kelas
            </p>
          </div>

          <div className="border-2 border-foreground bg-secondary p-5 text-secondary-foreground shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--foreground)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-wider text-secondary-foreground/80 uppercase">
                  Puncak Hari
                </p>
                <p className="text-5xl font-extrabold leading-none">
                  {labelDay(peakDay)}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center border-2 border-foreground bg-background text-foreground">
                <CalendarDaysIcon className="size-4" />
              </div>
            </div>
            <p className="mt-4 text-xs font-bold tracking-wider uppercase text-secondary-foreground/80">
              <span className="inline-block border-2 border-foreground bg-background px-1.5 py-0.5 font-extrabold tabular-nums text-foreground">
                {peakCount}
              </span>{" "}
              slot di hari ini
            </p>
          </div>

          <div className="border-2 border-foreground bg-accent p-5 text-accent-foreground shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--foreground)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-wider text-accent-foreground/80 uppercase">
                  Mapel Terjadwal
                </p>
                <p className="text-5xl font-extrabold tabular-nums leading-none">
                  {uniqueMapel}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center border-2 border-foreground bg-background text-foreground">
                <BookOpenIcon className="size-4" />
              </div>
            </div>
            <p className="mt-4 text-xs font-bold tracking-wider uppercase text-accent-foreground/80">
              dari {subjects.length} mapel tersedia
            </p>
          </div>

          <div className="border-2 border-foreground bg-card p-5 text-foreground shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--foreground)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Total Jam Ke
                </p>
                <p className="text-5xl font-extrabold tabular-nums leading-none">
                  {totalJam}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center border-2 border-foreground bg-foreground text-background">
                <HashIcon className="size-4" />
              </div>
            </div>
            <p className="mt-4 text-xs font-bold tracking-wider uppercase text-muted-foreground">
              {classrooms.length} kelas siap dipakai
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <div className="border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_var(--foreground)]">
            <div className="flex items-center justify-between border-b-2 border-foreground bg-secondary px-4 py-3 text-secondary-foreground">
              <span className="text-xs font-extrabold tracking-wider uppercase">
                Minggu Ini
              </span>
              <span className="border-2 border-foreground bg-background px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider text-foreground uppercase">
                Pilih Hari
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto p-3 lg:hidden">
              {days.map((d) => {
                const active = day === d
                const count = countByDay.get(d) ?? 0
                const isToday = d === today
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleDayChange(d)}
                    className={cn(
                      "min-w-[72px] shrink-0 cursor-pointer border-2 px-3 py-2 text-center transition-all",
                      active
                        ? "border-foreground bg-foreground text-background shadow-[3px_3px_0px_0px_var(--foreground)]"
                        : "border-foreground bg-background text-foreground hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--foreground)]",
                    )}
                  >
                    <div className="text-[10px] font-bold tracking-wider uppercase">
                      {shortDay(d)}
                    </div>
                    <div className="mt-1 text-lg font-extrabold tabular-nums leading-none">
                      {count}
                    </div>
                    {isToday && (
                      <div
                        className={cn(
                          "mt-1.5 text-[9px] font-bold tracking-wider uppercase",
                          active ? "text-background" : "text-primary",
                        )}
                      >
                        hari ini
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="hidden p-2 lg:block">
              {days.map((d) => {
                const active = day === d
                const count = countByDay.get(d) ?? 0
                const isToday = d === today
                const density = (count / maxDayCount) * 100

                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleDayChange(d)}
                    className={cn(
                      "group mb-2 flex w-full cursor-pointer items-center gap-3 border-2 px-3 py-2.5 text-left transition-all last:mb-0",
                      active
                        ? "border-foreground bg-foreground text-background shadow-[3px_3px_0px_0px_var(--foreground)]"
                        : "border-foreground bg-background text-foreground hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--foreground)]",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold">{labelDay(d)}</span>
                        {isToday && (
                          <span
                            className={cn(
                              "border-2 border-foreground px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase",
                              active
                                ? "bg-background text-foreground"
                                : "bg-primary text-primary-foreground",
                            )}
                          >
                            Hari Ini
                          </span>
                        )}
                      </div>
                      <div
                        className={cn(
                          "mt-2 h-2 border-2 border-foreground",
                          active ? "bg-background" : "bg-muted",
                        )}
                      >
                        <div
                          className={cn(
                            "h-full border-r-2 border-foreground",
                            active ? "bg-primary" : "bg-primary",
                          )}
                          style={{ width: `${density}%` }}
                        />
                      </div>
                    </div>
                    <span
                      className={cn(
                        "border-2 border-foreground px-1.5 py-0.5 text-xs font-extrabold tabular-nums",
                        active
                          ? "bg-background text-foreground"
                          : "bg-foreground text-background",
                      )}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="hidden border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_var(--foreground)] lg:block">
            <div className="border-b-2 border-foreground bg-accent px-4 py-3 text-accent-foreground">
              <span className="text-xs font-extrabold tracking-wider uppercase">
                Ringkasan {labelDay(day)}
              </span>
            </div>
            <div className="space-y-3 p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold tracking-wider text-muted-foreground uppercase">
                  Slot
                </span>
                <span className="border-2 border-foreground bg-foreground px-2 py-0.5 text-xs font-extrabold tabular-nums text-background">
                  {filtered.length}
                </span>
              </div>
              <div className="border-t-2 border-foreground" />
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold tracking-wider text-muted-foreground uppercase">
                  Mapel
                </span>
                <span className="text-sm font-extrabold tabular-nums">
                  {filteredUniqueMapel}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold tracking-wider text-muted-foreground uppercase">
                  Kelas
                </span>
                <span className="text-sm font-extrabold tabular-nums">
                  {filteredUniqueKelas}
                </span>
              </div>
              <div className="border-t-2 border-foreground" />
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold tracking-wider text-muted-foreground uppercase">
                    Mulai
                  </span>
                  <span className="border-2 border-foreground bg-background px-1.5 py-0.5 font-mono text-xs font-extrabold text-foreground">
                    {firstSlot?.startTime ?? "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold tracking-wider text-muted-foreground uppercase">
                    Selesai
                  </span>
                  <span className="border-2 border-foreground bg-background px-1.5 py-0.5 font-mono text-xs font-extrabold text-foreground">
                    {lastSlot?.endTime ?? "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_var(--foreground)]">
            <div className="flex flex-col gap-3 border-b-2 border-foreground px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-extrabold tracking-tight uppercase sm:text-lg">
                    {labelDay(day)}
                  </h2>
                  {day === today && (
                    <span className="border-2 border-foreground bg-primary px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-primary-foreground uppercase">
                      Hari Ini
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                  {filtered.length > 0
                    ? `${filtered.length} slot · ${filteredUniqueMapel} mapel · ${filteredUniqueKelas} kelas`
                    : "Belum ada slot untuk hari ini"}
                </p>
              </div>

              {filtered.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 border-2 border-foreground bg-secondary px-2.5 py-1.5 text-secondary-foreground">
                    <ClockIcon className="size-3.5" />
                    <span className="font-mono text-xs font-extrabold tabular-nums">
                      {firstSlot?.startTime ?? "—"}
                    </span>
                    <span>→</span>
                    <span className="font-mono text-xs font-extrabold tabular-nums">
                      {lastSlot?.endTime ?? "—"}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {paginated.length > 0 ? (
              <div className="relative">
                <div className="pointer-events-none absolute top-6 bottom-6 left-[2.4rem] hidden w-0.5 bg-foreground/80 sm:block" />

                <div>
                  {paginated.map((item, index) => {
                    const subject = subjectById.get(item.subjectId)
                    const classroom = classroomById.get(item.classroomId)
                    const absoluteIndex = startIdx + index + 1
                    const isLast = index === paginated.length - 1

                    return (
                      <article
                        key={item.id}
                        className={cn(
                          "group relative grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:gap-4 sm:px-5 sm:py-5",
                          !isLast && "border-b-2 border-foreground",
                        )}
                      >
                        <div className="relative flex items-center gap-3 sm:flex-col sm:items-stretch sm:gap-2 sm:pt-0.5">
                          <div className="relative z-10 flex size-9 shrink-0 items-center justify-center border-2 border-foreground bg-primary text-xs font-extrabold tabular-nums text-primary-foreground shadow-[2px_2px_0px_0px_var(--foreground)]">
                            {item.jamKe}
                          </div>

                          <div className="min-w-0 flex-1 sm:flex-none">
                            <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                              Jam ke-{item.jamKe}
                            </p>
                            <p className="mt-0.5 text-sm font-extrabold tabular-nums tracking-tight text-foreground">
                              {item.startTime}
                              <span className="mx-1.5 font-bold text-muted-foreground/70">
                                –
                              </span>
                              <span className="text-muted-foreground">
                                {item.endTime}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="min-w-0 border-2 border-foreground bg-background p-3.5 shadow-[3px_3px_0px_0px_var(--foreground)] transition-all group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[5px_5px_0px_0px_var(--foreground)] sm:p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="truncate text-sm font-extrabold tracking-tight sm:text-[15px]">
                                  {subject?.name ?? "Mapel tidak ditemukan"}
                                </h3>
                                {subject?.kode && (
                                  <span className="border-2 border-foreground bg-secondary px-1.5 py-0.5 font-mono text-[10px] font-extrabold tracking-wider text-secondary-foreground uppercase">
                                    {subject.kode}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5">
                                  <GraduationCapIcon className="size-3.5 shrink-0" />
                                  <span className="font-extrabold text-foreground/90">
                                    {classroom?.name ?? "—"}
                                  </span>
                                </span>
                                <span className="text-foreground">·</span>
                                <span className="inline-flex items-center gap-1.5">
                                  <ClockIcon className="size-3.5 shrink-0" />
                                  <span className="tabular-nums">
                                    {formatRange(item.startTime, item.endTime)}
                                  </span>
                                </span>
                                <span className="hidden text-foreground sm:inline">·</span>
                                <span className="hidden border-2 border-foreground bg-background px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider text-foreground tabular-nums uppercase sm:inline">
                                  Slot #{absoluteIndex}
                                </span>
                              </div>
                            </div>

                            <div className="sm:hidden">
                              <ScheduleActions
                                item={item}
                                subjects={subjectsAsOptions}
                                classrooms={classrooms}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="hidden items-center sm:flex">
                          <div className="opacity-70 transition-opacity group-hover:opacity-100">
                            <ScheduleActions
                              item={item}
                              subjects={subjectsAsOptions}
                              classrooms={classrooms}
                            />
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
                <div className="flex size-14 items-center justify-center border-2 border-foreground bg-muted shadow-[3px_3px_0px_0px_var(--foreground)]">
                  <BookOpenIcon className="size-6 text-muted-foreground" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-extrabold tracking-wider text-foreground uppercase">
                    Agenda {labelDay(day)} masih kosong
                  </p>
                  <p className="mx-auto max-w-sm text-xs font-medium text-muted-foreground sm:text-sm">
                    Tambahkan slot pertama untuk hari ini. Setelah terisi, jadwal
                    akan tampil sebagai timeline per jam.
                  </p>
                </div>
                <ScheduleCreateDialog
                  subjects={subjectsAsOptions}
                  classrooms={classrooms}
                  triggerClassName="gap-1.5 text-xs font-extrabold tracking-wider uppercase sm:text-sm"
                />
              </div>
            )}

            {totalPages > 1 && (
              <div className="border-t-2 border-foreground px-4 py-3 sm:px-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-center text-[11px] font-bold tracking-wider text-muted-foreground uppercase sm:text-left sm:text-xs">
                    Menampilkan {startIdx + 1}–
                    {Math.min(startIdx + PAGE_SIZE, filtered.length)} dari{" "}
                    {filtered.length} slot
                  </p>
                  <nav className="flex items-center gap-1.5" aria-label="pagination">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={safePage === 0}
                      onClick={() => setPage((p) => Math.max(p - 1, 0))}
                      className="size-8 border-2"
                      aria-label="Halaman sebelumnya"
                    >
                      <ArrowLeftIcon className="size-3.5" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === totalPages ||
                          Math.abs(p - (safePage + 1)) <= 1,
                      )
                      .map((p, idx, arr) => (
                        <span key={p} className="flex items-center">
                          {idx > 0 && arr[idx - 1] !== p - 1 && (
                            <span className="px-1 text-xs font-bold text-foreground">
                              …
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setPage(p - 1)}
                            aria-current={p === safePage + 1 ? "page" : undefined}
                            className={cn(
                              "inline-flex size-8 items-center justify-center border-2 border-foreground text-xs font-extrabold tabular-nums transition-all",
                              p === safePage + 1
                                ? "bg-foreground text-background shadow-[2px_2px_0px_0px_var(--foreground)]"
                                : "bg-background text-foreground hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--foreground)]",
                            )}
                          >
                            {p}
                          </button>
                        </span>
                      ))}
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={safePage === totalPages - 1}
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                      className="size-8 border-2"
                      aria-label="Halaman berikutnya"
                    >
                      <ArrowRightIcon className="size-3.5" />
                    </Button>
                  </nav>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="inline-flex items-center gap-1.5 border-2 border-foreground bg-muted px-3 py-2 text-xs font-bold tracking-wider text-foreground uppercase">
              <PlusIcon className="size-3.5" />
              Tip: urutan otomatis mengikuti jam ke &amp; waktu mulai.
            </p>
            <p className="border-2 border-foreground bg-foreground px-3 py-2 text-xs font-bold tracking-wider text-background uppercase tabular-nums">
              {subjects.length} mapel &middot; {classrooms.length} kelas siap dipakai
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}