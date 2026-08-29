import type { Metadata } from "next"

import { SubjectTableClient } from "@/components/subject-table-client"
import { getSubjectsForCurrentUser } from "@/lib/dal"

export const metadata: Metadata = {
  title: "Mata Pelajaran",
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

export default async function SubjectPage() {
  const subjects = await getSubjectsForCurrentUser()

  const totalSubjects = subjects.length
  const totalAktif = subjects.filter((item) => item.status === "aktif").length
  const totalNonaktif = totalSubjects - totalAktif

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Mata pelajaran
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola mapel, kode, dan status aktif untuk jadwal serta jurnal.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-2 sm:max-w-md">
        <StatCard label="Total Mapel" value={totalSubjects} emphasis />
        <StatCard label="Aktif" value={totalAktif} />
      </dl>

      {totalNonaktif > 0 ? (
        <p className="text-xs text-muted-foreground">
          {totalNonaktif} mapel berstatus nonaktif tidak ditampilkan di ringkasan.
        </p>
      ) : null}

      <SubjectTableClient subjects={subjects} />
    </div>
  )
}
