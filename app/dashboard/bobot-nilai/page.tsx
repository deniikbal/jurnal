import type { Metadata } from "next"
import {
  PercentIcon,
  ScaleIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { GradeWeightTableClient } from "@/components/grade-weight-table-client"
import {
  getGradeWeightsForCurrentUser,
  getSubjectsForCurrentUser,
} from "@/lib/dal"

export const metadata: Metadata = { title: "Bobot Nilai" }

export default async function GradeWeightPage() {
  const [weights, subjects] = await Promise.all([
    getGradeWeightsForCurrentUser(),
    getSubjectsForCurrentUser(),
  ])

  const activeWeights = weights.filter((item) => item.status === "aktif")
  const inactiveWeights = weights.filter((item) => item.status !== "aktif")
  const totalActiveWeight = activeWeights.reduce(
    (total, item) => total + item.weight,
    0
  )

  const subjectTotals = new Map<string, number>()
  for (const item of activeWeights) {
    subjectTotals.set(
      item.subjectId,
      (subjectTotals.get(item.subjectId) ?? 0) + item.weight
    )
  }

  const incompleteSubjects = Array.from(subjectTotals.values()).filter(
    (total) => total !== 100
  ).length
  const completeSubjects = subjectTotals.size - incompleteSubjects
  const subjectsWithoutWeights = subjects.length - subjectTotals.size

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Bobot Nilai"
        description="Atur komponen penilaian per mapel. Total bobot aktif tiap mapel harus 100%."
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Komponen aktif"
          value={activeWeights.length}
          hint={`Total bobot ${totalActiveWeight}%`}
          icon={ScaleIcon}
          emphasis
        />
        <StatCard
          label="Mapel 100%"
          value={`${completeSubjects} / ${subjectTotals.size || 0}`}
          hint="Bobot lengkap"
          icon={CheckCircle2Icon}
        />
        <StatCard
          label="Belum 100%"
          value={incompleteSubjects}
          hint="Mapel perlu dilengkapi"
          icon={AlertTriangleIcon}
        />
        <StatCard
          label="Tanpa bobot"
          value={subjectsWithoutWeights}
          hint={
            inactiveWeights.length > 0
              ? `${inactiveWeights.length} komponen nonaktif`
              : "Semua komponen aktif"
          }
          icon={PercentIcon}
        />
      </section>

      {incompleteSubjects > 0 ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertTriangleIcon className="size-3.5 shrink-0" aria-hidden />
          {incompleteSubjects} mapel belum 100%. Lengkapi bobot sebelum menilai.
        </p>
      ) : null}

      <GradeWeightTableClient weights={weights} subjects={subjects} />
    </div>
  )
}
