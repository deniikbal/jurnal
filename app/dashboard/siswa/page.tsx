import type { Metadata } from "next"
import {
  GraduationCapIcon,
  LayoutListIcon,
  UserCheckIcon,
  UserXIcon,
} from "lucide-react"

import { SiswaActions } from "@/components/siswa-actions"
import { SiswaCreateDialog } from "@/components/siswa-create-dialog"
import { SiswaImportDialog } from "@/components/siswa-import-dialog"
import { SiswaFilter } from "@/components/siswa-filter"
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
import { getKelasForCurrentUser, getSiswaForCurrentUser } from "@/lib/dal"

export const metadata: Metadata = {
  title: "Siswa",
}

type SiswaPageProps = {
  searchParams: Promise<{
    q?: string
    filter?: string
    classroomId?: string
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
  classroomId: string
  status: string
  page: number
}) {
  const searchParams = new URLSearchParams()

  if (params.q) searchParams.set("q", params.q)
  if (params.filter !== "natural") searchParams.set("filter", params.filter)
  if (params.classroomId !== "all") searchParams.set("classroomId", params.classroomId)
  if (params.status !== "all") searchParams.set("status", params.status)
  if (params.page > 1) searchParams.set("page", String(params.page))

  const query = searchParams.toString()
  return query ? `/dashboard/siswa?${query}` : "/dashboard/siswa"
}

export default async function SiswaPage({ searchParams }: SiswaPageProps) {
  const params = await searchParams
  const q = params.q?.trim() ?? ""
  const filter = params.filter ?? "natural"
  const classroomId = params.classroomId ?? "all"
  const status = params.status ?? "all"
  const currentPage = Math.max(Number(params.page ?? "1") || 1, 1)

  const [daftarSiswa, daftarKelas] = await Promise.all([
    getSiswaForCurrentUser(),
    getKelasForCurrentUser(),
  ])
  const kelasById = new Map(daftarKelas.map((item) => [item.id, item]))
  const totalSiswa = daftarSiswa.length
  const totalAktif = daftarSiswa.filter((item) => item.status === "aktif").length
  const totalKeluar = daftarSiswa.filter((item) => item.status === "keluar").length

  const filteredSiswa = daftarSiswa
    .filter((item) => {
      const query = q.toLowerCase()
      const matchSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.nis?.toLowerCase().includes(query)
      const matchClassroom = classroomId === "all" || item.classroomId === classroomId
      const matchStatus = status === "all" || item.status === status

      return matchSearch && matchClassroom && matchStatus
    })
    .sort((a, b) => {
      if (filter === "terlama") return a.createdAt.getTime() - b.createdAt.getTime()
      if (filter === "terbaru") return b.createdAt.getTime() - a.createdAt.getTime()
      if (filter === "za") return naturalCollator.compare(b.name, a.name)
      return naturalCollator.compare(a.name, b.name)
    })

  const totalFiltered = filteredSiswa.length
  const totalPages = Math.max(Math.ceil(totalFiltered / PAGE_SIZE), 1)
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const paginatedSiswa = filteredSiswa.slice(startIndex, startIndex + PAGE_SIZE)

  return (
    <div className="flex flex-col gap-5">
      {/* ===== Page Header ===== */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-600/90 to-emerald-500/80 p-5 shadow-lg shadow-emerald-500/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-white/15 ring-2 ring-white/20">
            <GraduationCapIcon className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Siswa</h1>
            <p className="text-sm text-white/70">
              Kelola data siswa, kelas, jenis kelamin, dan status aktif/keluar.
            </p>
          </div>
        </div>
      </div>

      {/* ===== Stat Cards ===== */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { key: "total", icon: GraduationCapIcon, label: "Total Siswa", value: totalSiswa },
          { key: "tampil", icon: LayoutListIcon, label: "Ditampilkan", value: totalFiltered },
          { key: "aktif", icon: UserCheckIcon, label: "Aktif", value: totalAktif },
          { key: "keluar", icon: UserXIcon, label: "Keluar", value: totalKeluar },
        ].map((s) => {
          const gradients: Record<string, { gradient: string; iconBg: string; ring: string }> = {
            total: {
              gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
              iconBg: "bg-emerald-500/15 text-emerald-500",
              ring: "ring-emerald-500/20",
            },
            tampil: {
              gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
              iconBg: "bg-blue-500/15 text-blue-500",
              ring: "ring-blue-500/20",
            },
            aktif: {
              gradient: "from-primary/10 via-primary/5 to-transparent",
              iconBg: "bg-primary/15 text-primary",
              ring: "ring-primary/20",
            },
            keluar: {
              gradient: "from-red-500/10 via-red-500/5 to-transparent",
              iconBg: "bg-red-500/15 text-red-500",
              ring: "ring-red-500/20",
            },
          }
          const c = gradients[s.key]
          return (
            <div
              key={s.key}
              className={`group relative overflow-hidden rounded-xl p-4 ring-1 ${c.gradient} ${c.ring} shadow-sm transition-all duration-200 hover:shadow-md`}
            >
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
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary/40 to-primary/60 transition-all duration-500"
                  style={{ width: `${Math.min((Number(s.value) / Math.max(totalSiswa, 1)) * 100, 100)}%` }}
                />
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
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <GraduationCapIcon className="size-4 text-emerald-500" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Daftar Siswa</CardTitle>
                <p className="text-xs text-muted-foreground">Cari, urutkan, dan lihat data siswa</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <SiswaImportDialog />
              <SiswaCreateDialog classrooms={daftarKelas} />
            </div>
          </div>
          <SiswaFilter
            q={q}
            filter={filter}
            classroomId={classroomId}
            status={status}
            classrooms={daftarKelas}
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-16 text-xs font-semibold text-muted-foreground">No</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Nama Siswa</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">NIS</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Kelas</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Jenis Kelamin</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
                  <TableHead className="w-40 text-right text-xs font-semibold text-muted-foreground">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSiswa.length > 0 ? (
                  paginatedSiswa.map((item, index) => (
                    <TableRow key={item.id} className="group transition-colors hover:bg-muted/40">
                      <TableCell className="text-xs text-muted-foreground">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10 text-[10px] font-semibold text-emerald-500">
                            {item.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{item.nis ?? <span className="text-muted-foreground/60">—</span>}</TableCell>
                      <TableCell className="text-xs">{kelasById.get(item.classroomId)?.name ?? <span className="text-muted-foreground/60">—</span>}</TableCell>
                      <TableCell className="text-xs capitalize">{item.jenisKelamin}</TableCell>
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
                          {item.status === "aktif" ? "Aktif" : "Keluar"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <SiswaActions siswa={item} classrooms={daftarKelas} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <GraduationCapIcon className="size-8 text-muted-foreground/40" />
                        <p className="text-xs">Tidak ada data siswa yang cocok.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Menampilkan {paginatedSiswa.length ? startIndex + 1 : 0}-
              {Math.min(startIndex + paginatedSiswa.length, totalFiltered)} dari {totalFiltered} data
            </p>
            <Pagination className="sm:mx-0 sm:w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    text="Sebelumnya"
                    href={createPageHref({ q, filter, classroomId, status, page: Math.max(safePage - 1, 1) })}
                    aria-disabled={safePage === 1}
                    className={safePage === 1 ? "pointer-events-none opacity-50" : undefined}
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
                        href={createPageHref({ q, filter, classroomId, status, page })}
                        isActive={page === safePage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                <PaginationItem>
                  <PaginationNext
                    text="Berikutnya"
                    href={createPageHref({ q, filter, classroomId, status, page: Math.min(safePage + 1, totalPages) })}
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
