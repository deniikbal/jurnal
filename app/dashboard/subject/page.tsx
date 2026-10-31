import type { Metadata } from "next"
import { BookIcon, BookCheckIcon, HashIcon } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { SubjectTableClient } from "@/components/subject-table-client"
import { getSubjectsForCurrentUser } from "@/lib/dal"

export const metadata: Metadata = {
  title: "Mata Pelajaran",
}

export default async function SubjectPage() {
  const subjects = await getSubjectsForCurrentUser()

  const totalSubjects = subjects.length
  const totalAktif = subjects.filter((item) => item.status === "aktif").length
  const totalNonaktif = totalSubjects - totalAktif
  const withKode = subjects.filter((item) => item.kode).length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Mata Pelajaran"
        description="Kelola mapel, kode, dan status aktif untuk jadwal serta jurnal."
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Total mapel"
          value={totalSubjects}
          hint="Seluruh mapel terdaftar"
          icon={BookIcon}
          emphasis
        />
        <StatCard
          label="Aktif"
          value={totalAktif}
          hint={
            totalSubjects > 0
              ? `${Math.round((totalAktif / totalSubjects) * 100)}% aktif`
              : "Belum ada data"
          }
          icon={BookCheckIcon}
        />
        <StatCard
          label="Ber-kode"
          value={withKode}
          hint="Mapel yang punya kode unik"
          icon={HashIcon}
        />
      </section>

      {totalNonaktif > 0 ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-muted-foreground" aria-hidden />
          {totalNonaktif} mapel berstatus nonaktif tidak ditampilkan di ringkasan.
        </p>
      ) : null}

      <SubjectTableClient subjects={subjects} />
    </div>
  )
}
