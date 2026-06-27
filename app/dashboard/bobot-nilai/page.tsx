import type { Metadata } from "next"
import { CalculatorIcon, PercentIcon, TableIcon, TriangleAlertIcon } from "lucide-react"

import { GradeWeightActions } from "@/components/grade-weight-actions"
import { GradeWeightCreateDialog } from "@/components/grade-weight-create-dialog"
import { GradeWeightFilter } from "@/components/grade-weight-filter"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getGradeWeightsForCurrentUser, getSubjectsForCurrentUser } from "@/lib/dal"

export const metadata: Metadata = { title: "Bobot Nilai" }

type GradeWeightPageProps = {
  searchParams: Promise<{ q?: string; filter?: string; subjectId?: string; status?: string; page?: string }>
}

const PAGE_SIZE = 10
const naturalCollator = new Intl.Collator("id-ID", { numeric: true, sensitivity: "base" })

function createPageHref(params: { q: string; filter: string; subjectId: string; status: string; page: number }) {
  const searchParams = new URLSearchParams()
  if (params.q) searchParams.set("q", params.q)
  if (params.filter !== "natural") searchParams.set("filter", params.filter)
  if (params.subjectId !== "all") searchParams.set("subjectId", params.subjectId)
  if (params.status !== "all") searchParams.set("status", params.status)
  if (params.page > 1) searchParams.set("page", String(params.page))
  const query = searchParams.toString()
  return query ? `/dashboard/bobot-nilai?${query}` : "/dashboard/bobot-nilai"
}

export default async function GradeWeightPage({ searchParams }: GradeWeightPageProps) {
  const params = await searchParams
  const q = params.q?.trim() ?? ""
  const filter = params.filter ?? "natural"
  const subjectId = params.subjectId ?? "all"
  const status = params.status ?? "all"
  const currentPage = Math.max(Number(params.page ?? "1") || 1, 1)

  const [weights, subjects] = await Promise.all([
    getGradeWeightsForCurrentUser(),
    getSubjectsForCurrentUser(),
  ])
  const subjectById = new Map(subjects.map((item) => [item.id, item]))
  const activeWeights = weights.filter((item) => item.status === "aktif")
  const totalActiveWeight = activeWeights.reduce((total, item) => total + item.weight, 0)
  const subjectTotals = new Map<string, number>()
  for (const item of activeWeights) subjectTotals.set(item.subjectId, (subjectTotals.get(item.subjectId) ?? 0) + item.weight)
  const incompleteSubjects = subjects.filter((item) => (subjectTotals.get(item.id) ?? 0) !== 100).length

  const filteredWeights = weights
    .filter((item) => {
      const query = q.toLowerCase()
      const matchSearch = !query || item.name.toLowerCase().includes(query) || subjectById.get(item.subjectId)?.name.toLowerCase().includes(query)
      const matchSubject = subjectId === "all" || item.subjectId === subjectId
      const matchStatus = status === "all" || item.status === status
      return matchSearch && matchSubject && matchStatus
    })
    .sort((a, b) => {
      if (filter === "terbesar") return b.weight - a.weight
      if (filter === "terkecil") return a.weight - b.weight
      if (filter === "za") return naturalCollator.compare(b.name, a.name)
      return naturalCollator.compare(a.name, b.name)
    })

  const totalFiltered = filteredWeights.length
  const totalPages = Math.max(Math.ceil(totalFiltered / PAGE_SIZE), 1)
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const paginatedWeights = filteredWeights.slice(startIndex, startIndex + PAGE_SIZE)

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bobot Nilai</h1>
        <p className="text-sm text-muted-foreground">Atur bobot nilai berbeda untuk setiap mata pelajaran.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Bobot</CardTitle><CalculatorIcon className="size-4 text-muted-foreground" /></CardHeader><CardContent><p className="text-3xl font-semibold">{weights.length}</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Ditampilkan</CardTitle><TableIcon className="size-4 text-muted-foreground" /></CardHeader><CardContent><p className="text-3xl font-semibold">{totalFiltered}</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Bobot Aktif</CardTitle><PercentIcon className="size-4 text-muted-foreground" /></CardHeader><CardContent><p className="text-3xl font-semibold">{totalActiveWeight}%</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Mapel Belum 100%</CardTitle><TriangleAlertIcon className="size-4 text-muted-foreground" /></CardHeader><CardContent><p className="text-3xl font-semibold">{incompleteSubjects}</p></CardContent></Card>
      </section>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1"><CardTitle>Daftar Bobot Nilai</CardTitle><p className="text-sm text-muted-foreground">Cari, filter per mapel, dan atur bobot nilai.</p></div>
            <GradeWeightCreateDialog subjects={subjects} />
          </div>
          <GradeWeightFilter q={q} filter={filter} subjectId={subjectId} status={status} subjects={subjects} />
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader><TableRow><TableHead className="w-16">No</TableHead><TableHead>Nama Bobot</TableHead><TableHead>Mata Pelajaran</TableHead><TableHead>Bobot</TableHead><TableHead>Total Mapel</TableHead><TableHead>Status</TableHead><TableHead className="w-40 text-right">Aksi</TableHead></TableRow></TableHeader>
              <TableBody>
                {paginatedWeights.length > 0 ? paginatedWeights.map((item, index) => {
                  const subject = subjectById.get(item.subjectId)
                  const subjectTotal = subjectTotals.get(item.subjectId) ?? 0
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground">{startIndex + index + 1}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{subject ? `${subject.name} (${subject.kode})` : "-"}</TableCell>
                      <TableCell>{item.weight}%</TableCell>
                      <TableCell><Badge variant={subjectTotal === 100 ? "secondary" : "destructive"}>{subjectTotal}%</Badge></TableCell>
                      <TableCell><Badge variant={item.status === "aktif" ? "secondary" : "outline"}>{item.status === "aktif" ? "Aktif" : "Nonaktif"}</Badge></TableCell>
                      <TableCell><div className="flex justify-end"><GradeWeightActions item={item} subjects={subjects} /></div></TableCell>
                    </TableRow>
                  )
                }) : <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">Tidak ada data bobot nilai yang cocok.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Menampilkan {paginatedWeights.length ? startIndex + 1 : 0}-{Math.min(startIndex + paginatedWeights.length, totalFiltered)} dari {totalFiltered} data</p>
            <Pagination className="sm:mx-0 sm:w-auto"><PaginationContent><PaginationItem><PaginationPrevious text="Sebelumnya" href={createPageHref({ q, filter, subjectId, status, page: Math.max(safePage - 1, 1) })} aria-disabled={safePage === 1} className={safePage === 1 ? "pointer-events-none opacity-50" : undefined} /></PaginationItem>{Array.from({ length: totalPages }, (_, index) => index + 1).filter((page) => page === 1 || page === totalPages || Math.abs(page - safePage) <= 1).map((page) => <PaginationItem key={page}><PaginationLink href={createPageHref({ q, filter, subjectId, status, page })} isActive={page === safePage}>{page}</PaginationLink></PaginationItem>)}<PaginationItem><PaginationNext text="Berikutnya" href={createPageHref({ q, filter, subjectId, status, page: Math.min(safePage + 1, totalPages) })} aria-disabled={safePage === totalPages} className={safePage === totalPages ? "pointer-events-none opacity-50" : undefined} /></PaginationItem></PaginationContent></Pagination>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
