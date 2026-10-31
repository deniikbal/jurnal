import type { Metadata } from "next"
import { SchoolIcon, UsersIcon, UserCheckIcon, LayersIcon } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
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
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Kelas"
        description="Kelola rombongan belajar, wali kelas, dan daftar siswa per kelas. Data siswa otomatis terhubung ke jurnal dan presensi."
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total kelas"
          value={totalKelas}
          hint="Rombongan belajar aktif"
          icon={SchoolIcon}
          emphasis
        />
        <StatCard
          label="Siswa aktif"
          value={totalSiswa}
          hint={`Rata-rata ${avgSiswaPerKelas} per kelas`}
          icon={UsersIcon}
        />
        <StatCard
          label="Punya wali"
          value={`${withWali} / ${totalKelas}`}
          hint={
            tanpaWali > 0
              ? `${tanpaWali} kelas belum ditentukan`
              : "Semua kelas sudah punya wali"
          }
          icon={UserCheckIcon}
        />
        <StatCard
          label="Kapasitas rata-rata"
          value={avgSiswaPerKelas}
          hint="Siswa per kelas saat ini"
          icon={LayersIcon}
        />
      </section>

      <KelasTableClient daftarKelas={daftarKelas} daftarSiswa={siswaAktif} />
    </div>
  )
}
