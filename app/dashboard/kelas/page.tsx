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
      <section className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-primary/8 via-primary/3 to-transparent px-6 py-7 sm:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-16 size-56 rounded-full bg-primary/8 blur-2xl"
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Manajemen kelas
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Kelas
            </h1>
            <p className="max-w-lg text-sm text-muted-foreground">
              Kelola rombongan belajar, wali kelas, dan daftar siswa per kelas.
              Data siswa otomatis terhubung ke jurnal dan presensi.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Total kelas
                </p>
                <p className="text-3xl font-semibold tabular-nums text-foreground">
                  {totalKelas}
                </p>
              </div>
              <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <SchoolIcon className="size-4" />
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Rombongan belajar aktif
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Siswa aktif
                </p>
                <p className="text-3xl font-semibold tabular-nums text-foreground">
                  {totalSiswa}
                </p>
              </div>
              <div className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <UsersIcon className="size-4" />
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Rata-rata {avgSiswaPerKelas} per kelas
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Punya wali
                </p>
                <p className="text-3xl font-semibold tabular-nums text-foreground">
                  {withWali}
                  <span className="ml-1 text-base font-normal text-muted-foreground">
                    / {totalKelas}
                  </span>
                </p>
              </div>
              <div className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <UserCheckIcon className="size-4" />
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {tanpaWali > 0
                ? `${tanpaWali} kelas belum ditentukan`
                : "Semua kelas sudah punya wali"}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Kapasitas rata-rata
                </p>
                <p className="text-3xl font-semibold tabular-nums text-foreground">
                  {avgSiswaPerKelas}
                </p>
              </div>
              <div className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <LayersIcon className="size-4" />
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Siswa per kelas saat ini
            </p>
          </div>
        </div>
      </section>

      <KelasTableClient daftarKelas={daftarKelas} daftarSiswa={siswaAktif} />
    </div>
  )
}
