import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"

import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import {
  BookOpenTextIcon,
  CalendarDaysIcon,
  ClipboardCheckIcon,
  UsersIcon,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Beranda",
}

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const features = [
    {
      icon: UsersIcon,
      title: "Data Siswa",
      desc: "Kelola biodata, kelas, dan status keaktifan setiap siswa.",
    },
    {
      icon: CalendarDaysIcon,
      title: "Jadwal Mengajar",
      desc: "Atur jadwal per hari, jam ke-4, dan mapel.",
    },
    {
      icon: ClipboardCheckIcon,
      title: "Presensi Harian",
      desc: "Isi absensi langsung dari jadwal hari ini.",
    },
    {
      icon: BookOpenTextIcon,
      title: "Jurnal Pembelajaran",
      desc: "Catat kegiatan belajar mengajar setiap sesi.",
    },
  ]

  return (
    <main className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <span className="text-sm font-semibold tracking-tight text-foreground">
          Jurnal Kesiswaan
        </span>
        <Button asChild variant="ghost" size="sm">
          <Link href={session?.user ? "/dashboard" : "/login"}>
            {session?.user ? "Dashboard" : "Masuk"}
          </Link>
        </Button>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:py-24">
        <div className="max-w-lg space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            Untuk guru dan administrator sekolah
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Catat jurnal kelas,
            <br />
            tanpa ribet.
          </h1>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
            Satu tempat untuk mengelola data siswa, jadwal, presensi, dan jurnal
            pembelajaran. Masuk dengan akun yang diberikan sekolah.
          </p>
        </div>

        <div className="mt-8">
          <Button asChild size="lg">
            <Link href={session?.user ? "/dashboard" : "/login"}>
              {session?.user ? "Buka Dashboard" : "Masuk Sekarang"}
            </Link>
          </Button>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Yang bisa dilakukan
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex gap-3 rounded-md border border-border bg-card p-4"
              >
                <f.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-foreground">{f.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
        Jurnal Kesiswaan &middot; Aplikasi untuk sekolah
      </footer>
    </main>
  )
}
