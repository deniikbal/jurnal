"use client"

import { useCallback, useMemo, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, SchoolIcon, UploadIcon } from "lucide-react"

import { KelasActions } from "@/components/kelas-actions"
import { KelasCreateDialog } from "@/components/kelas-create-dialog"
import { KelasFilter } from "@/components/kelas-filter"
import { KelasImportDialog } from "@/components/kelas-import-dialog"
import { KelasSiswaDialog } from "@/components/kelas-siswa-dialog"
import { Button } from "@/components/ui/button"
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
  const [page, setPage] = useState(0)

  const handleSearchChange = useCallback((value: string) => {
    setSearch((prev) => {
      if (prev !== value) {
        setPage(0)
        return value
      }
      return prev
    })
  }, [])

  const handleFilterChange = useCallback((value: string) => {
    setFilter(value)
    setPage(0)
  }, [])

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
  const safePage = Math.min(page, totalPages - 1)
  const startIndex = safePage * PAGE_SIZE
  const paginatedKelas = filteredKelas.slice(startIndex, startIndex + PAGE_SIZE)

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-4 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">Daftar kelas</h2>
          <p className="text-xs text-muted-foreground">
            {totalFiltered} kelas
            {search ? " cocok dengan filter" : " terdaftar"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <KelasImportDialog
            trigger={
              <Button variant="outline" size="sm" className="gap-1.5 shadow-none">
                <UploadIcon className="size-3.5" />
                Impor
              </Button>
            }
          />
          <KelasCreateDialog
            trigger={
              <Button size="sm" className="gap-1.5">
                <PlusIcon className="size-3.5" />
                Tambah kelas
              </Button>
            }
          />
        </div>
      </div>

      <div className="border-b border-border bg-muted/20 px-5 py-3">
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
              <TableHead className="w-14 pl-5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                No
              </TableHead>
              <TableHead className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Nama kelas
              </TableHead>
              <TableHead className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Wali kelas
              </TableHead>
              <TableHead className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Siswa
              </TableHead>
              <TableHead className="w-32 pr-5 text-right text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
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
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <SchoolIcon className="size-4" />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {item.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.waliKelas ? (
                        <span className="text-sm text-foreground">
                          {item.waliKelas}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                          Belum ditentukan
                        </span>
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
                <TableCell colSpan={5} className="h-48">
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                      <SchoolIcon className="size-5 text-muted-foreground/60" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      Tidak ada kelas yang cocok
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Coba ubah pencarian atau tambahkan kelas baru.
                    </p>
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
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <SchoolIcon className="size-4" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[11px] tabular-nums text-muted-foreground">
                          {startIndex + index + 1}.
                        </span>
                        <h3 className="truncate text-sm font-medium text-foreground">
                          {item.name}
                        </h3>
                      </div>
                      <p className="pl-4 text-xs text-muted-foreground">
                        {item.waliKelas
                          ? `Wali: ${item.waliKelas}`
                          : "Belum ada wali kelas"}
                      </p>
                    </div>
                  </div>
                  <KelasActions kelas={item} />
                </div>
                <div className="pl-11">
                  <KelasSiswaDialog kelasName={item.name} siswa={siswaKelas} />
                </div>
              </div>
            )
          })
        ) : (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <SchoolIcon className="size-5 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Tidak ada kelas yang cocok
            </p>
            <p className="text-xs text-muted-foreground">
              Coba ubah pencarian atau tambahkan kelas baru.
            </p>
          </div>
        )}
      </div>

      {totalPages > 1 ? (
        <div className="flex flex-col gap-3 border-t border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-xs text-muted-foreground sm:text-left">
            {paginatedKelas.length
              ? `${startIndex + 1}–${Math.min(startIndex + paginatedKelas.length, totalFiltered)}`
              : "0"}{" "}
            dari {totalFiltered}
          </p>
          <nav className="flex items-center justify-center gap-1" aria-label="pagination">
            <Button
              variant="ghost"
              size="sm"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
              className="gap-1 text-xs"
            >
              <ChevronLeftIcon className="size-3.5" />
              <span className="hidden sm:inline">Sebelumnya</span>
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i)
              .filter((p) => p === 0 || p === totalPages - 1 || Math.abs(p - safePage) <= 1)
              .map((p, idx, arr) => (
                <span key={p} className="flex items-center">
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="px-1 text-xs text-muted-foreground">…</span>
                  )}
                  <Button
                    variant={p === safePage ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPage(p)}
                    className="min-w-[32px] text-xs"
                  >
                    {p + 1}
                  </Button>
                </span>
              ))}
            <Button
              variant="ghost"
              size="sm"
              disabled={safePage === totalPages - 1}
              onClick={() => setPage(safePage + 1)}
              className="gap-1 text-xs"
            >
              <span className="hidden sm:inline">Berikutnya</span>
              <ChevronRightIcon className="size-3.5" />
            </Button>
          </nav>
        </div>
      ) : totalFiltered > 0 ? (
        <div className="border-t border-border px-5 py-3">
          <p className="text-center text-xs text-muted-foreground sm:text-left">
            Menampilkan {totalFiltered} kelas
          </p>
        </div>
      ) : null}
    </section>
  )
}
