import type { Metadata } from "next"
import { GraduationCapIcon, TableIcon, UserCheckIcon, UserXIcon } from "lucide-react"

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
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Siswa</h1>
        <p className="text-sm text-muted-foreground">
          Kelola data siswa, kelas, jenis kelamin, dan status aktif/keluar.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Siswa
            </CardTitle>
            <GraduationCapIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalSiswa}</p>
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aktif
            </CardTitle>
            <UserCheckIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalAktif}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Keluar
            </CardTitle>
            <UserXIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalKeluar}</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>Daftar Siswa</CardTitle>
              <p className="text-sm text-muted-foreground">
                Cari, urutkan, dan lihat data siswa dengan pagination.
              </p>
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
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">No</TableHead>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead>NIS</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Jenis Kelamin</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-40 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSiswa.length > 0 ? (
                  paginatedSiswa.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.nis ?? "-"}</TableCell>
                      <TableCell>{kelasById.get(item.classroomId)?.name ?? "-"}</TableCell>
                      <TableCell className="capitalize">{item.jenisKelamin}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === "aktif" ? "secondary" : "destructive"}>
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
                      Tidak ada data siswa yang cocok.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
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
    </>
  )
}
