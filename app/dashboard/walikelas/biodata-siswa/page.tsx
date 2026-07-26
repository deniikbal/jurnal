import type { Metadata } from "next"
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  getBiodataSiswaForCurrentUser,
  getKelasForCurrentUser,
} from "@/lib/dal"
import { cn } from "@/lib/utils"

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
  return query
    ? `/dashboard/walikelas/biodata-siswa?${query}`
    : "/dashboard/walikelas/biodata-siswa"
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
  const completeCount = biodataList.filter((item) => getCompleteness(item).isComplete).length
  const attentionCount = biodataList.filter((item) => isAttention(item)).length
  const incompleteCount = totalData - completeCount

  const filteredData = biodataList
    .filter((item) => {
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

  const totalFiltered = filteredData.length
  const totalPages = Math.max(Math.ceil(totalFiltered / PAGE_SIZE), 1)
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const paginatedData = filteredData.slice(startIndex, startIndex + PAGE_SIZE)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      {/* Quiet case-file header */}
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

      {/* Insight strip */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-sm border bg-card px-4 py-3">
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
        </div>
        <div className="rounded-sm border bg-card px-4 py-3">
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
        </div>
        <div className="rounded-sm border bg-card px-4 py-3">
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
        </div>
      </div>

      {/* Roster board */}
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
          <BiodataSiswaFilter q={q} filter={filter} />
        </div>

        {paginatedData.length > 0 ? (
          <div className="divide-y">
            {/* Desktop column hint */}
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
                  {/* Identity */}
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

                      {/* Mobile family + status */}
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

                  {/* Family (desktop) */}
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

                  {/* Status (desktop) */}
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

                  {/* Actions (desktop) */}
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
                  ? `Tidak ditemukan biodata untuk “${q}”. Coba kata kunci lain atau reset filter.`
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
              <Pagination className="mx-0 w-full justify-center sm:w-auto sm:justify-end">
                <PaginationContent className="gap-1">
                  <PaginationItem>
                    <PaginationPrevious
                      text="Prev"
                      href={createPageHref({
                        q,
                        filter,
                        page: Math.max(safePage - 1, 1),
                      })}
                      aria-disabled={safePage === 1}
                      className={cn(
                        "text-xs",
                        safePage === 1 && "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - safePage) <= 1
                    )
                    .map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href={createPageHref({ q, filter, page })}
                          isActive={page === safePage}
                          className="text-xs"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                  <PaginationItem>
                    <PaginationNext
                      text="Next"
                      href={createPageHref({
                        q,
                        filter,
                        page: Math.min(safePage + 1, totalPages),
                      })}
                      aria-disabled={safePage === totalPages}
                      className={cn(
                        "text-xs",
                        safePage === totalPages && "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </section>

      <p className="text-xs text-muted-foreground">
        Tip: status “Perlu perhatian” muncul jika ada kondisi keluarga khusus atau
        status orang tua cerai.
      </p>
    </div>
  )
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
