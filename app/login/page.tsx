import Link from "next/link"

import { LoginForm } from "./login-form"

export const metadata = {
  title: "Masuk",
}

export default function LoginPage() {
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(1_0_0/0.18),transparent_55%),radial-gradient(circle_at_bottom_left,oklch(1_0_0/0.1),transparent_50%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 top-1/3 size-96 rounded-full border border-primary-foreground/15"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-48 top-1/2 size-[28rem] rounded-full border border-primary-foreground/10"
        />

        <div className="relative flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary-foreground/15 backdrop-blur-sm">
            <span className="text-base font-semibold">J</span>
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Jurnal</p>
            <p className="text-xs text-primary-foreground/70">Kesiswaan</p>
          </div>
        </div>

        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs">
            <span className="size-1.5 rounded-full bg-primary-foreground" />
            Untuk guru dan administrator sekolah
          </div>
          <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
            Catat jurnal kelas,
            <br />
            tanpa ribet.
          </h1>
          <p className="max-w-md text-pretty text-sm leading-relaxed text-primary-foreground/75">
            Satu tempat untuk mengelola data siswa, jadwal mengajar, presensi
            harian, dan jurnal pembelajaran. Masuk dengan akun yang diberikan
            sekolah.
          </p>
        </div>

        <div className="relative grid grid-cols-3 gap-3 text-primary-foreground/85">
          <div className="rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 p-3">
            <p className="text-2xl font-semibold tabular-nums">1</p>
            <p className="text-[11px] leading-tight text-primary-foreground/70">
              tempat untuk semua catatan kelas
            </p>
          </div>
          <div className="rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 p-3">
            <p className="text-2xl font-semibold tabular-nums">4</p>
            <p className="text-[11px] leading-tight text-primary-foreground/70">
              modul: siswa, jadwal, presensi, jurnal
            </p>
          </div>
          <div className="rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 p-3">
            <p className="text-2xl font-semibold tabular-nums">∞</p>
            <p className="text-[11px] leading-tight text-primary-foreground/70">
              riwayat tersimpan dan siap diekspor
            </p>
          </div>
        </div>
      </aside>

      <section className="flex flex-col">
        <header className="flex items-center justify-between border-b border-border px-6 py-4 lg:border-b-0 lg:px-10">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="text-sm font-semibold">J</span>
            </div>
            <span className="text-sm font-semibold">Jurnal Kesiswaan</span>
          </div>
          <Link
            href="/"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Kembali ke beranda
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center px-6 py-10 lg:px-10">
          <div className="w-full max-w-sm space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Masuk ke akun Anda
              </h2>
              <p className="text-sm text-muted-foreground">
                Gunakan akun yang diberikan administrator sekolah.
              </p>
            </div>

            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  )
}
