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

  const totalKelas = daftarKelas.length
  const totalSiswa = daftarSiswa.length
  const avgSiswaPerKelas =
    totalKelas > 0 ? Math.round((totalSiswa / totalKelas) * 10) / 10 : 0
  const withWali = daftarKelas.filter((item) => item.waliKelas).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Data kesiswaan
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Kelas</h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Kelola rombongan belajar, wali kelas, dan daftar siswa per kelas.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4 sm:gap-x-8">
          <div>
            <dt className="text-[11px] text-muted-foreground">Total kelas</dt>
            <dd className="font-semibold tabular-nums text-foreground">{totalKelas}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Total siswa</dt>
            <dd className="font-semibold tabular-nums text-foreground">{totalSiswa}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Rata-rata / kelas</dt>
            <dd className="font-semibold tabular-nums text-foreground">
              {totalKelas > 0 ? avgSiswaPerKelas : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Punya wali</dt>
            <dd className="font-semibold tabular-nums text-foreground">
              {withWali}
              <span className="mx-1 font-normal text-muted-foreground">/</span>
              {totalKelas}
            </dd>
          </div>
        </dl>
      </div>

      <KelasTableClient daftarKelas={daftarKelas} daftarSiswa={daftarSiswa} />
    </div>
  )
}
