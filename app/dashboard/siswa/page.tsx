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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Siswa</h1>
          <p className="text-sm text-muted-foreground">
            Daftar siswa per kelas — NIS, jenis kelamin, dan status keaktifan.
          </p>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">
            Total <span className="font-medium text-foreground">{totalSiswa}</span>
          </span>
          <span className="text-border">/</span>
          <span className="text-muted-foreground">
            Aktif <span className="font-medium text-foreground">{totalAktif}</span>
          </span>
          <span className="text-border">/</span>
          <span className="text-muted-foreground">
            L/P{" "}
            <span className="font-medium text-foreground">
              {totalLaki}/{totalPerempuan}
            </span>
          </span>
        </div>
      </div>

      <SiswaTableClient
        daftarSiswa={daftarSiswa}
        daftarKelas={daftarKelas}
        kelasById={kelasById}
      />
    </div>
  )
}
