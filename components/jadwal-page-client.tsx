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
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
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
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Jadwal Pelajaran"
        description="Susun slot per hari. Ringkas di desktop, nyaman dibaca di mobile."
        actions={
          <ScheduleCreateDialog
            subjects={subjectsAsOptions}
            classrooms={classrooms}
          />
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total slot"
          value={schedules.length}
          hint={`${uniqueMapel} mapel · ${uniqueKelas} kelas`}
          icon={LayersIcon}
          emphasis
        />
        <StatCard
          label="Puncak hari"
          value={labelDay(peakDay)}
          hint={`${peakCount} slot`}
          icon={CalendarDaysIcon}
        />
        <StatCard
          label="Mapel terjadwal"
          value={uniqueMapel}
          hint={`dari ${subjects.length} mapel tersedia`}
          icon={BookOpenIcon}
        />
        <StatCard
          label="Total jam ke"
          value={totalJam}
          hint={`${activeDayCount}/5 hari aktif`}
          icon={HashIcon}
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-3 lg:sticky lg:top-20 lg:self-start">
          <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
            <div className="flex items-center justify-between border-b px-3 py-2.5">
              <span className="text-xs font-medium text-foreground">Minggu ini</span>
              <span className="text-[11px] text-muted-foreground">Pilih hari</span>
            </div>

            {/* Mobile: horizontal picker */}
            <div className="flex gap-2 overflow-x-auto p-2 lg:hidden">
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
                      "min-w-[64px] shrink-0 cursor-pointer rounded-lg px-3 py-2 text-center transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/60 text-foreground hover:bg-muted"
                    )}
                  >
                    <div className="text-[10px] tracking-wide uppercase opacity-80">
                      {shortDay(d)}
                    </div>
                    <div className="mt-0.5 text-base font-medium tabular-nums">
                      {count}
                    </div>
                    {isToday && (
                      <div className="mt-0.5 text-[9px] tracking-wide uppercase opacity-70">
                        hari ini
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Desktop: vertical list with density */}
            <div className="hidden p-1.5 lg:block">
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
                      "group flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                      active ? "bg-muted" : "hover:bg-muted/60"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "text-sm",
                            active ? "font-medium text-foreground" : "text-foreground"
                          )}
                        >
                          {labelDay(d)}
                        </span>
                        {isToday && (
                          <span className="rounded bg-primary/10 px-1 py-0.5 text-[9px] font-medium tracking-wide text-primary uppercase">
                            Hari ini
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary/70"
                          style={{ width: `${density}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="hidden overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 lg:block">
            <div className="border-b px-3 py-2.5">
              <span className="text-xs font-medium text-foreground">
                Ringkasan {labelDay(day)}
              </span>
            </div>
            <dl className="divide-y text-sm">
              {[
                { label: "Slot", value: filtered.length },
                { label: "Mapel", value: filteredUniqueMapel },
                { label: "Kelas", value: filteredUniqueKelas },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-3 px-3 py-2"
                >
                  <dt className="text-xs text-muted-foreground">{row.label}</dt>
                  <dd className="text-xs tabular-nums text-foreground">{row.value}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 px-3 py-2">
                <dt className="text-xs text-muted-foreground">Mulai</dt>
                <dd className="text-xs tabular-nums text-foreground">
                  {firstSlot?.startTime ?? "–"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 px-3 py-2">
                <dt className="text-xs text-muted-foreground">Selesai</dt>
                <dd className="text-xs tabular-nums text-foreground">
                  {lastSlot?.endTime ?? "–"}
                </dd>
              </div>
            </dl>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
            <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-medium text-foreground">{labelDay(day)}</h2>
                  {day === today && (
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-primary uppercase">
                      Hari ini
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {filtered.length > 0
                    ? `${filtered.length} slot · ${filteredUniqueMapel} mapel · ${filteredUniqueKelas} kelas`
                    : "Belum ada slot untuk hari ini"}
                </p>
              </div>

              {filtered.length > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ClockIcon className="size-3.5" />
                  <span className="tabular-nums">{firstSlot?.startTime ?? "–"}</span>
                  <span>→</span>
                  <span className="tabular-nums">{lastSlot?.endTime ?? "–"}</span>
                </span>
              )}
            </div>

            {paginated.length > 0 ? (
              <div>
                {paginated.map((item, index) => {
                  const subject = subjectById.get(item.subjectId)
                  const classroom = classroomById.get(item.classroomId)
                  const absoluteIndex = startIdx + index + 1

                  return (
                    <article
                      key={item.id}
                      className="group grid grid-cols-1 gap-3 border-b px-4 py-3 last:border-b-0 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-center sm:gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-medium tabular-nums text-foreground">
                          {item.jamKe}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[11px] text-muted-foreground">
                            Jam ke-{item.jamKe}
                          </p>
                          <p className="text-xs tabular-nums text-foreground">
                            {item.startTime}
                            <span className="mx-1 text-muted-foreground">–</span>
                            <span className="text-muted-foreground">{item.endTime}</span>
                          </p>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-medium text-foreground">
                            {subject?.name ?? "Mapel tidak ditemukan"}
                          </h3>
                          {subject?.kode && (
                            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                              {subject.kode}
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <GraduationCapIcon className="size-3.5 shrink-0" />
                            <span className="text-foreground/80">
                              {classroom?.name ?? "–"}
                            </span>
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <ClockIcon className="size-3.5 shrink-0" />
                            <span className="tabular-nums">
                              {formatRange(item.startTime, item.endTime)}
                            </span>
                          </span>
                          <span className="hidden text-[11px] sm:inline">
                            Slot #{absoluteIndex}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center sm:justify-end">
                        <ScheduleActions
                          item={item}
                          subjects={subjectsAsOptions}
                          classrooms={classrooms}
                        />
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
                  <BookOpenIcon className="size-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
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
                />
              </div>
            )}

            {totalPages > 1 && (
              <div className="border-t px-4 py-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-center text-xs text-muted-foreground sm:text-left">
                    Menampilkan {startIdx + 1}–
                    {Math.min(startIdx + PAGE_SIZE, filtered.length)} dari{" "}
                    {filtered.length} slot
                  </p>
                  <nav className="flex items-center justify-center gap-1" aria-label="pagination">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      disabled={safePage === 0}
                      onClick={() => setPage((p) => Math.max(p - 1, 0))}
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
                            <span className="px-1 text-xs text-muted-foreground">…</span>
                          )}
                          <button
                            type="button"
                            onClick={() => setPage(p - 1)}
                            aria-current={p === safePage + 1 ? "page" : undefined}
                            className={cn(
                              "inline-flex size-7 items-center justify-center rounded-md border text-xs tabular-nums transition-colors",
                              p === safePage + 1
                                ? "border-primary bg-primary text-primary-foreground"
                                : "text-foreground hover:bg-muted"
                            )}
                          >
                            {p}
                          </button>
                        </span>
                      ))}
                    <Button
                      variant="outline"
                      size="icon-sm"
                      disabled={safePage === totalPages - 1}
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                      aria-label="Halaman berikutnya"
                    >
                      <ArrowRightIcon className="size-3.5" />
                    </Button>
                  </nav>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p className="inline-flex items-center gap-1.5">
              <PlusIcon className="size-3.5" />
              Urutan otomatis mengikuti jam ke &amp; waktu mulai.
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
