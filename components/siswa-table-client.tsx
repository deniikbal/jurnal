"use client"

import { useCallback, useMemo, useState } from "react"
import { UsersIcon } from "lucide-react"

import { SiswaActions } from "@/components/siswa-actions"
import { SiswaCreateDialog } from "@/components/siswa-create-dialog"
import { SiswaImportDialog } from "@/components/siswa-import-dialog"
import { SiswaFilter } from "@/components/siswa-filter"
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
import { buildKelasSlugMaps } from "@/lib/utils"

type Siswa = {
  id: string
  name: string
  nis: string | null
  classroomId: string
  jenisKelamin: "laki-laki" | "perempuan"
  status: "aktif" | "keluar"
  createdAt: Date
}

type Kelas = {
  id: string
  name: string
}

type SiswaTableClientProps = {
  daftarSiswa: Siswa[]
  daftarKelas: Kelas[]
  kelasById: Map<string, Kelas>
}

const PAGE_SIZE = 10

const naturalCollator = new Intl.Collator("id-ID", {
  numeric: true,
  sensitivity: "base",
})

function StatusMark({ status }: { status: "aktif" | "keluar" }) {
  const aktif = status === "aktif"
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span
        className={`size-1.5 shrink-0 rounded-full ${aktif ? "bg-emerald-600 dark:bg-emerald-400" : "bg-stone-400"}`}
        aria-hidden
      />
      <span className={aktif ? "text-foreground" : "text-muted-foreground"}>
        {aktif ? "Aktif" : "Keluar"}
      </span>
    </span>
  )
}

export function SiswaTableClient({
  daftarSiswa,
  daftarKelas,
  kelasById,
}: SiswaTableClientProps) {
  const [search, setSearch] = useState("")
  const [kelas, setKelas] = useState("all")
  const [status, setStatus] = useState("all")
  const [filter, setFilter] = useState("natural")
  const [page, setPage] = useState(1)

  const { slugById, idBySlug } = useMemo(() => buildKelasSlugMaps(daftarKelas), [daftarKelas])

  const selectedClassroomId = useMemo(() => {
    if (kelas === "all") return "all"
    return idBySlug.get(kelas) ?? "all"
  }, [kelas, idBySlug])

  const handleSearchChange = useCallback((value: string) => {
    setSearch((prev) => {
      if (prev !== value) {
        setPage(1)
        return value
      }
      return prev
    })
  }, [])

  const handleKelasChange = useCallback((value: string) => {
    setKelas(value)
    setPage(1)
  }, [])

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value)
    setPage(1)
  }, [])

  const handleFilterChange = useCallback((value: string) => {
    setFilter(value)
    setPage(1)
  }, [])

  const filteredSiswa = useMemo(() => {
    return daftarSiswa
      .filter((item) => {
        const query = search.toLowerCase()
        const matchSearch =
          !query ||
          item.name.toLowerCase().includes(query) ||
          item.nis?.toLowerCase().includes(query)
        const matchClassroom =
          selectedClassroomId === "all" || item.classroomId === selectedClassroomId
        const matchStatus = status === "all" || item.status === status
        return matchSearch && matchClassroom && matchStatus
      })
      .sort((a, b) => {
        if (filter === "terlama") return a.createdAt.getTime() - b.createdAt.getTime()
        if (filter === "terbaru") return b.createdAt.getTime() - a.createdAt.getTime()
        if (filter === "za") return naturalCollator.compare(b.name, a.name)
        return naturalCollator.compare(a.name, b.name)
      })
  }, [daftarSiswa, search, selectedClassroomId, status, filter])

  const totalFiltered = filteredSiswa.length
  const totalPages = Math.max(Math.ceil(totalFiltered / PAGE_SIZE), 1)
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const paginatedSiswa = filteredSiswa.slice(startIndex, startIndex + PAGE_SIZE)

  return (
    <section className="overflow-hidden rounded-md border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Daftar siswa</h2>
          <p className="text-xs text-muted-foreground">
            {totalFiltered} data
            {search || kelas !== "all" || status !== "all" ? " (terfilter)" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 sm:flex-none">
            <SiswaImportDialog />
          </div>
          <div className="flex-1 sm:flex-none">
            <SiswaCreateDialog classrooms={daftarKelas} />
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-muted/30 px-4 py-3 sm:px-5">
        <SiswaFilter
          q={search}
          filter={filter}
          kelas={kelas}
          status={status}
          classrooms={daftarKelas.map((item) => ({
            id: item.id,
            name: item.name,
            slug: slugById.get(item.id) ?? item.id,
          }))}
          onSearchChange={handleSearchChange}
          onKelasChange={handleKelasChange}
          onStatusChange={handleStatusChange}
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
                Nama
              </TableHead>
              <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                NIS
              </TableHead>
              <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Kelas
              </TableHead>
              <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                JK
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
            {paginatedSiswa.length > 0 ? (
              paginatedSiswa.map((item, index) => (
                <TableRow key={item.id} className="group">
                  <TableCell className="pl-5 text-xs tabular-nums text-muted-foreground">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                  </TableCell>
                  <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
                    {item.nis ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {kelasById.get(item.classroomId)?.name ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground capitalize">
                    {item.jenisKelamin === "laki-laki" ? "L" : "P"}
                  </TableCell>
                  <TableCell>
                    <StatusMark status={item.status} />
                  </TableCell>
                  <TableCell className="pr-5">
                    <div className="flex justify-end">
                      <SiswaActions siswa={item} classrooms={daftarKelas} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="h-40">
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <UsersIcon className="size-7 text-muted-foreground/35" />
                    <p className="text-sm text-muted-foreground">Tidak ada data yang cocok.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="divide-y divide-border sm:hidden">
        {paginatedSiswa.length > 0 ? (
          paginatedSiswa.map((item, index) => (
            <div key={item.id} className="flex flex-col gap-3 px-4 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] tabular-nums text-muted-foreground">
                      {startIndex + index + 1}.
                    </span>
                    <h3 className="truncate text-sm font-medium text-foreground">{item.name}</h3>
                  </div>
                  <p className="pl-5 font-mono text-xs text-muted-foreground">
                    {item.nis ?? "—"}
                    <span className="mx-1.5 text-border">·</span>
                    <span className="font-sans">
                      {item.jenisKelamin === "laki-laki" ? "L" : "P"}
                    </span>
                  </p>
                </div>
                <StatusMark status={item.status} />
              </div>
              <div className="flex items-center justify-between pl-5">
                <span className="text-xs text-muted-foreground">
                  {kelasById.get(item.classroomId)?.name ?? "Tanpa kelas"}
                </span>
                <SiswaActions siswa={item} classrooms={daftarKelas} />
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <UsersIcon className="size-7 text-muted-foreground/35" />
            <p className="text-sm text-muted-foreground">Tidak ada data yang cocok.</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-center text-xs text-muted-foreground sm:text-left">
          {paginatedSiswa.length
            ? `${startIndex + 1}–${Math.min(startIndex + paginatedSiswa.length, totalFiltered)}`
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
