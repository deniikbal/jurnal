import type { Metadata } from "next"

import { SubjectTableClient } from "@/components/subject-table-client"
import { getSubjectsForCurrentUser } from "@/lib/dal"

export const metadata: Metadata = {
  title: "Mata Pelajaran",
}

export default async function SubjectPage() {
  const subjects = await getSubjectsForCurrentUser()

  const totalSubjects = subjects.length
  const totalAktif = subjects.filter((item) => item.status === "aktif").length
  const totalNonaktif = subjects.filter((item) => item.status === "nonaktif").length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Kurikulum
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Mata pelajaran
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Kelola mapel, kode, dan status aktif untuk jadwal serta jurnal.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3 sm:gap-x-8">
          <div>
            <dt className="text-[11px] text-muted-foreground">Total</dt>
            <dd className="font-semibold tabular-nums text-foreground">{totalSubjects}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Aktif</dt>
            <dd className="font-semibold tabular-nums text-foreground">{totalAktif}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Nonaktif</dt>
            <dd className="font-semibold tabular-nums text-foreground">{totalNonaktif}</dd>
          </div>
        </dl>
      </div>

      <SubjectTableClient subjects={subjects} />
    </div>
  )
}
