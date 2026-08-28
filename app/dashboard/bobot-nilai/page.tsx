import type { Metadata } from "next"

import { GradeWeightTableClient } from "@/components/grade-weight-table-client"
import { getGradeWeightsForCurrentUser, getSubjectsForCurrentUser } from "@/lib/dal"

export const metadata: Metadata = { title: "Bobot Nilai" }

export default async function GradeWeightPage() {
  const [weights, subjects] = await Promise.all([
    getGradeWeightsForCurrentUser(),
    getSubjectsForCurrentUser(),
  ])

  const activeWeights = weights.filter((item) => item.status === "aktif")
  const totalActiveWeight = activeWeights.reduce((total, item) => total + item.weight, 0)

  const subjectTotals = new Map<string, number>()
  for (const item of activeWeights) {
    subjectTotals.set(item.subjectId, (subjectTotals.get(item.subjectId) ?? 0) + item.weight)
  }

  const incompleteSubjects = Array.from(subjectTotals.values()).filter(
    (total) => total !== 100,
  ).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Bobot nilai
          </h1>
          <p className="text-sm text-muted-foreground">
            Atur komponen penilaian per mapel. Total bobot aktif tiap mapel = 100%.
          </p>
        </div>

        {incompleteSubjects > 0 && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{incompleteSubjects}</span> mapel
            belum 100%
          </p>
        )}
      </div>

      <GradeWeightTableClient weights={weights} subjects={subjects} />
    </div>
  )
}
