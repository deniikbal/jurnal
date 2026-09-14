import type { Metadata } from "next"
import { UsersIcon, UserCheckIcon, MarsIcon, VenusIcon } from "lucide-react"

import { SiswaTableClient } from "@/components/siswa-table-client"
import { getKelasForCurrentUser, getSiswaForCurrentUser } from "@/lib/dal"

export const metadata: Metadata = {
  title: "Siswa",
}

export default async function SiswaPage() {
  const [daftarSiswa, daftarKelas] = await Promise.all([
    getSiswaForCurrentUser(),
    getKelasForCurrentUser(),
  ])

  const kelasById = new Map(daftarKelas.map((item) => [item.id, item]))

  const totalSiswa = daftarSiswa.length
  const totalAktif = daftarSiswa.filter((item) => item.status === "aktif").length
  const totalKeluar = daftarSiswa.filter((item) => item.status === "keluar").length
  const totalLaki = daftarSiswa.filter((item) => item.jenisKelamin === "laki-laki").length
  const totalPerempuan = daftarSiswa.filter(
    (item) => item.jenisKelamin === "perempuan",
  ).length

  return (
    <div className="flex flex-col gap-8">
      <section className="relative border-4 border-foreground bg-primary p-6 text-primary-foreground shadow-[6px_6px_0px_0px_var(--foreground)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-block border-2 border-foreground bg-background px-2.5 py-1 text-[11px] font-bold tracking-wider text-foreground uppercase">
              Database siswa
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Siswa
            </h1>
            <p className="max-w-lg text-sm font-medium text-primary-foreground/85">
              Daftar siswa per kelas: NIS, jenis kelamin, dan status keaktifan.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 border-2 border-foreground bg-background px-3 py-2 text-foreground">
              <span className="size-3 bg-foreground" aria-hidden />
              <span className="text-[11px] font-bold tracking-wider uppercase">
                Total Siswa
              </span>
              <span className="border-2 border-foreground bg-foreground px-2 py-0.5 text-xs font-extrabold tabular-nums text-background">
                {totalSiswa}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="inline-block border-b-4 border-foreground pb-1 text-sm font-extrabold tracking-wider text-foreground uppercase">
            Ringkasan
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-2 border-foreground bg-primary p-5 text-primary-foreground shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--foreground)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-wider text-primary-foreground/80 uppercase">
                  Total Siswa
                </p>
                <p className="text-5xl font-extrabold tabular-nums leading-none">
                  {totalSiswa}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center border-2 border-foreground bg-background text-foreground">
                <UsersIcon className="size-4" />
              </div>
            </div>
            <p className="mt-4 text-xs font-bold tracking-wider uppercase text-primary-foreground/80">
              Seluruh siswa terdaftar
            </p>
          </div>

          <div className="border-2 border-foreground bg-secondary p-5 text-secondary-foreground shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--foreground)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-wider text-secondary-foreground/80 uppercase">
                  Aktif
                </p>
                <p className="text-5xl font-extrabold tabular-nums leading-none">
                  {totalAktif}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center border-2 border-foreground bg-background text-foreground">
                <UserCheckIcon className="size-4" />
              </div>
            </div>
            <p className="mt-4 text-xs font-bold tracking-wider uppercase text-secondary-foreground/80">
              Siswa aktif saat ini
            </p>
          </div>

          <div className="border-2 border-foreground bg-accent p-5 text-accent-foreground shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--foreground)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-wider text-accent-foreground/80 uppercase">
                  Laki-laki
                </p>
                <p className="text-5xl font-extrabold tabular-nums leading-none">
                  {totalLaki}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center border-2 border-foreground bg-background text-foreground">
                <MarsIcon className="size-4" />
              </div>
            </div>
            <p className="mt-4 text-xs font-bold tracking-wider uppercase text-accent-foreground/80">
              {totalSiswa > 0
                ? `${Math.round((totalLaki / totalSiswa) * 100)}% dari total`
                : "Belum ada data"}
            </p>
          </div>

          <div className="border-2 border-foreground bg-card p-5 text-foreground shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--foreground)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Perempuan
                </p>
                <p className="text-5xl font-extrabold tabular-nums leading-none">
                  {totalPerempuan}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center border-2 border-foreground bg-foreground text-background">
                <VenusIcon className="size-4" />
              </div>
            </div>
            <p className="mt-4 text-xs font-bold tracking-wider uppercase text-muted-foreground">
              {totalSiswa > 0
                ? `${Math.round((totalPerempuan / totalSiswa) * 100)}% dari total`
                : "Belum ada data"}
            </p>
          </div>
        </div>
      </section>

      {totalKeluar > 0 ? (
        <div className="inline-flex items-center gap-2 self-start border-2 border-foreground bg-muted px-3 py-2 text-xs font-bold tracking-wider text-foreground uppercase">
          <span className="size-2 bg-foreground" aria-hidden />
          {totalKeluar} siswa berstatus keluar tidak ditampilkan di ringkasan.
        </div>
      ) : null}

      <SiswaTableClient
        daftarSiswa={daftarSiswa}
        daftarKelas={daftarKelas}
        kelasById={kelasById}
      />
    </div>
  )
}
