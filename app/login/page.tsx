import type { Metadata } from "next"
import Link from "next/link"
import { GraduationCapIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Masuk",
}

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

      <main className="flex flex-1 items-center justify-center px-6 py-12 sm:py-16">
        <div className="w-full max-w-sm">
          <div className="mb-6 space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Masuk ke akun Anda
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Gunakan akun yang diberikan administrator sekolah.
            </p>
          </div>

          <Card>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Lupa password atau belum punya akun? Hubungi administrator sekolah.
          </p>
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
