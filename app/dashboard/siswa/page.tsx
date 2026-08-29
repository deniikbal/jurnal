import type { Metadata } from "next"

import { SiswaTableClient } from "@/components/siswa-table-client"
import { getKelasForCurrentUser, getSiswaForCurrentUser } from "@/lib/dal"

export const metadata: Metadata = {
  title: "Siswa",
}

function StatCard({
  label,
  value,
  emphasis = false,
}: {
  label: string
  value: number | string
  emphasis?: boolean
}) {
  return (
    <div
      className={
        emphasis
          ? "rounded-md border border-primary/20 bg-primary/5 px-4 py-3"
          : "rounded-md border border-border bg-card px-4 py-3"
      }
    >
      <p
        className={
          emphasis
            ? "text-[11px] font-medium tracking-wide text-primary uppercase"
            : "text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
        }
      >
        {label}
      </p>
      <p
        className={
          emphasis
            ? "mt-1 font-mono text-2xl font-semibold tabular-nums text-primary"
            : "mt-1 font-mono text-xl font-semibold tabular-nums text-foreground"
        }
      >
        {value}
      </p>
    </div>
  )
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
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Siswa
        </h1>
        <p className="text-sm text-muted-foreground">
          Daftar siswa per kelas: NIS, jenis kelamin, dan status keaktifan.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatCard label="Total Siswa" value={totalSiswa} emphasis />
        <StatCard label="Aktif" value={totalAktif} />
        <StatCard label="Laki-laki" value={totalLaki} />
        <StatCard label="Perempuan" value={totalPerempuan} />
      </dl>

      {totalKeluar > 0 ? (
        <p className="text-xs text-muted-foreground">
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
