"use client"

import { useCallback, useMemo, useState } from "react"
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  HomeIcon,
  PhoneIcon,
  UsersIcon,
} from "lucide-react"

import { BiodataFotoPreview } from "@/components/biodata-foto-preview"
import { BiodataSiswaActions } from "@/components/biodata-siswa-actions"
import { BiodataSiswaCreateDialog } from "@/components/biodata-siswa-create-dialog"
import { BiodataSiswaImportDialog } from "@/components/biodata-siswa-import-dialog"
import { BiodataSiswaFilter } from "@/components/biodata-siswa-filter"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

const naturalCollator = new Intl.Collator("id-ID", {
  numeric: true,
  sensitivity: "base",
})

type BiodataItem = {
  id: string
  nama: string
  alamat: string | null
  nohpOrtu: string | null
  namaAyah: string | null
  namaIbu: string | null
  statusPernikahan: string | null
  kondisiKeluarga: string | null
  fotoRumah: string | null
  createdAt: Date
  updatedAt: Date
}

type BiodataSiswaTableClientProps = {
  items: BiodataItem[]
  kelasList: Array<{ id: string; name: string }>
}

function getInitials(nama: string) {
  return nama
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function getCompleteness(item: BiodataItem) {
  const fields = [
    item.alamat,
    item.nohpOrtu,
    item.namaAyah,
    item.namaIbu,
    item.statusPernikahan,
    item.fotoRumah,
  ]
  const filled = fields.filter((value) => Boolean(value?.toString().trim())).length
  const total = fields.length
  const percent = Math.round((filled / total) * 100)

  return {
    filled,
    total,
    percent,
    isComplete: filled === total,
  }
}

function isAttention(item: BiodataItem) {
  return Boolean(item.kondisiKeluarga) || item.statusPernikahan === "Cerai Hidup" || item.statusPernikahan === "Cerai Meninggal"
}

function parentsLabel(item: BiodataItem) {
  const ayah = item.namaAyah?.trim()
  const ibu = item.namaIbu?.trim()

  if (ayah && ibu) return `${ayah} · ${ibu}`
  if (ayah) return `Ayah: ${ayah}`
  if (ibu) return `Ibu: ${ibu}`
  return "Data orang tua belum diisi"
}

function CompletenessBadge({
  completeness,
}: {
  completeness: { filled: number; total: number; percent: number; isComplete: boolean }
}) {
  if (completeness.isComplete) {
    return (
      <Badge
        variant="secondary"
        className="w-fit border-emerald-500/20 bg-emerald-500/10 text-[10px] font-medium text-emerald-700 dark:text-emerald-400"
      >
        Lengkap
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="w-fit text-[10px] font-medium text-muted-foreground">
      {completeness.filled}/{completeness.total} field
    </Badge>
  )
}

export function BiodataSiswaTableClient({
  items: allItems,
  kelasList,
}: BiodataSiswaTableClientProps) {
  const [q, setQ] = useState("")
  const [filter, setFilter] = useState("natural")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)

  const handleSearchChange = useCallback((value: string) => {
    setQ(value)
  }, [])

  const handleFilterChange = useCallback((value: string) => {
    setFilter(value)
    setPage(1)
  }, [])

  const handleStatusChange = useCallback((targetStatus: string) => {
    setStatus((prev) => (prev === targetStatus ? "" : targetStatus))
    setPage(1)
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const { filteredData, totalData, completeCount, attentionCount, incompleteCount } =
    useMemo(() => {
      const totalData = allItems.length
      const completeCount = allItems.filter((item) => getCompleteness(item).isComplete).length
      const attentionCount = allItems.filter((item) => isAttention(item)).length
      const incompleteCount = totalData - completeCount

      const filteredData = allItems
        .filter((item) => {
          if (status === "lengkap" && !getCompleteness(item).isComplete) return false
          if (status === "belum-lengkap" && getCompleteness(item).isComplete) return false
          if (status === "perhatian" && !isAttention(item)) return false

          if (!q) return true
          const haystack = [
            item.nama,
            item.alamat,
            item.nohpOrtu,
            item.namaAyah,
            item.namaIbu,
            item.statusPernikahan,
            item.kondisiKeluarga,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
          return haystack.includes(q.toLowerCase())
        })
        .sort((a, b) => {
          if (filter === "terlama") return a.createdAt.getTime() - b.createdAt.getTime()
          if (filter === "terbaru") return b.createdAt.getTime() - a.createdAt.getTime()
          if (filter === "za") return naturalCollator.compare(b.nama, a.nama)
          return naturalCollator.compare(a.nama, b.nama)
        })

      return { filteredData, totalData, completeCount, attentionCount, incompleteCount }
    }, [allItems, q, filter, status])

  const totalPages = Math.max(Math.ceil(filteredData.length / PAGE_SIZE), 1)
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const paginatedData = filteredData.slice(startIndex, startIndex + PAGE_SIZE)
  const totalFiltered = filteredData.length

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <UsersIcon className="size-3.5" />
            Arsip wali kelas
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Biodata Siswa
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Roster identitas siswa dan keluarga — ringkas untuk dipantau, detail
            untuk dilengkapi.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-sm border bg-muted/40 px-2.5 py-1 font-medium tabular-nums">
              {totalData} siswa
            </span>
            <span className="rounded-sm border px-2.5 py-1 text-muted-foreground tabular-nums">
              {completeCount} lengkap
            </span>
            <span
              className={cn(
                "rounded-sm border px-2.5 py-1 tabular-nums",
                attentionCount > 0
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : "text-muted-foreground"
              )}
            >
              {attentionCount} perlu perhatian
            </span>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="flex-1 sm:flex-none">
              <BiodataSiswaImportDialog kelasList={kelasList} />
            </div>
            <div className="flex-1 sm:flex-none">
              <BiodataSiswaCreateDialog />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => handleStatusChange("lengkap")}
          className={cn(
            "rounded-sm border bg-card px-4 py-3 text-left transition-colors hover:bg-muted/30 cursor-pointer",
            status === "lengkap" && "ring-2 ring-emerald-500/40 border-emerald-500/30"
          )}
        >
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            <CheckCircle2Icon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            Lengkap
          </div>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight">
            {completeCount}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {totalData > 0
              ? `${Math.round((completeCount / totalData) * 100)}% dari total roster`
              : "Belum ada data"}
          </p>
        </button>
        <button
          type="button"
          onClick={() => handleStatusChange("belum-lengkap")}
          className={cn(
            "rounded-sm border bg-card px-4 py-3 text-left transition-colors hover:bg-muted/30 cursor-pointer",
            status === "belum-lengkap" && "ring-2 ring-primary/40 border-primary/30"
          )}
        >
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            <CircleDashedIcon className="size-3.5" />
            Belum lengkap
          </div>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight">
            {incompleteCount}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Perlu dilengkapi field identitas/keluarga
          </p>
        </button>
        <button
          type="button"
          onClick={() => handleStatusChange("perhatian")}
          className={cn(
            "rounded-sm border bg-card px-4 py-3 text-left transition-colors hover:bg-muted/30 cursor-pointer",
            status === "perhatian" && "ring-2 ring-amber-500/40 border-amber-500/30"
          )}
        >
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            <AlertTriangleIcon className="size-3.5 text-amber-600 dark:text-amber-400" />
            Perlu perhatian
          </div>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight">
            {attentionCount}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Yatim/piatu atau status orang tua khusus
          </p>
        </button>
      </div>

      <section className="overflow-hidden rounded-sm border bg-card">
        <div className="flex flex-col gap-3 border-b px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold tracking-tight sm:text-base">
                Roster siswa
              </h2>
              <p className="text-xs text-muted-foreground">
                {totalFiltered === totalData
                  ? `${totalFiltered} berkas ditampilkan`
                  : `${totalFiltered} dari ${totalData} berkas cocok dengan pencarian`}
              </p>
            </div>
            {kelasList.length > 0 && (
              <p className="text-[11px] text-muted-foreground sm:text-xs">
                {kelasList.length} kelas terhubung di sistem
              </p>
            )}
          </div>
          <BiodataSiswaFilter
            q={q}
            filter={filter}
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
          />
        </div>

        {paginatedData.length > 0 ? (
          <div className="divide-y">
            <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_140px_88px] gap-4 border-b bg-muted/20 px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:grid">
              <span>Siswa</span>
              <span>Keluarga</span>
              <span>Status</span>
              <span className="text-right">Aksi</span>
            </div>

            {paginatedData.map((item, index) => {
              const completeness = getCompleteness(item)
              const attention = isAttention(item)
              const absoluteIndex = startIndex + index + 1

              return (
                <article
                  key={item.id}
                  className="group px-4 py-4 transition-colors hover:bg-muted/20 sm:grid sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_140px_88px] sm:items-center sm:gap-4 sm:px-5 sm:py-4"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="relative shrink-0">
                      {item.fotoRumah ? (
                        <BiodataFotoPreview fotoRumah={item.fotoRumah} nama={item.nama} />
                      ) : (
                        <div className="flex size-10 items-center justify-center rounded-sm border bg-muted/40 text-xs font-semibold tracking-wide text-muted-foreground sm:size-11">
                          {getInitials(item.nama) || "?"}
                        </div>
                      )}
                      <span className="absolute -left-1 -top-1 flex size-4 items-center justify-center rounded-full border bg-background text-[9px] font-semibold tabular-nums text-muted-foreground sm:hidden">
                        {absoluteIndex}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-sm font-semibold tracking-tight">
                              {item.nama}
                            </h3>
                            <span className="hidden text-[11px] tabular-nums text-muted-foreground sm:inline">
                              #{absoluteIndex}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                            {item.nohpOrtu ? (
                              <span className="inline-flex items-center gap-1">
                                <PhoneIcon className="size-3" />
                                <span className="font-medium text-foreground/80">
                                  {item.nohpOrtu}
                                </span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-muted-foreground/80">
                                <PhoneIcon className="size-3" />
                                HP ortu belum ada
                              </span>
                            )}
                          </div>
                          {item.alamat && (
                            <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground sm:text-xs">
                              {item.alamat}
                            </p>
                          )}
                        </div>

                        <div className="sm:hidden">
                          <BiodataSiswaActions biodata={item} />
                        </div>
                      </div>

                      <div className="mt-2 space-y-2 sm:hidden">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground/85">
                            {parentsLabel(item)}
                          </span>
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <CompletenessBadge completeness={completeness} />
                          {attention && item.kondisiKeluarga && (
                            <Badge
                              variant="secondary"
                              className="border-amber-500/25 bg-amber-500/10 text-[10px] font-medium text-amber-700 dark:text-amber-400"
                            >
                              {item.kondisiKeluarga}
                            </Badge>
                          )}
                          {item.statusPernikahan && (
                            <Badge variant="outline" className="text-[10px] font-medium">
                              {item.statusPernikahan}
                            </Badge>
                          )}
                          {item.fotoRumah && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                              <HomeIcon className="size-3" />
                              Ada foto
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="hidden min-w-0 sm:block">
                    <p className="truncate text-sm font-medium text-foreground/90">
                      {item.namaAyah || item.namaIbu ? parentsLabel(item) : "—"}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {item.statusPernikahan ? (
                        <span className="text-[11px] text-muted-foreground">
                          {item.statusPernikahan}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground/70">
                          Status ortu —
                        </span>
                      )}
                      {item.fotoRumah && (
                        <>
                          <span className="text-border">·</span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <HomeIcon className="size-3" />
                            Foto rumah
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="hidden sm:flex sm:flex-col sm:gap-1.5">
                    <CompletenessBadge completeness={completeness} />
                    {attention && item.kondisiKeluarga ? (
                      <Badge
                        variant="secondary"
                        className="w-fit border-amber-500/25 bg-amber-500/10 text-[10px] font-medium text-amber-700 dark:text-amber-400"
                      >
                        {item.kondisiKeluarga}
                      </Badge>
                    ) : attention && item.statusPernikahan ? (
                      <Badge
                        variant="secondary"
                        className="w-fit border-amber-500/25 bg-amber-500/10 text-[10px] font-medium text-amber-700 dark:text-amber-400"
                      >
                        Perhatian
                      </Badge>
                    ) : null}
                    <div className="h-1 w-full max-w-[120px] overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          completeness.isComplete
                            ? "bg-emerald-500/80"
                            : completeness.percent >= 50
                              ? "bg-primary/70"
                              : "bg-muted-foreground/40"
                        )}
                        style={{ width: `${completeness.percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="hidden justify-end opacity-70 transition-opacity group-hover:opacity-100 sm:flex">
                    <BiodataSiswaActions biodata={item} />
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full border border-dashed bg-muted/30">
              <UsersIcon className="size-6 text-muted-foreground/60" />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold">
                {q ? "Tidak ada berkas yang cocok" : "Roster masih kosong"}
              </p>
              <p className="mx-auto max-w-sm text-xs text-muted-foreground sm:text-sm">
                {q
                  ? `Tidak ditemukan biodata untuk "${q}". Coba kata kunci lain atau reset filter.`
                  : "Tambahkan biodata siswa secara manual atau impor massal untuk mulai mengisi arsip kelas."}
              </p>
            </div>
            {!q && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <BiodataSiswaImportDialog kelasList={kelasList} />
                <BiodataSiswaCreateDialog />
              </div>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className="border-t px-4 py-3 sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-center text-[11px] text-muted-foreground sm:text-left sm:text-xs">
                Menampilkan {startIndex + 1}–
                {Math.min(startIndex + PAGE_SIZE, totalFiltered)} dari {totalFiltered}{" "}
                berkas
              </p>
              <nav className="flex items-center gap-1" aria-label="pagination">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={safePage === 1}
                  onClick={() => handlePageChange(safePage - 1)}
                  className="text-xs"
                >
                  Prev
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - safePage) <= 1
                  )
                  .map((p) => (
                    <Button
                      key={p}
                      variant={p === safePage ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handlePageChange(p)}
                      className="text-xs min-w-[32px]"
                    >
                      {p}
                    </Button>
                  ))}
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={safePage === totalPages}
                  onClick={() => handlePageChange(safePage + 1)}
                  className="text-xs"
                >
                  Next
                </Button>
              </nav>
            </div>
          </div>
        )}
      </section>

      <p className="text-xs text-muted-foreground">
        Tip: status &quot;Perlu perhatian&quot; muncul jika ada kondisi keluarga khusus atau
        status orang tua cerai.
      </p>
    </div>
  )
}
