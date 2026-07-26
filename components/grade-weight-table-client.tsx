"use client"

import { useMemo, useState } from "react"
import { PercentIcon } from "lucide-react"

import { GradeWeightActions } from "@/components/grade-weight-actions"
import { GradeWeightCreateDialog } from "@/components/grade-weight-create-dialog"
import { GradeWeightFilter } from "@/components/grade-weight-filter"
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

type GradeWeight = {
  id: string
  name: string
  weight: number
  subjectId: string
  status: "aktif" | "nonaktif"
  createdAt: Date
}

type Subject = {
  id: string
  name: string
  kode: string
}

type GradeWeightTableClientProps = {
  weights: GradeWeight[]
  subjects: Subject[]
}

const PAGE_SIZE = 10

const naturalCollator = new Intl.Collator("id-ID", {
  numeric: true,
  sensitivity: "base",
})

function StatusMark({ status }: { status: "aktif" | "nonaktif" }) {
  const aktif = status === "aktif"
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span
        className={`size-1.5 shrink-0 rounded-full ${
          aktif ? "bg-emerald-600 dark:bg-emerald-400" : "bg-stone-400"
        }`}
        aria-hidden
      />
      <span className={aktif ? "text-foreground" : "text-muted-foreground"}>
        {aktif ? "Aktif" : "Nonaktif"}
      </span>
    </span>
  )
}

export function GradeWeightTableClient({
  weights,
  subjects,
}: GradeWeightTableClientProps) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("natural")
  const [subjectId, setSubjectId] = useState("all")
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)

  const subjectById = useMemo(
    () => new Map(subjects.map((item) => [item.id, item])),
    [subjects],
  )

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleFilterChange = (value: string) => {
    setFilter(value)
    setPage(1)
  }

  const handleSubjectChange = (value: string) => {
    setSubjectId(value)
    setPage(1)
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    setPage(1)
  }

  const filteredWeights = useMemo(() => {
    return weights
      .filter((item) => {
        const query = search.toLowerCase()
        const subjectName = subjectById.get(item.subjectId)?.name?.toLowerCase() ?? ""
        const matchSearch =
          !query ||
          item.name.toLowerCase().includes(query) ||
          subjectName.includes(query)
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
  }, [weights, search, subjectId, status, filter, subjectById])

  const totalFiltered = filteredWeights.length
  const totalPages = Math.max(Math.ceil(totalFiltered / PAGE_SIZE), 1)
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const paginatedWeights = filteredWeights.slice(startIndex, startIndex + PAGE_SIZE)

  return (
    <section className="overflow-hidden rounded-md border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Daftar bobot</h2>
          <p className="text-xs text-muted-foreground">
            {totalFiltered} data
            {search || subjectId !== "all" || status !== "all" ? " (terfilter)" : ""}
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <GradeWeightCreateDialog subjects={subjects} />
        </div>
      </div>

      <div className="border-b border-border bg-muted/30 px-4 py-3 sm:px-5">
        <GradeWeightFilter
          q={search}
          filter={filter}
          subjectId={subjectId}
          status={status}
          subjects={subjects}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          onSubjectChange={handleSubjectChange}
          onStatusChange={handleStatusChange}
        />
      </div>

      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 pl-5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                No
              </TableHead>
              <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Nama
              </TableHead>
              <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Mapel
              </TableHead>
              <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Bobot
              </TableHead>
              <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Status
              </TableHead>
              <TableHead className="w-28 pr-5 text-right text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedWeights.length > 0 ? (
              paginatedWeights.map((item, index) => {
                const subject = subjectById.get(item.subjectId)
                return (
                  <TableRow key={item.id} className="group">
                    <TableCell className="pl-5 text-xs tabular-nums text-muted-foreground">
                      {startIndex + index + 1}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-foreground">{item.name}</span>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {subject?.name ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                      {subject?.kode ? (
                        <span className="ml-1 font-mono text-xs text-muted-foreground">
                          ({subject.kode})
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-sm tabular-nums text-foreground">
                      {item.weight}%
                    </TableCell>
                    <TableCell>
                      <StatusMark status={item.status} />
                    </TableCell>
                    <TableCell className="pr-5">
                      <div className="flex justify-end">
                        <GradeWeightActions item={item} subjects={subjects} />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="h-40">
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <PercentIcon className="size-7 text-muted-foreground/35" />
                    <p className="text-sm text-muted-foreground">Tidak ada data yang cocok.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="divide-y divide-border sm:hidden">
        {paginatedWeights.length > 0 ? (
          paginatedWeights.map((item, index) => {
            const subject = subjectById.get(item.subjectId)
            return (
              <div key={item.id} className="flex flex-col gap-3 px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[11px] tabular-nums text-muted-foreground">
                        {startIndex + index + 1}.
                      </span>
                      <h3 className="truncate text-sm font-medium text-foreground">
                        {item.name}
                      </h3>
                    </div>
                    <p className="pl-5 text-xs text-muted-foreground">
                      {subject?.name ?? "Mapel tidak ditemukan"}
                      <span className="mx-1.5 text-border">·</span>
                      <span className="tabular-nums text-foreground">{item.weight}%</span>
                    </p>
                  </div>
                  <StatusMark status={item.status} />
                </div>
                <div className="flex justify-end pl-5">
                  <GradeWeightActions item={item} subjects={subjects} />
                </div>
              </div>
            )
          })
        ) : (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <PercentIcon className="size-7 text-muted-foreground/35" />
            <p className="text-sm text-muted-foreground">Tidak ada data yang cocok.</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-center text-xs text-muted-foreground sm:text-left">
          {paginatedWeights.length
            ? `${startIndex + 1}–${Math.min(startIndex + paginatedWeights.length, totalFiltered)}`
            : "0"}{" "}
          dari {totalFiltered}
        </p>
        <Pagination className="justify-center sm:mx-0 sm:w-auto sm:justify-end">
          <PaginationContent className="gap-1">
            <PaginationItem>
              <PaginationPrevious
                text="Sebelumnya"
                onClick={() => setPage(Math.max(safePage - 1, 1))}
                aria-disabled={safePage === 1}
                className={safePage === 1 ? "pointer-events-none opacity-50 text-xs" : "text-xs"}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
              .map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink isActive={p === safePage} onClick={() => setPage(p)}>
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
            <PaginationItem>
              <PaginationNext
                text="Berikutnya"
                onClick={() => setPage(Math.min(safePage + 1, totalPages))}
                aria-disabled={safePage === totalPages}
                className={
                  safePage === totalPages ? "pointer-events-none opacity-50 text-xs" : "text-xs"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </section>
  )
}
