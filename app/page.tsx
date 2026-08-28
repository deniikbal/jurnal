import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"
import {
  ArrowRightIcon,
  BookOpenTextIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  ClipboardCheckIcon,
  GraduationCapIcon,
  PenLineIcon,
  UsersIcon,
} from "lucide-react"

import { auth } from "@/auth"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Beranda",
}

const modul = [
  {
    icon: UsersIcon,
    title: "Data siswa",
    desc: "Kelola biodata, kelas, dan status keaktifan setiap siswa dalam satu tempat.",
    bullets: ["Impor dari Excel", "Status aktif/keluar", "Relasi per kelas"],
  },
  {
    icon: CalendarDaysIcon,
    title: "Jadwal mengajar",
    desc: "Atur jadwal per hari, jam ke-, dan mata pelajaran tanpa spreadsheet.",
    bullets: ["Tampilan mingguan", "Filter per kelas", "Jam mulai & selesai"],
  },
  {
    icon: ClipboardCheckIcon,
    title: "Presensi harian",
    desc: "Isi absensi langsung dari jadwal hari ini. Hadir, sakit, izin, alfa.",
    bullets: ["Input cepat", "Rekap per kelas", "Siap diekspor"],
  },
  {
    icon: BookOpenTextIcon,
    title: "Jurnal pembelajaran",
    desc: "Catat kegiatan belajar mengajar setiap sesi. Materi, kegiatan, catatan.",
    bullets: ["Riwayat kronologis", "Per kelas & mapel", "Telusur berdasarkan tanggal"],
  },
]

const alur = [
  {
    step: "01",
    title: "Masuk dengan akun sekolah",
    desc: "Gunakan email dan password yang diberikan administrator.",
  },
  {
    step: "02",
    title: "Siapkan data kelas & mapel",
    desc: "Tambah kelas, daftarkan siswa, dan buat daftar mata pelajaran.",
  },
  {
    step: "03",
    title: "Atur jadwal mengajar",
    desc: "Isi jadwal per hari dan jam. Aplikasi otomatis mencocokkan.",
  },
  {
    step: "04",
    title: "Catat presensi & jurnal",
    desc: "Setiap sesi, presensi dan jurnal bisa diisi dalam hitungan detik.",
  },
]

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  const masukUrl = session?.user ? "/dashboard" : "/login"
  const masukLabel = session?.user ? "Buka dashboard" : "Masuk sekarang"

  return (
    <main className="flex min-h-svh flex-col bg-background">
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
          <nav aria-label="Navigasi utama" className="flex items-center gap-1">
            <a
              href="#modul"
              className="hidden rounded-sm px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:inline-flex"
            >
              Modul
            </a>
            <a
              href="#alur"
              className="hidden rounded-sm px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:inline-flex"
            >
              Alur
            </a>
            <Button asChild variant="ghost" size="sm" className="ml-1">
              <Link href={masukUrl}>
                {session?.user ? "Dashboard" : "Masuk"}
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,oklch(0.42_0.13_265/0.08),transparent_60%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 top-0 -z-10 size-[36rem] rounded-full bg-primary/5 blur-3xl"
        />
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-32">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              Untuk guru dan administrator sekolah
            </div>
            <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
              Catat jurnal kelas,
              <br />
              <span className="text-primary">tanpa ribet.</span>
            </h1>
            <p className="mt-5 max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
              Satu tempat untuk mengelola data siswa, jadwal mengajar, presensi
              harian, dan jurnal pembelajaran. Masuk dengan akun yang diberikan
              sekolah.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg">
                <Link href={masukUrl}>
                  {masukLabel}
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
              <a
                href="#modul"
                className="inline-flex items-center gap-1.5 px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Lihat modul
                <ArrowRightIcon className="size-3.5" />
              </a>
            </div>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute inset-x-6 top-6 -z-10 h-full rounded-2xl border border-border bg-card shadow-sm"
            />
            <div className="rounded-2xl border border-border bg-card p-1 shadow-sm">
              <div className="rounded-xl bg-background p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      Jurnal terbaru
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      5 entri terakhir
                    </p>
                  </div>
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                    Hari ini
                  </span>
                </div>
                <ol className="mt-4 space-y-3">
                  {[
                    { mapel: "Matematika", kelas: "X-1", materi: "Persamaan linear" },
                    { mapel: "Bahasa Indonesia", kelas: "X-2", materi: "Teks negosiasi" },
                    { mapel: "IPA", kelas: "IX-1", materi: "Sistem pencernaan" },
                  ].map((item, idx) => (
                    <li
                      key={item.mapel}
                      className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-3"
                    >
                      <div
                        className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                          idx === 0
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.mapel}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          Kelas {item.kelas} &middot; {item.materi}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
                  <div>
                    <p className="text-lg font-semibold tabular-nums text-foreground">
                      24
                    </p>
                    <p className="text-[11px] text-muted-foreground">Siswa</p>
                  </div>
                  <div className="border-x border-border">
                    <p className="text-lg font-semibold tabular-nums text-foreground">
                      3
                    </p>
                    <p className="text-[11px] text-muted-foreground">Kelas</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold tabular-nums text-foreground">
                      7
                    </p>
                    <p className="text-[11px] text-muted-foreground">Mapel</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="modul"
        className="border-t border-border bg-muted/30 py-20 sm:py-24"
      >
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Modul
            </p>
            <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Empat modul, satu alur kerja
            </h2>
            <p className="mt-3 text-pretty text-base text-muted-foreground">
              Setiap modul berdiri sendiri tapi saling terhubung. Data yang
              Anda masuk di satu modul langsung tersedia di modul lain.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {modul.map((item) => (
              <article
                key={item.title}
                className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="size-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
                <ul className="mt-4 space-y-1.5">
                  {item.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <CheckCircle2Icon className="size-3.5 shrink-0 text-primary/80" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="alur" className="py-20 sm:py-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Alur
            </p>
            <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Dari akun pertama sampai jurnal pertama
            </h2>
          </div>

          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {alur.map((item) => (
              <li
                key={item.step}
                className="relative rounded-xl border border-border bg-card p-5"
              >
                <span className="font-mono text-xs font-semibold tabular-nums text-primary">
                  {item.step}
                </span>
                <h3 className="mt-3 text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {item.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 py-20 sm:py-24">
        <div className="mx-auto w-full max-w-3xl px-6 text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Siap mencatat pembelajaran hari ini?
          </h2>
          <p className="mt-3 text-pretty text-base text-muted-foreground">
            Masuk dengan akun yang diberikan sekolah, dan mulai isi jurnal
            pertama Anda.
          </p>
          <div className="mt-7">
            <Button asChild size="lg">
              <Link href={masukUrl}>
                {masukLabel}
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
          <p>Jurnal Kesiswaan &middot; Aplikasi untuk sekolah</p>
          <p>Dibuat untuk pencatatan kelas yang lebih terstruktur.</p>
        </div>
      </footer>
    </main>
  )
}
