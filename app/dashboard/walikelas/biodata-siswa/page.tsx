import type { Metadata } from "next"
import { HomeIcon, TableIcon, UsersIcon } from "lucide-react"

import { BiodataFotoPreview } from "@/components/biodata-foto-preview"
import { BiodataSiswaActions } from "@/components/biodata-siswa-actions"
import { BiodataSiswaCreateDialog } from "@/components/biodata-siswa-create-dialog"
import { BiodataSiswaImportDialog } from "@/components/biodata-siswa-import-dialog"
import { BiodataSiswaFilter } from "@/components/biodata-siswa-filter"
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
import { getBiodataSiswaForCurrentUser, getKelasForCurrentUser } from "@/lib/dal"

export const metadata: Metadata = {
  title: "Biodata Siswa",
}

type BiodataPageProps = {
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

function createPageHref(params: {
  q: string
  filter: string
  page: number
}) {
  const searchParams = new URLSearchParams()

  if (params.q) searchParams.set("q", params.q)
  if (params.filter !== "natural") searchParams.set("filter", params.filter)
  if (params.page > 1) searchParams.set("page", String(params.page))

  const query = searchParams.toString()
  return query ? `/dashboard/walikelas/biodata-siswa?${query}` : "/dashboard/walikelas/biodata-siswa"
}

export default async function BiodataSiswaPage({ searchParams }: BiodataPageProps) {
  const params = await searchParams
  const q = params.q?.trim() ?? ""
  const filter = params.filter ?? "natural"
  const currentPage = Math.max(Number(params.page ?? "1") || 1, 1)

  const [biodataList, kelasList] = await Promise.all([
    getBiodataSiswaForCurrentUser(),
    getKelasForCurrentUser(),
  ])
  const totalData = biodataList.length

  const filteredData = biodataList
    .filter((item) => {
      const query = q.toLowerCase()
      return (
        !query ||
        item.nama.toLowerCase().includes(query) ||
        item.alamat?.toLowerCase().includes(query) ||
        item.namaAyah?.toLowerCase().includes(query) ||
        item.namaIbu?.toLowerCase().includes(query)
      )
    })
    .sort((a, b) => {
      if (filter === "terlama") return a.createdAt.getTime() - b.createdAt.getTime()
      if (filter === "terbaru") return b.createdAt.getTime() - a.createdAt.getTime()
      if (filter === "za") return naturalCollator.compare(b.nama, a.nama)
      return naturalCollator.compare(a.nama, b.nama)
    })

  const totalFiltered = filteredData.length
  const totalPages = Math.max(Math.ceil(totalFiltered / PAGE_SIZE), 1)
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const paginatedData = filteredData.slice(startIndex, startIndex + PAGE_SIZE)

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* ===== Page Header ===== */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-700 via-emerald-700/90 to-emerald-600/80 p-4 sm:p-5 shadow-lg shadow-emerald-700/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative flex items-center gap-3 sm:gap-4">
          <div className="flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-2 ring-white/20">
            <UsersIcon className="size-5 sm:size-6 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-white">Biodata Siswa</h1>
            <p className="text-xs sm:text-sm text-white/70">
              Kelola data biodata siswa, informasi orang tua, dan kondisi keluarga.
            </p>
          </div>
        </div>
      </div>

      {/* ===== Stat Cards ===== */}
      <section className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3">
        {[
          { key: "total", icon: UsersIcon, label: "Total Data", value: totalData },
          { key: "tampil", icon: TableIcon, label: "Ditampilkan", value: totalFiltered },
          { key: "foto", icon: HomeIcon, label: "Dengan Foto Rumah", value: biodataList.filter((item) => item.fotoRumah).length },
        ].map((s) => {
          const gradients: Record<string, { gradient: string; iconBg: string; ring: string }> = {
            total: {
              gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
              iconBg: "bg-emerald-500/15 text-emerald-600",
              ring: "ring-emerald-500/20",
            },
            tampil: {
              gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
              iconBg: "bg-emerald-500/15 text-emerald-500",
              ring: "ring-emerald-500/20",
            },
            foto: {
              gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
              iconBg: "bg-blue-500/15 text-blue-500",
              ring: "ring-blue-500/20",
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
                  style={{ width: `${Math.min((Number(s.value) / Math.max(totalData, 1)) * 100, 100)}%` }}
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
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <UsersIcon className="size-4 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Daftar Biodata Siswa</CardTitle>
                <p className="text-xs text-muted-foreground">Cari, urutkan, dan lihat data biodata siswa</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none"><BiodataSiswaImportDialog kelasList={kelasList} /></div>
              <div className="flex-1 sm:flex-none"><BiodataSiswaCreateDialog /></div>
            </div>
          </div>
          <BiodataSiswaFilter q={q} filter={filter} />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-12 text-xs font-semibold text-muted-foreground">No</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Nama Siswa</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Alamat</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Nama Ayah</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Nama Ibu</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Status Pernikahan</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Kondisi Keluarga</TableHead>
                  <TableHead className="w-14 text-center text-xs font-semibold text-muted-foreground">Foto</TableHead>
                  <TableHead className="w-32 text-right text-xs font-semibold text-muted-foreground">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <TableRow key={item.id} className="group transition-colors hover:bg-muted/40">
                      <TableCell className="text-xs text-muted-foreground">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10 text-[10px] font-semibold text-emerald-600">
                            {item.nama.charAt(0)}
                          </div>
                          <div>
                            <span className="text-sm font-medium">{item.nama}</span>
                            {item.nohpOrtu && (
                              <p className="text-[10px] text-muted-foreground">{item.nohpOrtu}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs" title={item.alamat ?? ""}>
                        {item.alamat ?? "-"}
                      </TableCell>
                      <TableCell className="text-xs">{item.namaAyah ?? "-"}</TableCell>
                      <TableCell className="text-xs">{item.namaIbu ?? "-"}</TableCell>
                      <TableCell>
                        {item.statusPernikahan ? (
                          <Badge
                            variant="secondary"
                            className={
                              item.statusPernikahan === "Menikah"
                                ? "border-emerald-500/20 bg-emerald-500/10 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"
                                : item.statusPernikahan === "Cerai Hidup"
                                  ? "border-amber-500/20 bg-amber-500/10 text-[10px] font-medium text-amber-600 dark:text-amber-400"
                                  : "border-red-500/20 bg-red-500/10 text-[10px] font-medium text-red-600 dark:text-red-400"
                            }
                          >
                            {item.statusPernikahan}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.kondisiKeluarga ? (
                          <Badge
                            variant="secondary"
                            className={
                              item.kondisiKeluarga === "Anak Yatim"
                                ? "border-blue-500/20 bg-blue-500/10 text-[10px] font-medium text-blue-600 dark:text-blue-400"
                                : item.kondisiKeluarga === "Anak Piatu"
                                  ? "border-purple-500/20 bg-purple-500/10 text-[10px] font-medium text-purple-600 dark:text-purple-400"
                                  : "border-rose-500/20 bg-rose-500/10 text-[10px] font-medium text-rose-600 dark:text-rose-400"
                            }
                          >
                            {item.kondisiKeluarga}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.fotoRumah ? (
                          <div className="flex justify-center">
                            <BiodataFotoPreview fotoRumah={item.fotoRumah} nama={item.nama} />
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <div className="flex size-8 items-center justify-center rounded-md bg-muted/50 text-[10px] text-muted-foreground">
                              -
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <BiodataSiswaActions biodata={item} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <UsersIcon className="size-8 text-muted-foreground/40" />
                        <p className="text-xs">Tidak ada data biodata siswa.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card List View */}
          <div className="block sm:hidden space-y-3">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <div key={item.id} className="rounded-xl border bg-card p-3.5 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {item.fotoRumah ? (
                        <BiodataFotoPreview fotoRumah={item.fotoRumah} nama={item.nama} />
                      ) : (
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-bold text-emerald-600">
                          {item.nama.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold">{item.nama}</h3>
                          <span className="text-[10px] text-muted-foreground font-medium">#{startIndex + index + 1}</span>
                        </div>
                        {item.nohpOrtu && (
                          <p className="text-[11px] text-muted-foreground">No. HP: <span className="font-mono text-foreground">{item.nohpOrtu}</span></p>
                        )}
                      </div>
                    </div>
                    {item.statusPernikahan && (
                      <Badge
                        variant="secondary"
                        className={
                          item.statusPernikahan === "Menikah"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-[10px] font-medium text-emerald-600 shrink-0"
                            : "border-amber-500/20 bg-amber-500/10 text-[10px] font-medium text-amber-600 shrink-0"
                        }
                      >
                        {item.statusPernikahan}
                      </Badge>
                    )}
                  </div>

                  {item.alamat && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      <span className="font-medium text-foreground">Alamat:</span> {item.alamat}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    {item.namaAyah && <span>Ayah: <strong className="text-foreground">{item.namaAyah}</strong></span>}
                    {item.namaAyah && item.namaIbu && <span>•</span>}
                    {item.namaIbu && <span>Ibu: <strong className="text-foreground">{item.namaIbu}</strong></span>}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                    {item.kondisiKeluarga ? (
                      <Badge variant="secondary" className="text-[10px]">
                        {item.kondisiKeluarga}
                      </Badge>
                    ) : <span />}
                    <BiodataSiswaActions biodata={item} />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-xl border py-12 text-center p-4">
                <UsersIcon className="size-8 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">Tidak ada data biodata siswa.</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              Menampilkan {paginatedData.length ? startIndex + 1 : 0}-
              {Math.min(startIndex + paginatedData.length, totalFiltered)} dari {totalFiltered} data
            </p>
            <Pagination className="justify-center sm:justify-end sm:mx-0 sm:w-auto">
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    text="Sebelumnya"
                    href={createPageHref({ q, filter, page: Math.max(safePage - 1, 1) })}
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
                    href={createPageHref({ q, filter, page: Math.min(safePage + 1, totalPages) })}
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
