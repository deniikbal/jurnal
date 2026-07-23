import type { Metadata } from "next"
import Link from "next/link"

import { BiodataPublicForm } from "@/components/biodata-public-form"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Biodata Siswa",
  description: "Isi biodata siswa secara mandiri.",
}

export default function BiodataPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Biodata Siswa</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Isi atau perbarui biodata kamu secara mandiri.
          </p>
        </div>
        <BiodataPublicForm />
        <div className="mt-6 text-center">
          <Button asChild variant="link" size="sm">
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
