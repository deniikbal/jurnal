import type { Metadata } from "next"
import { SchoolIcon, UsersIcon, UserCheckIcon, LayersIcon } from "lucide-react"

import { KelasTableClient } from "@/components/kelas-table-client"
import { getKelasForCurrentUser, getSiswaForCurrentUser } from "@/lib/dal"

export const metadata: Metadata = {
  title: "Kelas",
}

export default async function KelasPage() {
  const [daftarKelas, daftarSiswa] = await Promise.all([
    getKelasForCurrentUser(),
    getSiswaForCurrentUser(),
  ])

  const siswaAktif = daftarSiswa.filter((item) => item.status === "aktif")
  const totalKelas = daftarKelas.length
  const totalSiswa = siswaAktif.length
  const avgSiswaPerKelas =
    totalKelas > 0 ? Math.round((totalSiswa / totalKelas) * 10) / 10 : 0
  const withWali = daftarKelas.filter((item) => item.waliKelas).length
  const tanpaWali = totalKelas - withWali

  return (
    <div className="flex flex-col gap-8">
      <section className="relative border-4 border-foreground bg-secondary p-6 text-secondary-foreground shadow-[6px_6px_0px_0px_var(--foreground)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-block border-2 border-foreground bg-background px-2.5 py-1 text-[11px] font-bold tracking-wider text-foreground uppercase">
              Manajemen kelas
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Kelas
            </h1>
            <p className="max-w-lg text-sm font-medium text-secondary-foreground/85">
              Kelola rombongan belajar, wali kelas, dan daftar siswa per kelas.
              Data siswa otomatis terhubung ke jurnal dan presensi.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 border-2 border-foreground bg-background px-3 py-2 text-foreground">
              <span className="size-3 bg-foreground" aria-hidden />
              <span className="text-[11px] font-bold tracking-wider uppercase">
                Rombel Aktif
              </span>
              <span className="border-2 border-foreground bg-foreground px-2 py-0.5 text-xs font-extrabold tabular-nums text-background">
                {totalKelas}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--foreground)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Total kelas
                </p>
                <p className="text-5xl font-extrabold tabular-nums leading-none text-foreground">
                  {totalKelas}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground">
                <SchoolIcon className="size-4" />
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              Rombongan belajar aktif
            </p>
          </div>

          <div className="border-2 border-foreground bg-secondary p-5 text-secondary-foreground shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--foreground)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-wider text-secondary-foreground/80 uppercase">
                  Siswa aktif
                </p>
                <p className="text-5xl font-extrabold tabular-nums leading-none">
                  {totalSiswa}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center border-2 border-foreground bg-background text-foreground">
                <UsersIcon className="size-4" />
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-secondary-foreground/85">
              Rata-rata{" "}
              <span className="inline-block border-2 border-foreground bg-background px-1.5 py-0.5 font-extrabold tabular-nums text-foreground">
                {avgSiswaPerKelas}
              </span>{" "}
              per kelas
            </p>
          </div>

          <div className="border-2 border-foreground bg-accent p-5 text-accent-foreground shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--foreground)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-wider text-accent-foreground/80 uppercase">
                  Punya wali
                </p>
                <p className="flex items-baseline gap-1.5 text-5xl font-extrabold tabular-nums leading-none">
                  {withWali}
                  <span className="border-2 border-foreground bg-background px-1.5 py-0.5 text-base font-extrabold text-foreground">
                    / {totalKelas}
                  </span>
                </p>
              </div>
              <div className="flex size-10 items-center justify-center border-2 border-foreground bg-background text-foreground">
                <UserCheckIcon className="size-4" />
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-accent-foreground/85">
              {tanpaWali > 0
                ? `${tanpaWali} kelas belum ditentukan`
                : "Semua kelas sudah punya wali"}
            </p>
          </div>

          <div className="border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--foreground)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Kapasitas rata-rata
                </p>
                <p className="text-5xl font-extrabold tabular-nums leading-none text-foreground">
                  {avgSiswaPerKelas}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center border-2 border-foreground bg-foreground text-background">
                <LayersIcon className="size-4" />
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              Siswa per kelas saat ini
            </p>
          </div>
        </div>
      </section>

      <KelasTableClient daftarKelas={daftarKelas} daftarSiswa={siswaAktif} />
    </div>
  )
}
