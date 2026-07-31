"use client"

import { useMemo, useState } from "react"
import {
  BookOpenIcon,
  CalendarDaysIcon,
  ClockIcon,
  GraduationCapIcon,
  PlusIcon,
} from "lucide-react"

import { ScheduleActions } from "@/components/schedule-actions"
import { ScheduleCreateDialog } from "@/components/schedule-create-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 12
const days = ["senin", "selasa", "rabu", "kamis", "jumat"] as const
const weekdayNames = [
  "minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu",
] as const

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
  const maxDayCount = Math.max(...days.map((d) => countByDay.get(d) ?? 0), 1)
  const uniqueMapel = new Set(filtered.map((s) => s.subjectId)).size
  const uniqueKelas = new Set(filtered.map((s) => s.classroomId)).size

  function handleDayChange(d: string) {
    setDay(d)
    setPage(0)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <CalendarDaysIcon className="size-3.5" />
            Agenda mengajar
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Jadwal Pelajaran
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Susun slot per hari dengan alur seperti agenda — ringkas di desktop,
            nyaman dibaca di mobile.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-sm border bg-muted/40 px-2 py-1 font-medium text-foreground">
              {schedules.length} total slot
            </span>
            <span className="rounded-sm border px-2 py-1">
              Puncak: {labelDay(peakDay)}
            </span>
          </div>
          <ScheduleCreateDialog
            subjects={subjectsAsOptions}
            classrooms={classrooms}
            triggerClassName="w-full sm:w-auto gap-1.5 text-xs sm:text-sm"
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-sm border bg-card">
            <div className="border-b px-4 py-3">
              <p className="text-xs font-semibold tracking-wide text-foreground">
                Minggu ini
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Pilih hari untuk melihat agenda
              </p>
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
                      "min-w-[72px] shrink-0 rounded-sm border px-3 py-2.5 text-center transition-colors cursor-pointer",
                      active
                        ? "border-primary/40 bg-primary text-primary-foreground shadow-sm"
                        : "bg-background hover:bg-muted/60"
                    )}
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
                      {shortDay(d)}
                    </div>
                    <div className="mt-1 text-lg font-semibold tabular-nums leading-none">
                      {count}
                    </div>
                    {isToday && (
                      <div
                        className={cn(
                          "mt-1.5 text-[9px] font-medium uppercase tracking-wide",
                          active ? "opacity-90" : "text-primary"
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
                      "group mb-1 flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left transition-colors last:mb-0 cursor-pointer",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted/70"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{labelDay(d)}</span>
                        {isToday && (
                          <span
                            className={cn(
                              "rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
                              active
                                ? "bg-primary-foreground/15 text-primary-foreground"
                                : "bg-primary/10 text-primary"
                            )}
                          >
                            Hari ini
                          </span>
                        )}
                      </div>
                      <div
                        className={cn(
                          "mt-1.5 h-1 overflow-hidden rounded-full",
                          active ? "bg-primary-foreground/20" : "bg-muted"
                        )}
                      >
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            active ? "bg-primary-foreground/80" : "bg-primary/60"
                          )}
                          style={{ width: `${density}%` }}
                        />
                      </div>
                    </div>
                    <span
                      className={cn(
                        "tabular-nums text-sm font-semibold",
                        active ? "text-primary-foreground" : "text-muted-foreground"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="hidden rounded-sm border bg-card p-4 lg:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Ringkasan {labelDay(day)}
            </p>
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">Slot</span>
                <span className="font-semibold tabular-nums">{filtered.length}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">Mapel</span>
                <span className="font-semibold tabular-nums">{uniqueMapel}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">Kelas</span>
                <span className="font-semibold tabular-nums">{uniqueKelas}</span>
              </div>
              <Separator />
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Mulai</span>
                  <span className="font-mono text-xs font-medium">
                    {firstSlot?.startTime ?? "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Selesai</span>
                  <span className="font-mono text-xs font-medium">
                    {lastSlot?.endTime ?? "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="overflow-hidden rounded-sm border bg-card">
            <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold tracking-tight sm:text-lg">
                    {labelDay(day)}
                  </h2>
                  {day === today && (
                    <Badge
                      variant="secondary"
                      className="border-primary/20 bg-primary/10 text-[10px] text-primary"
                    >
                      Hari ini
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {filtered.length > 0
                    ? `${filtered.length} slot · ${uniqueMapel} mapel · ${uniqueKelas} kelas`
                    : "Belum ada slot untuk hari ini"}
                </p>
              </div>

              {filtered.length > 0 && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5">
                    <ClockIcon className="size-3.5" />
                    <span className="font-mono tabular-nums text-foreground">
                      {firstSlot?.startTime ?? "—"}
                    </span>
                    <span>→</span>
                    <span className="font-mono tabular-nums text-foreground">
                      {lastSlot?.endTime ?? "—"}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {paginated.length > 0 ? (
              <div className="relative">
                <div className="pointer-events-none absolute top-6 bottom-6 left-[2.15rem] hidden w-px bg-border/80 sm:block" />

                <div className="divide-y sm:divide-y-0">
                  {paginated.map((item, index) => {
                    const subject = subjectById.get(item.subjectId)
                    const classroom = classroomById.get(item.classroomId)
                    const absoluteIndex = startIdx + index + 1
                    const isLast = index === paginated.length - 1

                    return (
                      <article
                        key={item.id}
                        className={cn(
                          "group relative grid grid-cols-1 gap-3 px-4 py-4 transition-colors hover:bg-muted/25 sm:grid-cols-[7.5rem_minmax(0,1fr)_auto] sm:gap-4 sm:px-5 sm:py-4",
                          !isLast && "sm:pb-5"
                        )}
                      >
                        <div className="relative flex items-center gap-3 sm:flex-col sm:items-stretch sm:gap-2 sm:pt-0.5">
                          <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border bg-card text-xs font-semibold tabular-nums text-foreground shadow-xs">
                            {item.jamKe}
                          </div>

                          <div className="min-w-0 flex-1 rounded-sm border bg-muted/30 px-3 py-2 sm:bg-transparent sm:border-0 sm:px-0 sm:py-0">
                            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                              Jam ke-{item.jamKe}
                            </p>
                            <p className="mt-0.5 text-sm font-semibold tabular-nums tracking-tight text-foreground">
                              {item.startTime}
                              <span className="mx-1.5 font-normal text-muted-foreground/70">
                                –
                              </span>
                              <span className="text-muted-foreground">
                                {item.endTime}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="min-w-0 rounded-sm border bg-background/80 p-3.5 shadow-2xs transition-colors group-hover:border-border group-hover:bg-card sm:p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="truncate text-sm font-semibold tracking-tight sm:text-[15px]">
                                  {subject?.name ?? "Mapel tidak ditemukan"}
                                </h3>
                                {subject?.kode && (
                                  <span className="rounded-sm border bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                                    {subject.kode}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5">
                                  <GraduationCapIcon className="size-3.5 shrink-0" />
                                  <span className="font-medium text-foreground/90">
                                    {classroom?.name ?? "—"}
                                  </span>
                                </span>
                                <span className="text-border">·</span>
                                <span className="inline-flex items-center gap-1.5">
                                  <ClockIcon className="size-3.5 shrink-0" />
                                  <span className="tabular-nums">
                                    {formatRange(item.startTime, item.endTime)}
                                  </span>
                                </span>
                                <span className="hidden text-border sm:inline">·</span>
                                <span className="hidden tabular-nums sm:inline">
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
                          <div className="opacity-60 transition-opacity group-hover:opacity-100">
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
                <div className="flex size-14 items-center justify-center rounded-full border border-dashed bg-muted/30">
                  <BookOpenIcon className="size-6 text-muted-foreground/60" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold">
                    Agenda {labelDay(day)} masih kosong
                  </p>
                  <p className="mx-auto max-w-sm text-xs text-muted-foreground sm:text-sm">
                    Tambahkan slot pertama untuk hari ini. Setelah terisi, jadwal
                    akan tampil sebagai timeline per jam.
                  </p>
                </div>
                <ScheduleCreateDialog
                  subjects={subjectsAsOptions}
                  classrooms={classrooms}
                  triggerClassName="gap-1.5 text-xs sm:text-sm"
                />
              </div>
            )}

            {totalPages > 1 && (
              <div className="border-t px-4 py-3 sm:px-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-center text-[11px] text-muted-foreground sm:text-left sm:text-xs">
                    Menampilkan {startIdx + 1}–
                    {Math.min(startIdx + PAGE_SIZE, filtered.length)} dari{" "}
                    {filtered.length} slot
                  </p>
                  <nav className="flex items-center gap-1" aria-label="pagination">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={safePage === 0}
                      onClick={() => setPage((p) => Math.max(p - 1, 0))}
                      className="text-xs"
                    >
                      Prev
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
                            <span className="px-1 text-xs text-muted-foreground">…</span>
                          )}
                          <Button
                            variant={p === safePage + 1 ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setPage(p - 1)}
                            className="text-xs min-w-[32px]"
                          >
                            {p}
                          </Button>
                        </span>
                      ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={safePage === totalPages - 1}
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                      className="text-xs"
                    >
                      Next
                    </Button>
                  </nav>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p className="inline-flex items-center gap-1.5">
              <PlusIcon className="size-3.5" />
              Tip: urutan otomatis mengikuti jam ke & waktu mulai.
            </p>
            <p className="tabular-nums">
              {subjects.length} mapel · {classrooms.length} kelas siap dipakai
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
