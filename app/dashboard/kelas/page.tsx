import type { Metadata } from "next"
import { SchoolIcon, TableIcon } from "lucide-react"

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

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Kelas</h1>
        <p className="text-sm text-muted-foreground">
          Kelola data kelas milik akun yang sedang login.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Kelas
            </CardTitle>
            <SchoolIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalKelas}</p>
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
            <p className="text-3xl font-semibold">{totalFiltered}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Halaman
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {safePage}/{totalPages}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Kelas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="truncate text-lg font-semibold">
              {newestKelas?.name ?? "Belum ada"}
            </p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>Daftar Kelas</CardTitle>
              <p className="text-sm text-muted-foreground">
                Cari, urutkan, dan lihat data kelas dengan pagination.
              </p>
            </div>
            <div className="flex gap-2">
              <KelasImportDialog />
              <KelasCreateDialog />
            </div>
          </div>
          <KelasFilter q={q} filter={filter} />
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">No</TableHead>
                  <TableHead>Nama Kelas</TableHead>
                  <TableHead>Wali Kelas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Siswa</TableHead>
                  <TableHead className="w-40 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedKelas.length > 0 ? (
                  paginatedKelas.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.waliKelas ?? "-"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Aktif</Badge>
                      </TableCell>
                      <TableCell>
                        <KelasSiswaDialog
                          kelasName={item.name}
                          siswa={daftarSiswa.filter((siswa) => siswa.classroomId === item.id)}
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
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      Tidak ada data kelas yang cocok.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Menampilkan {paginatedKelas.length ? startIndex + 1 : 0}-
              {Math.min(startIndex + paginatedKelas.length, totalFiltered)} dari {totalFiltered} data
            </p>
            <Pagination className="sm:mx-0 sm:w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    text="Sebelumnya"
                    href={createPageHref({ q, filter, page: Math.max(safePage - 1, 1) })}
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
