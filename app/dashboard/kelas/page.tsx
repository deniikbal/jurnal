import type { Metadata } from "next"
import {
  CalendarDaysIcon,
  GraduationCapIcon,
  SchoolIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react"

import { KelasActions } from "@/components/kelas-actions"
import { KelasCreateDialog } from "@/components/kelas-create-dialog"
import { KelasFilter } from "@/components/kelas-filter"
import { KelasImportDialog } from "@/components/kelas-import-dialog"
import { KelasSiswaDialog } from "@/components/kelas-siswa-dialog"
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
  title: "Kelas",
}

type KelasPageProps = {
  searchParams: Promise<{
    q?: string
    filter?: string
    page?: string
  }>
}

const PAGE_SIZE = 10

const naturalCollator = new Intl.Collator("id-ID", {
  numeric: true,
  sensitivity: "base",
})

function createPageHref(params: { q: string; filter: string; page: number }) {
  const searchParams = new URLSearchParams()

  if (params.q) searchParams.set("q", params.q)
  if (params.filter !== "natural") searchParams.set("filter", params.filter)
  if (params.page > 1) searchParams.set("page", String(params.page))

  const query = searchParams.toString()
  return query ? `/dashboard/kelas?${query}` : "/dashboard/kelas"
}

const statConfig = {
  total: {
    gradient: "from-primary/10 via-primary/5 to-transparent",
    iconBg: "bg-primary/15 text-primary",
    ring: "ring-primary/20",
  },
  siswa: {
    gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
    iconBg: "bg-blue-500/15 text-blue-500",
    ring: "ring-blue-500/20",
  },
  rata: {
    gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
    iconBg: "bg-purple-500/15 text-purple-500",
    ring: "ring-purple-500/20",
  },
  baru: {
    gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
    iconBg: "bg-amber-500/15 text-amber-500",
    ring: "ring-amber-500/20",
  },
}

export default async function KelasPage({ searchParams }: KelasPageProps) {
  const params = await searchParams
  const q = params.q?.trim() ?? ""
  const filter = params.filter ?? "natural"
  const currentPage = Math.max(Number(params.page ?? "1") || 1, 1)

  const [daftarKelas, daftarSiswa] = await Promise.all([
    getKelasForCurrentUser(),
    getSiswaForCurrentUser(),
  ])
  const totalKelas = daftarKelas.length
  const totalSiswa = daftarSiswa.length

  const filteredKelas = daftarKelas
    .filter((item) => item.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => {
      if (filter === "terlama") return a.createdAt.getTime() - b.createdAt.getTime()
      if (filter === "terbaru") return b.createdAt.getTime() - a.createdAt.getTime()
      if (filter === "za") return naturalCollator.compare(b.name, a.name)
      return naturalCollator.compare(a.name, b.name)
    })

  const totalFiltered = filteredKelas.length
  const totalPages = Math.max(Math.ceil(totalFiltered / PAGE_SIZE), 1)
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const paginatedKelas = filteredKelas.slice(startIndex, startIndex + PAGE_SIZE)
  const newestKelas = daftarKelas.toSorted(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  )[0]
  const avgSiswaPerKelas =
    totalKelas > 0 ? Math.round((totalSiswa / totalKelas) * 10) / 10 : 0

  return (
    <div className="flex flex-col gap-5">
      {/* ===== Page Header ===== */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-blue-600/90 to-blue-500/80 p-5 shadow-lg shadow-blue-500/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-white/15 ring-2 ring-white/20">
            <SchoolIcon className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Kelas</h1>
            <p className="text-sm text-white/70">
              Kelola data kelas, wali kelas, dan lihat daftar siswa per kelas.
            </p>
          </div>
        </div>
      </div>

      {/* ===== Stat Cards ===== */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            key: "total",
            icon: SchoolIcon,
            label: "Total Kelas",
            value: totalKelas,
          },
          {
            key: "siswa",
            icon: UsersIcon,
            label: "Total Siswa",
            value: totalSiswa,
          },
          {
            key: "rata",
            icon: GraduationCapIcon,
            label: "Rata-rata Siswa",
            value: totalKelas > 0 ? avgSiswaPerKelas : "-",
          },
          {
            key: "baru",
            icon: SparklesIcon,
            label: "Kelas Terbaru",
            value: newestKelas?.name ?? "—",
            sub: newestKelas
              ? newestKelas.createdAt.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Belum ada kelas",
          },
        ].map((s) => {
          const c = statConfig[s.key as keyof typeof statConfig]
          return (
            <div
              key={s.key}
              className={`group relative overflow-hidden rounded-xl p-4 ring-1 ${c.gradient} ${c.ring} shadow-sm transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground/80 uppercase">
                    {s.label}
                  </p>
                  <p className="text-2xl font-bold tabular-nums tracking-tight truncate max-w-32">
                    {s.value}
                  </p>
                  {"sub" in s && s.sub && (
                    <p className="text-xs text-muted-foreground">{s.sub}</p>
                  )}
                </div>
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${c.iconBg}`}>
                  <s.icon className="size-4" />
                </div>
              </div>
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted/50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary/40 to-primary/60 transition-all duration-500"
                  style={{ width: `${Math.min((Number(s.value) / Math.max(totalKelas, totalSiswa, 1)) * 100, 100)}%` }}
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
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10">
                <SchoolIcon className="size-4 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Daftar Kelas</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Cari, urutkan, dan lihat data kelas
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <KelasImportDialog />
              <KelasCreateDialog />
            </div>
          </div>
          <KelasFilter q={q} filter={filter} />
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-16 text-xs font-semibold text-muted-foreground">No</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Nama Kelas</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Wali Kelas</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Total Siswa</TableHead>
                  <TableHead className="w-40 text-right text-xs font-semibold text-muted-foreground">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedKelas.length > 0 ? (
                  paginatedKelas.map((item, index) => (
                    <TableRow key={item.id} className="group transition-colors hover:bg-muted/40">
                      <TableCell className="text-xs text-muted-foreground">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-[10px] font-semibold text-primary">
                            {item.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {item.waliKelas ? (
                          <span>{item.waliKelas}</span>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="border-emerald-500/20 bg-emerald-500/10 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"
                        >
                          <span className="mr-1 inline-block size-1.5 rounded-full bg-emerald-500" />
                          Aktif
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <KelasSiswaDialog
                          kelasName={item.name}
                          siswa={daftarSiswa.filter(
                            (siswa) => siswa.classroomId === item.id,
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <KelasActions kelas={item} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <SchoolIcon className="size-8 text-muted-foreground/40" />
                        <p className="text-xs">Tidak ada data kelas yang cocok.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Menampilkan {paginatedKelas.length ? startIndex + 1 : 0}-
              {Math.min(startIndex + paginatedKelas.length, totalFiltered)} dari{" "}
              {totalFiltered} data
            </p>
            <Pagination className="sm:mx-0 sm:w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    text="Sebelumnya"
                    href={createPageHref({
                      q,
                      filter,
                      page: Math.max(safePage - 1, 1),
                    })}
                    aria-disabled={safePage === 1}
                    className={
                      safePage === 1
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - safePage) <= 1,
                  )
                  .map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href={createPageHref({ q, filter, page })}
                        isActive={page === safePage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                <PaginationItem>
                  <PaginationNext
                    text="Berikutnya"
                    href={createPageHref({
                      q,
                      filter,
                      page: Math.min(safePage + 1, totalPages),
                    })}
                    aria-disabled={safePage === totalPages}
                    className={
                      safePage === totalPages
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
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
