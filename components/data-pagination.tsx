"use client"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

/**
 * Daftar nomor halaman yang dipangkas: selalu tampilkan halaman pertama,
 * terakhir, dan tetangga halaman aktif, dengan elipsis sebagai pengganti
 * rentang yang dilewati.
 *
 * `page` dan `total` berbasis 1.
 */
export function pageRange(
  page: number,
  total: number
): (number | "ellipsis")[] {
  const range: (number | "ellipsis")[] = []
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - page) <= 1) {
      range.push(p)
    } else if (range[range.length - 1] !== "ellipsis") {
      range.push("ellipsis")
    }
  }
  return range
}

type DataPaginationProps = {
  /** Halaman aktif, berbasis 1. */
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

/**
 * Pagination siap pakai untuk tabel klien (state lokal).
 *
 * Menyeragamkan semua tabel yang sebelumnya merakit Pagination* sendiri,
 * termasuk perilaku elipsis. Untuk pagination berbasis URL (server), pakai
 * komponen Pagination* langsung dengan `href`.
 */
export function DataPagination({
  page,
  totalPages,
  onPageChange,
  className,
}: DataPaginationProps) {
  if (totalPages <= 1) return null

  const go = (next: number) => {
    const clamped = Math.min(Math.max(next, 1), totalPages)
    if (clamped !== page) onPageChange(clamped)
  }

  return (
    <Pagination className={className} aria-label="Navigasi halaman data">
      <PaginationContent className="gap-0.5">
        <PaginationItem>
          <PaginationPrevious
            text="Sebelumnya"
            href="#"
            aria-disabled={page <= 1}
            tabIndex={page <= 1 ? -1 : 0}
            className={
              page <= 1 ? "pointer-events-none text-xs opacity-50" : "text-xs"
            }
            onClick={(event) => {
              event.preventDefault()
              go(page - 1)
            }}
          />
        </PaginationItem>

        {pageRange(page, totalPages).map((item, index) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href="#"
                isActive={item === page}
                className="text-xs tabular-nums"
                onClick={(event) => {
                  event.preventDefault()
                  go(item)
                }}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            text="Berikutnya"
            href="#"
            aria-disabled={page >= totalPages}
            tabIndex={page >= totalPages ? -1 : 0}
            className={
              page >= totalPages
                ? "pointer-events-none text-xs opacity-50"
                : "text-xs"
            }
            onClick={(event) => {
              event.preventDefault()
              go(page + 1)
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
