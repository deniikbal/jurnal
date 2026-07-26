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
  const subjectsWithWeight = subjectTotals.size

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Penilaian
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Bobot nilai</h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Atur komponen penilaian per mapel. Idealnya total bobot aktif tiap mapel = 100%.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4 sm:gap-x-8">
          <div>
            <dt className="text-[11px] text-muted-foreground">Total komponen</dt>
            <dd className="font-semibold tabular-nums text-foreground">{weights.length}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Aktif</dt>
            <dd className="font-semibold tabular-nums text-foreground">{activeWeights.length}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Mapel terisi</dt>
            <dd className="font-semibold tabular-nums text-foreground">{subjectsWithWeight}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Belum 100%</dt>
            <dd className="font-semibold tabular-nums text-foreground">
              {incompleteSubjects}
              {activeWeights.length > 0 ? (
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  · Σ {totalActiveWeight}%
                </span>
              ) : null}
            </dd>
          </div>
        </dl>
      </div>

      <GradeWeightTableClient weights={weights} subjects={subjects} />
    </div>
  )
}
