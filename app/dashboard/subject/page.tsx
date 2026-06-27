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
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mata Pelajaran</h1>
        <p className="text-sm text-muted-foreground">
          Kelola data mata pelajaran, kode, dan status aktif/nonaktif.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Mapel
            </CardTitle>
            <BookOpenIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalSubjects}</p>
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
            <ToggleRightIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalAktif}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nonaktif
            </CardTitle>
            <ToggleLeftIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalNonaktif}</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>Daftar Mata Pelajaran</CardTitle>
              <p className="text-sm text-muted-foreground">
                Cari, urutkan, dan lihat data mata pelajaran dengan pagination.
              </p>
            </div>
            <SubjectCreateDialog />
          </div>
          <SubjectFilter q={q} filter={filter} status={status} />
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">No</TableHead>
                  <TableHead>Nama Mata Pelajaran</TableHead>
                  <TableHead>Kode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-40 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSubjects.length > 0 ? (
                  paginatedSubjects.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.kode}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === "aktif" ? "secondary" : "outline"}>
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
                      Tidak ada data mata pelajaran yang cocok.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Menampilkan {paginatedSubjects.length ? startIndex + 1 : 0}-
              {Math.min(startIndex + paginatedSubjects.length, totalFiltered)} dari {totalFiltered} data
            </p>
            <Pagination className="sm:mx-0 sm:w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    text="Sebelumnya"
                    href={createPageHref({ q, filter, status, page: Math.max(safePage - 1, 1) })}
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
