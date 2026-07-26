"use client"

import { useMemo, useState } from "react"
import { SchoolIcon } from "lucide-react"

import { KelasActions } from "@/components/kelas-actions"
import { KelasCreateDialog } from "@/components/kelas-create-dialog"
import { KelasFilter } from "@/components/kelas-filter"
import { KelasImportDialog } from "@/components/kelas-import-dialog"
import { KelasSiswaDialog } from "@/components/kelas-siswa-dialog"
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

type Kelas = {
  id: string
  name: string
  waliKelas: string | null
  createdAt: Date
}

type Siswa = {
  id: string
  name: string
  nis: string | null
  classroomId: string
}

type KelasTableClientProps = {
  daftarKelas: Kelas[]
  daftarSiswa: Siswa[]
}

const PAGE_SIZE = 10

const naturalCollator = new Intl.Collator("id-ID", {
  numeric: true,
  sensitivity: "base",
})

export function KelasTableClient({ daftarKelas, daftarSiswa }: KelasTableClientProps) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("natural")
  const [page, setPage] = useState(1)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleFilterChange = (value: string) => {
    setFilter(value)
    setPage(1)
  }

  const siswaByKelas = useMemo(() => {
    const map = new Map<string, Siswa[]>()
    for (const item of daftarSiswa) {
      const list = map.get(item.classroomId) ?? []
      list.push(item)
      map.set(item.classroomId, list)
    }
    return map
  }, [daftarSiswa])

  const filteredKelas = useMemo(() => {
    return daftarKelas
      .filter((item) => {
        const query = search.toLowerCase()
        return !query || item.name.toLowerCase().includes(query)
      })
      .sort((a, b) => {
        if (filter === "terlama") return a.createdAt.getTime() - b.createdAt.getTime()
        if (filter === "terbaru") return b.createdAt.getTime() - a.createdAt.getTime()
        if (filter === "za") return naturalCollator.compare(b.name, a.name)
        if (filter === "az" || filter === "natural") {
          return naturalCollator.compare(a.name, b.name)
        }
        return naturalCollator.compare(a.name, b.name)
      })
  }, [daftarKelas, search, filter])

  const totalFiltered = filteredKelas.length
  const totalPages = Math.max(Math.ceil(totalFiltered / PAGE_SIZE), 1)
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const paginatedKelas = filteredKelas.slice(startIndex, startIndex + PAGE_SIZE)

  return (
    <section className="overflow-hidden rounded-md border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Daftar kelas</h2>
          <p className="text-xs text-muted-foreground">
            {totalFiltered} data
            {search ? " (terfilter)" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 sm:flex-none">
            <KelasImportDialog />
          </div>
          <div className="flex-1 sm:flex-none">
            <KelasCreateDialog />
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-muted/30 px-4 py-3 sm:px-5">
        <KelasFilter
          q={search}
          filter={filter}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
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
                Nama kelas
              </TableHead>
              <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Wali kelas
              </TableHead>
              <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Siswa
              </TableHead>
              <TableHead className="w-28 pr-5 text-right text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedKelas.length > 0 ? (
              paginatedKelas.map((item, index) => {
                const siswaKelas = siswaByKelas.get(item.id) ?? []
                return (
                  <TableRow key={item.id} className="group">
                    <TableCell className="pl-5 text-xs tabular-nums text-muted-foreground">
                      {startIndex + index + 1}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-foreground">{item.name}</span>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {item.waliKelas ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <KelasSiswaDialog kelasName={item.name} siswa={siswaKelas} />
                    </TableCell>
                    <TableCell className="pr-5">
                      <div className="flex justify-end">
                        <KelasActions kelas={item} />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="h-40">
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <SchoolIcon className="size-7 text-muted-foreground/35" />
                    <p className="text-sm text-muted-foreground">Tidak ada data yang cocok.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="divide-y divide-border sm:hidden">
        {paginatedKelas.length > 0 ? (
          paginatedKelas.map((item, index) => {
            const siswaKelas = siswaByKelas.get(item.id) ?? []
            return (
              <div key={item.id} className="flex flex-col gap-3 px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[11px] tabular-nums text-muted-foreground">
                        {startIndex + index + 1}.
                      </span>
                      <h3 className="truncate text-sm font-medium text-foreground">{item.name}</h3>
                    </div>
                    <p className="pl-5 text-xs text-muted-foreground">
                      {item.waliKelas ? `Wali: ${item.waliKelas}` : "Belum ada wali kelas"}
                    </p>
                  </div>
                  <KelasActions kelas={item} />
                </div>
                <div className="pl-5">
                  <KelasSiswaDialog kelasName={item.name} siswa={siswaKelas} />
                </div>
              </div>
            )
          })
        ) : (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <SchoolIcon className="size-7 text-muted-foreground/35" />
            <p className="text-sm text-muted-foreground">Tidak ada data yang cocok.</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-center text-xs text-muted-foreground sm:text-left">
          {paginatedKelas.length
            ? `${startIndex + 1}–${Math.min(startIndex + paginatedKelas.length, totalFiltered)}`
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
