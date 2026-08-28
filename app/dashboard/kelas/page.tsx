import type { Metadata } from "next"

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

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Kelas</h1>
        <p className="text-sm text-muted-foreground">
          Kelola rombongan belajar, wali kelas, dan daftar siswa per kelas.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Total</span>
          <span className="font-medium tabular-nums text-foreground">{totalKelas}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Siswa</span>
          <span className="font-medium tabular-nums text-foreground">{totalSiswa}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Rata-rata/kelas</span>
          <span className="font-medium tabular-nums text-foreground">
            {totalKelas > 0 ? avgSiswaPerKelas : "—"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Punya wali</span>
          <span className="font-medium tabular-nums text-foreground">
            {withWali}/{totalKelas}
          </span>
        </div>
      </div>

      <KelasTableClient daftarKelas={daftarKelas} daftarSiswa={siswaAktif} />
    </div>
  )
}
