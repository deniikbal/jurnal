import type { Metadata } from "next"

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
  const totalPerempuan = daftarSiswa.filter((item) => item.jenisKelamin === "perempuan").length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Data kesiswaan
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Siswa</h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Daftar siswa per kelas — NIS, jenis kelamin, dan status keaktifan.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4 sm:gap-x-8">
          <div>
            <dt className="text-[11px] text-muted-foreground">Total</dt>
            <dd className="font-semibold tabular-nums text-foreground">{totalSiswa}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Aktif</dt>
            <dd className="font-semibold tabular-nums text-foreground">{totalAktif}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Keluar</dt>
            <dd className="font-semibold tabular-nums text-foreground">{totalKeluar}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">L / P</dt>
            <dd className="font-semibold tabular-nums text-foreground">
              {totalLaki}
              <span className="mx-1 font-normal text-muted-foreground">/</span>
              {totalPerempuan}
            </dd>
          </div>
        </dl>
      </div>

      <SiswaTableClient
        daftarSiswa={daftarSiswa}
        daftarKelas={daftarKelas}
        kelasById={kelasById}
      />
    </div>
  )
}
