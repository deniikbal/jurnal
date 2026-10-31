import type { Metadata } from "next"
import Link from "next/link"
import { GraduationCapIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Masuk",
}

const ringkasan = [
  {
    nilai: "4",
    label: "modul: siswa, jadwal, presensi, jurnal",
  },
  {
    nilai: "1",
    label: "tempat untuk semua catatan kelas",
  },
  {
    nilai: "∞",
    label: "riwayat tersimpan dan siap diekspor",
  },
]

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col bg-muted/30">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GraduationCapIcon className="size-4" />
            </div>
            <div className="leading-tight">
              <span className="block text-sm font-semibold text-foreground">
                Jurnal
              </span>
              <span className="block text-[11px] text-muted-foreground">
                Kesiswaan
              </span>
            </div>
          </Link>
          <nav aria-label="Navigasi utama">
            <Link
              href="/"
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Beranda
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto grid w-full max-w-6xl items-center px-6 py-12 sm:py-16 lg:grid-cols-2 lg:gap-16">
          <section className="hidden flex-col gap-6 lg:flex">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              Untuk guru dan administrator sekolah
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl leading-[1.1] font-semibold tracking-tight text-balance text-foreground">
                Catat jurnal kelas,
                <br />
                tanpa ribet.
              </h1>
              <p className="max-w-md text-sm leading-relaxed text-pretty text-muted-foreground">
                Satu tempat untuk mengelola data siswa, jadwal mengajar,
                presensi harian, dan jurnal pembelajaran. Masuk dengan akun yang
                diberikan sekolah.
              </p>
            </div>

            <dl className="grid gap-3 sm:grid-cols-3">
              {ringkasan.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl bg-card p-4 ring-1 ring-foreground/10"
                >
                  <dt className="font-mono text-2xl font-semibold text-foreground tabular-nums">
                    {item.nilai}
                  </dt>
                  <dd className="mt-1 text-xs leading-snug text-muted-foreground">
                    {item.label}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="flex justify-center lg:justify-end">
            <div className="w-full max-w-sm">
              <div className="mb-6 space-y-1.5">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Masuk ke akun Anda
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Gunakan akun yang diberikan administrator sekolah.
                </p>
              </div>

              <Card>
                <CardContent>
                  <LoginForm />
                </CardContent>
              </Card>

              <p className="mt-6 text-center text-xs text-muted-foreground lg:text-left">
                Lupa password atau belum punya akun? Hubungi administrator
                sekolah.
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-border px-6 py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
          <p>Jurnal Kesiswaan &middot; Aplikasi untuk sekolah</p>
          <p>Dibuat untuk pencatatan kelas yang lebih terstruktur.</p>
        </div>
      </footer>
    </div>
  )
}
