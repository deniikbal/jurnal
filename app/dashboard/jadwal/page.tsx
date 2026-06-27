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

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Jadwal</h1>
        <p className="text-sm text-muted-foreground">
          Kelola jadwal pelajaran berdasarkan hari, jam, mapel, dan kelas.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Jadwal
            </CardTitle>
            <CalendarDaysIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{schedules.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ditampilkan
            </CardTitle>
            <TableIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{filteredSchedules.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Mapel
            </CardTitle>
            <BookOpenIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{subjects.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Kelas
            </CardTitle>
            <SchoolIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{classrooms.length}</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>Daftar Jadwal</CardTitle>
              <p className="text-sm text-muted-foreground">
                Tampilan jadwal per hari dengan timeline jam pelajaran.
              </p>
            </div>
            <ScheduleCreateDialog subjects={subjects} classrooms={classrooms} />
          </div>

        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-2 md:grid-cols-7">
            {days.map((item) => {
              const isActive = day === item

              return (
                <Link
                  key={item}
                  href={createHref({ day: item })}
                  className={cn(
                    "flex items-center justify-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition-colors hover:text-primary",
                    isActive
                      ? "border-primary text-primary"
                      : "border-border text-foreground",
                  )}
                >
                  {labelDay(item)}
                  <Badge variant={isActive ? "default" : "secondary"}>
                    {scheduleCountByDay.get(item) ?? 0}
                  </Badge>
                </Link>
              )
            })}
          </div>

          <div className="space-y-4">
            {paginatedSchedules.length > 0 ? (
              paginatedSchedules.map((item) => {
                const subject = subjectById.get(item.subjectId)
                const classroom = classroomById.get(item.classroomId)

                return (
                  <div key={item.id} className="grid gap-3 md:grid-cols-[96px_1fr]">
                    <div className="flex md:flex-col md:items-center">
                      <div className="min-w-24 rounded-md border bg-card px-3 py-2 text-center text-sm font-semibold text-primary shadow-sm">
                        {item.startTime}
                      </div>
                      <div className="hidden h-10 w-px bg-border md:block" />
                      <div className="hidden text-xs text-muted-foreground md:block">
                        {item.endTime}
                      </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-lg border bg-card p-4 shadow-sm transition-colors hover:border-primary/40">
                      <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-3 pl-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold tracking-tight">
                              {subject?.name ?? "Mapel tidak ditemukan"}
                            </h3>
                            <Badge>Jam {item.jamKe}</Badge>
                            {subject?.kode ? (
                              <Badge variant="secondary">{subject.kode}</Badge>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              <GraduationCapIcon className="size-4" />
                              {classroom?.name ?? "Kelas tidak ditemukan"}
                            </span>
                            <span className="inline-flex items-center gap-1.5 font-mono text-primary">
                              <ClockIcon className="size-4" />
                              {item.startTime} — {item.endTime}
                            </span>
                          </div>
                        </div>
                        <ScheduleActions
                          item={item}
                          subjects={subjects}
                          classrooms={classrooms}
                        />
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="rounded-lg border py-16 text-center text-sm text-muted-foreground">
                Tidak ada jadwal yang cocok.
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
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
                  .filter(
                    (page) =>
                      page === 1 || page === totalPages || Math.abs(page - safePage) <= 1,
                  )
                  .map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href={createHref({ day, page })}
                        isActive={page === safePage}
                      >
                        {page}
                      </PaginationLink>
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
    </>
  )
}
