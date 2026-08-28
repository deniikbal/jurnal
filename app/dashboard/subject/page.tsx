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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Mata pelajaran
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola mapel, kode, dan status aktif untuk jadwal serta jurnal.
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{totalAktif}</span> dari{" "}
          <span className="font-medium text-foreground">{totalSubjects}</span> aktif
        </p>
      </div>

      <SubjectTableClient subjects={subjects} />
    </div>
  )
}
