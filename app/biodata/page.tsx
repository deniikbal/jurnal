import type { Metadata } from "next"
import Link from "next/link"

import { BiodataPublicForm } from "@/components/biodata-public-form"

export const metadata: Metadata = {
  title: "Biodata Siswa",
  description: "Isi biodata siswa secara mandiri.",
}

export default function BiodataPage() {
  return (
    <main className="min-h-svh bg-background">
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="text-sm font-medium tracking-tight text-foreground hover:text-muted-foreground"
          >
            Jurnal
          </Link>
          <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
            Form mandiri
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 space-y-2 border-b border-border pb-6">
          <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Kesiswaan
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Biodata siswa
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
            Isi atau perbarui data pribadi dan keluarga. Mulai dengan memasukkan NIS
            yang terdaftar di sekolah.
          </p>
        </header>

        <BiodataPublicForm />
      </div>
    </main>
  )
}
