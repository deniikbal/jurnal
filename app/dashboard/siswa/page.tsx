import type { Metadata } from "next"
import { UsersIcon, UserCheckIcon, MarsIcon, VenusIcon } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
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

  const persen = (n: number) =>
    totalSiswa > 0 ? `${Math.round((n / totalSiswa) * 100)}% dari total` : "Belum ada data"

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Siswa"
        description="Daftar siswa per kelas: NIS, jenis kelamin, dan status keaktifan."
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total siswa"
          value={totalSiswa}
          hint="Seluruh siswa terdaftar"
          icon={UsersIcon}
          emphasis
        />
        <StatCard
          label="Aktif"
          value={totalAktif}
          hint="Siswa aktif saat ini"
          icon={UserCheckIcon}
        />
        <StatCard
          label="Laki-laki"
          value={totalLaki}
          hint={persen(totalLaki)}
          icon={MarsIcon}
        />
        <StatCard
          label="Perempuan"
          value={totalPerempuan}
          hint={persen(totalPerempuan)}
          icon={VenusIcon}
        />
      </section>

      {totalKeluar > 0 ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-muted-foreground" aria-hidden />
          {totalKeluar} siswa berstatus keluar tidak ditampilkan di ringkasan.
        </p>
      ) : null}

      <SiswaTableClient
        daftarSiswa={daftarSiswa}
        daftarKelas={daftarKelas}
        kelasById={kelasById}
      />
    </div>
  )
}
