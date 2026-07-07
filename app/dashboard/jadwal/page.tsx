import type { Metadata } from "next"
import Link from "next/link"
import {
  BookOpenIcon,
  CalendarDaysIcon,
  ClockIcon,
  GraduationCapIcon,
  SchoolIcon,
  TableIcon,
} from "lucide-react"

import { ScheduleActions } from "@/components/schedule-actions"
import { ScheduleCreateDialog } from "@/components/schedule-create-dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { getKelasForCurrentUser, getSchedulesForCurrentUser, getSubjectsForCurrentUser } from "@/lib/dal"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Jadwal" }

type Props = {
  searchParams: Promise<{
    day?: string
    page?: string
  }>
}

const PAGE_SIZE = 10
const days = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"]
const dayOrder = days

function labelDay(day: string) {
  return day[0].toUpperCase() + day.slice(1)
}

function createHref(params: {
  day: string
  page?: number
}) {
  const searchParams = new URLSearchParams()

  if (params.day !== "all") searchParams.set("day", params.day)
  if (params.page && params.page > 1) searchParams.set("page", String(params.page))

  const query = searchParams.toString()
  return query ? `/dashboard/jadwal?${query}` : "/dashboard/jadwal"
}

export default async function JadwalPage({ searchParams }: Props) {
  const params = await searchParams
  const day = params.day ?? "senin"
  const currentPage = Math.max(Number(params.page ?? "1") || 1, 1)

  const [schedules, subjects, classrooms] = await Promise.all([
    getSchedulesForCurrentUser(),
    getSubjectsForCurrentUser(),
    getKelasForCurrentUser(),
  ])
  const subjectById = new Map(subjects.map((item) => [item.id, item]))
  const classroomById = new Map(classrooms.map((item) => [item.id, item]))
  const scheduleCountByDay = new Map<string, number>()

  for (const item of schedules) {
    scheduleCountByDay.set(item.day, (scheduleCountByDay.get(item.day) ?? 0) + 1)
  }

  const filteredSchedules = schedules
    .filter((item) => day === "all" || item.day === day)
    .sort(
      (a, b) =>
        dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day) ||
        a.jamKe - b.jamKe ||
        a.startTime.localeCompare(b.startTime),
    )

  const totalPages = Math.max(Math.ceil(filteredSchedules.length / PAGE_SIZE), 1)
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const paginatedSchedules = filteredSchedules.slice(startIndex, startIndex + PAGE_SIZE)

  const statMax = Math.max(schedules.length, 1)

  return (
    <div className="flex flex-col gap-5">
      {/* ===== Page Header ===== */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-600 via-cyan-600/90 to-cyan-500/80 p-5 shadow-lg shadow-cyan-500/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-white/15 ring-2 ring-white/20">
            <CalendarDaysIcon className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Jadwal</h1>
            <p className="text-sm text-white/70">Kelola jadwal pelajaran berdasarkan hari, jam, mapel, dan kelas.</p>
          </div>
        </div>
      </div>

      {/* ===== Stat Cards ===== */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { key: "total", icon: CalendarDaysIcon, label: "Total Jadwal", value: schedules.length },
          { key: "tampil", icon: TableIcon, label: "Ditampilkan", value: filteredSchedules.length },
          { key: "mapel", icon: BookOpenIcon, label: "Total Mapel", value: subjects.length },
          { key: "kelas", icon: SchoolIcon, label: "Total Kelas", value: classrooms.length },
        ].map((s) => {
          const gradients: Record<string, { gradient: string; iconBg: string; ring: string }> = {
            total: { gradient: "from-cyan-500/10 via-cyan-500/5 to-transparent", iconBg: "bg-cyan-500/15 text-cyan-500", ring: "ring-cyan-500/20" },
            tampil: { gradient: "from-blue-500/10 via-blue-500/5 to-transparent", iconBg: "bg-blue-500/15 text-blue-500", ring: "ring-blue-500/20" },
            mapel: { gradient: "from-purple-500/10 via-purple-500/5 to-transparent", iconBg: "bg-purple-500/15 text-purple-500", ring: "ring-purple-500/20" },
            kelas: { gradient: "from-amber-500/10 via-amber-500/5 to-transparent", iconBg: "bg-amber-500/15 text-amber-500", ring: "ring-amber-500/20" },
          }
          const c = gradients[s.key]
          return (
            <div key={s.key} className={`group relative overflow-hidden rounded-xl p-4 ring-1 ${c.gradient} ${c.ring} shadow-sm transition-all duration-200 hover:shadow-md`}>
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground/80 uppercase">{s.label}</p>
                  <p className="text-2xl font-bold tabular-nums tracking-tight">{s.value}</p>
                </div>
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${c.iconBg}`}>
                  <s.icon className="size-4" />
                </div>
              </div>
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted/50">
                <div className="h-full rounded-full bg-gradient-to-r from-primary/40 to-primary/60 transition-all duration-500" style={{ width: `${Math.min((Number(s.value) / statMax) * 100, 100)}%` }} />
              </div>
            </div>
          )
        })}
      </section>

      {/* ===== Data Table ===== */}
      <Card>
        <CardHeader className="gap-4 pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-500/10">
                <CalendarDaysIcon className="size-4 text-cyan-500" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Daftar Jadwal</CardTitle>
                <p className="text-xs text-muted-foreground">Tampilan jadwal per hari dengan timeline jam pelajaran</p>
              </div>
            </div>
            <ScheduleCreateDialog subjects={subjects} classrooms={classrooms} />
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Day tabs */}
          <div className="flex flex-wrap gap-1.5">
            {days.map((item) => {
              const isActive = day === item
              return (
                <Link
                  key={item}
                  href={createHref({ day: item })}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {labelDay(item)}
                  <span className={`inline-flex size-4 items-center justify-center rounded-full text-[10px] font-semibold ${
                    isActive ? "bg-white/20 text-white" : "bg-muted-foreground/10 text-muted-foreground"
                  }`}>
                    {scheduleCountByDay.get(item) ?? 0}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Schedule cards */}
          <div className="space-y-4">
            {paginatedSchedules.length > 0 ? (
              paginatedSchedules.map((item) => {
                const subject = subjectById.get(item.subjectId)
                const classroom = classroomById.get(item.classroomId)

                return (
                  <div key={item.id} className="grid gap-3 md:grid-cols-[80px_1fr]">
                    <div className="flex md:flex-col md:items-center">
                      <div className="min-w-20 rounded-lg border bg-card px-3 py-2 text-center text-sm font-bold text-primary shadow-xs">
                        {item.startTime}
                      </div>
                      <div className="hidden h-8 w-px bg-border md:block" />
                      <div className="hidden text-[10px] text-muted-foreground md:block">
                        {item.endTime}
                      </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30">
                      <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-gradient-to-b from-primary to-primary/60" />
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2 pl-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold">{subject?.name ?? "Mapel tidak ditemukan"}</h3>
                            <Badge variant="secondary" className="border-primary/20 bg-primary/10 text-[10px] font-medium text-primary">
                              Jam {item.jamKe}
                            </Badge>
                            {subject?.kode ? (
                              <Badge variant="outline" className="text-[10px]">{subject.kode}</Badge>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <GraduationCapIcon className="size-3.5" />
                              {classroom?.name ?? "Kelas tidak ditemukan"}
                            </span>
                            <span className="inline-flex items-center gap-1 font-mono text-primary">
                              <ClockIcon className="size-3.5" />
                              {item.startTime} — {item.endTime}
                            </span>
                          </div>
                        </div>
                        <ScheduleActions item={item} subjects={subjects} classrooms={classrooms} />
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-xl border py-12">
                <CalendarDaysIcon className="size-8 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">Tidak ada jadwal yang cocok.</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Menampilkan {paginatedSchedules.length ? startIndex + 1 : 0}-
              {Math.min(startIndex + paginatedSchedules.length, filteredSchedules.length)} dari {filteredSchedules.length} data
            </p>
            <Pagination className="sm:mx-0 sm:w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    text="Sebelumnya"
                    href={createHref({ day, page: Math.max(safePage - 1, 1) })}
                    aria-disabled={safePage === 1}
                    className={safePage === 1 ? "pointer-events-none opacity-50" : undefined}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .filter((page) => page === 1 || page === totalPages || Math.abs(page - safePage) <= 1)
                  .map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink href={createHref({ day, page })} isActive={page === safePage}>{page}</PaginationLink>
                    </PaginationItem>
                  ))}
                <PaginationItem>
                  <PaginationNext
                    text="Berikutnya"
                    href={createHref({ day, page: Math.min(safePage + 1, totalPages) })}
                    aria-disabled={safePage === totalPages}
                    className={safePage === totalPages ? "pointer-events-none opacity-50" : undefined}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
