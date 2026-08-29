"use client"

import { useEffect } from "react"
import { AlertTriangleIcon, RotateCcwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function PenilaianError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Gagal memuat halaman penilaian:", error)
  }, [error])

  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-md border border-border bg-card px-6 py-16 text-center"
      role="alert"
    >
      <AlertTriangleIcon
        className="size-8 text-destructive"
        aria-hidden
      />
      <div className="space-y-1.5">
        <h1 className="text-base font-semibold text-foreground">
          Gagal memuat halaman penilaian
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Terjadi kesalahan saat mengambil data. Coba muat ulang, atau
          hubungi admin kalau masalah terus muncul.
        </p>
      </div>
      {error.digest ? (
        <p className="font-mono text-[11px] text-muted-foreground">
          Kode: {error.digest}
        </p>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={reset}
        className="gap-1.5"
      >
        <RotateCcwIcon className="size-3.5" />
        Muat ulang
      </Button>
    </div>
  )
}
