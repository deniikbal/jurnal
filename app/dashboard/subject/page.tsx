import type { Metadata } from "next"
import { BookOpenIcon, TableIcon, ToggleLeftIcon, ToggleRightIcon } from "lucide-react"

import { SubjectActions } from "@/components/subject-actions"
import { SubjectCreateDialog } from "@/components/subject-create-dialog"
import { SubjectFilter } from "@/components/subject-filter"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getSubjectsForCurrentUser } from "@/lib/dal"

export const metadata: Metadata = {
  title: "Mata Pelajaran",
}

type SubjectPageProps = {
  searchParams: Promise<{
    q?: string
    filter?: string
    status?: string
    page?: string
  }>
}

const PAGE_SIZE = 10

const naturalCollator = new Intl.Collator("id-ID", {
  numeric: true,
  sensitivity: "base",
})

function createPageHref(params: {
  q: string
  filter: string
  status: string
  page: number
}) {
  const searchParams = new URLSearchParams()

  if (params.q) searchParams.set("q", params.q)
  if (params.filter !== "natural") searchParams.set("filter", params.filter)
  if (params.status !== "all") searchParams.set("status", params.status)
  if (params.page > 1) searchParams.set("page", String(params.page))

  const query = searchParams.toString()
  return query ? `/dashboard/subject?${query}` : "/dashboard/subject"
}

export default async function SubjectPage({ searchParams }: SubjectPageProps) {
  const params = await searchParams
  const q = params.q?.trim() ?? ""
  const filter = params.filter ?? "natural"
  const status = params.status ?? "all"
  const currentPage = Math.max(Number(params.page ?? "1") || 1, 1)

  const subjects = await getSubjectsForCurrentUser()
  const totalSubjects = subjects.length
  const totalAktif = subjects.filter((item) => item.status === "aktif").length
  const totalNonaktif = subjects.filter((item) => item.status === "nonaktif").length

  const filteredSubjects = subjects
    .filter((item) => {
      const query = q.toLowerCase()
      const matchSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.kode.toLowerCase().includes(query)
      const matchStatus = status === "all" || item.status === status

      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      if (filter === "terlama") return a.createdAt.getTime() - b.createdAt.getTime()
      if (filter === "terbaru") return b.createdAt.getTime() - a.createdAt.getTime()
      if (filter === "za") return naturalCollator.compare(b.name, a.name)
      return naturalCollator.compare(a.name, b.name)
    })

  const totalFiltered = filteredSubjects.length
  const totalPages = Math.max(Math.ceil(totalFiltered / PAGE_SIZE), 1)
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const paginatedSubjects = filteredSubjects.slice(startIndex, startIndex + PAGE_SIZE)

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* ===== Page Header ===== */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-700 via-blue-700/90 to-blue-600/80 p-4 sm:p-5 shadow-lg shadow-blue-700/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative flex items-center gap-3 sm:gap-4">
          <div className="flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-2 ring-white/20">
            <BookOpenIcon className="size-5 sm:size-6 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-white">Mata Pelajaran</h1>
            <p className="text-xs sm:text-sm text-white/70">
              Kelola data mata pelajaran, kode, dan status aktif/nonaktif.
            </p>
          </div>
        </div>
      </div>

      {/* ===== Stat Cards ===== */}
      <section className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { key: "total", icon: BookOpenIcon, label: "Total Mapel", value: totalSubjects },
          { key: "tampil", icon: TableIcon, label: "Ditampilkan", value: totalFiltered },
          { key: "aktif", icon: ToggleRightIcon, label: "Aktif", value: totalAktif },
          { key: "nonaktif", icon: ToggleLeftIcon, label: "Nonaktif", value: totalNonaktif },
        ].map((s) => {
          const gradients: Record<string, { gradient: string; iconBg: string; ring: string }> = {
            total: {
              gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
              iconBg: "bg-blue-500/15 text-blue-600",
              ring: "ring-blue-500/20",
            },
            tampil: {
              gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
              iconBg: "bg-blue-500/15 text-blue-500",
              ring: "ring-blue-500/20",
            },
            aktif: {
              gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
              iconBg: "bg-emerald-500/15 text-emerald-500",
              ring: "ring-emerald-500/20",
            },
            nonaktif: {
              gradient: "from-red-500/10 via-red-500/5 to-transparent",
              iconBg: "bg-red-500/15 text-red-500",
              ring: "ring-red-500/20",
            },
          }
          const c = gradients[s.key]
          return (
            <div
              key={s.key}
              className={`group relative overflow-hidden rounded-xl p-3 sm:p-4 ring-1 ${c.gradient} ${c.ring} shadow-xs transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <p className="text-[10px] sm:text-xs font-medium tracking-wide text-muted-foreground/80 uppercase">{s.label}</p>
                  <p className="text-xl sm:text-2xl font-bold tabular-nums tracking-tight">{s.value}</p>
                </div>
                <div className={`flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-lg ${c.iconBg}`}>
                  <s.icon className="size-3.5 sm:size-4" />
                </div>
              </div>
              <div className="mt-2.5 sm:mt-3 h-1 w-full overflow-hidden rounded-full bg-muted/50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary/40 to-primary/60 transition-all duration-500"
                  style={{ width: `${Math.min((Number(s.value) / Math.max(totalSubjects, 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </section>

      {/* ===== Data Table ===== */}
      <Card>
        <CardHeader className="gap-3 sm:gap-4 p-4 sm:p-6 pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                <BookOpenIcon className="size-4 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Daftar Mata Pelajaran</CardTitle>
                <p className="text-xs text-muted-foreground">Cari, urutkan, dan lihat data mata pelajaran</p>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <SubjectCreateDialog />
            </div>
          </div>
          <SubjectFilter q={q} filter={filter} status={status} />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-16 text-xs font-semibold text-muted-foreground">No</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Nama Mata Pelajaran</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Kode</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
                  <TableHead className="w-40 text-right text-xs font-semibold text-muted-foreground">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSubjects.length > 0 ? (
                  paginatedSubjects.map((item, index) => (
                    <TableRow key={item.id} className="group transition-colors hover:bg-muted/40">
                      <TableCell className="text-xs text-muted-foreground">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-7 items-center justify-center rounded-md bg-blue-500/10 text-[10px] font-semibold text-blue-600">
                            {item.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{item.kode}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            item.status === "aktif"
                              ? "border-emerald-500/20 bg-emerald-500/10 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"
                              : "border-red-500/20 bg-red-500/10 text-[10px] font-medium text-red-600 dark:text-red-400"
                          }
                        >
                          <span className={`mr-1 inline-block size-1.5 rounded-full ${item.status === "aktif" ? "bg-emerald-500" : "bg-red-500"}`} />
                          {item.status === "aktif" ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <SubjectActions subject={item} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <BookOpenIcon className="size-8 text-muted-foreground/40" />
                        <p className="text-xs">Tidak ada data mata pelajaran yang cocok.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card List View */}
          <div className="block sm:hidden space-y-3">
            {paginatedSubjects.length > 0 ? (
              paginatedSubjects.map((item, index) => (
                <div key={item.id} className="rounded-xl border bg-card p-3.5 shadow-2xs space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-bold text-blue-600">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold">{item.name}</h3>
                          <span className="text-[10px] text-muted-foreground font-medium">#{startIndex + index + 1}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Kode: <span className="font-mono text-foreground font-semibold">{item.kode}</span>
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        item.status === "aktif"
                          ? "border-emerald-500/20 bg-emerald-500/10 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 shrink-0"
                          : "border-red-500/20 bg-red-500/10 text-[10px] font-medium text-red-600 dark:text-red-400 shrink-0"
                      }
                    >
                      <span className={`mr-1 inline-block size-1.5 rounded-full ${item.status === "aktif" ? "bg-emerald-500" : "bg-red-500"}`} />
                      {item.status === "aktif" ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-end pt-2 border-t border-border/40 text-xs">
                    <SubjectActions subject={item} />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-xl border py-12 text-center p-4">
                <BookOpenIcon className="size-8 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">Tidak ada data mata pelajaran yang cocok.</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              Menampilkan {paginatedSubjects.length ? startIndex + 1 : 0}-
              {Math.min(startIndex + paginatedSubjects.length, totalFiltered)} dari {totalFiltered} data
            </p>
            <Pagination className="justify-center sm:justify-end sm:mx-0 sm:w-auto">
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    text="Sebelumnya"
                    href={createPageHref({ q, filter, status, page: Math.max(safePage - 1, 1) })}
                    aria-disabled={safePage === 1}
                    className={safePage === 1 ? "pointer-events-none opacity-50 text-xs" : "text-xs"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .filter((page) =>
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - safePage) <= 1
                  )
                  .map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href={createPageHref({ q, filter, status, page })}
                        isActive={page === safePage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                <PaginationItem>
                  <PaginationNext
                    text="Berikutnya"
                    href={createPageHref({ q, filter, status, page: Math.min(safePage + 1, totalPages) })}
                    aria-disabled={safePage === totalPages}
                    className={safePage === totalPages ? "pointer-events-none opacity-50 text-xs" : "text-xs"}
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
