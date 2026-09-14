import type { Metadata } from "next"
import { PercentIcon, ScaleIcon, AlertTriangleIcon, CheckCircle2Icon } from "lucide-react"

import { GradeWeightTableClient } from "@/components/grade-weight-table-client"
import { getGradeWeightsForCurrentUser, getSubjectsForCurrentUser } from "@/lib/dal"

export const metadata: Metadata = { title: "Bobot Nilai" }

export default async function GradeWeightPage() {
  const [weights, subjects] = await Promise.all([
    getGradeWeightsForCurrentUser(),
    getSubjectsForCurrentUser(),
  ])

  const activeWeights = weights.filter((item) => item.status === "aktif")
  const inactiveWeights = weights.filter((item) => item.status !== "aktif")
  const totalActiveWeight = activeWeights.reduce((total, item) => total + item.weight, 0)

  const subjectTotals = new Map<string, number>()
  for (const item of activeWeights) {
    subjectTotals.set(item.subjectId, (subjectTotals.get(item.subjectId) ?? 0) + item.weight)
  }

  const incompleteSubjects = Array.from(subjectTotals.values()).filter(
    (total) => total !== 100,
  ).length
  const completeSubjects = subjectTotals.size - incompleteSubjects
  const subjectsWithoutWeights = subjects.length - subjectTotals.size

  return (
    <div className="flex flex-col gap-8">
      <section className="relative border-4 border-foreground bg-primary p-6 text-primary-foreground shadow-[6px_6px_0px_0px_var(--foreground)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-block border-2 border-foreground bg-background px-2.5 py-1 text-[11px] font-bold tracking-wider text-foreground uppercase">
              Konfigurasi penilaian
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Bobot Nilai
            </h1>
            <p className="max-w-lg text-sm font-medium text-primary-foreground/85">
              Atur komponen penilaian per mapel. Total bobot aktif tiap mapel =
              100%.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 border-2 border-foreground bg-background px-3 py-2 text-foreground">
              <span className="size-3 bg-foreground" aria-hidden />
              <span className="text-[11px] font-bold tracking-wider uppercase">
                Komponen Aktif
              </span>
              <span className="border-2 border-foreground bg-foreground px-2 py-0.5 text-xs font-extrabold tabular-nums text-background">
                {activeWeights.length}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="inline-block border-b-4 border-foreground pb-1 text-sm font-extrabold tracking-wider text-foreground uppercase">
            Ringkasan
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-2 border-foreground bg-primary p-5 text-primary-foreground shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--foreground)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-wider text-primary-foreground/80 uppercase">
                  Komponen Aktif
                </p>
                <p className="text-5xl font-extrabold tabular-nums leading-none">
                  {activeWeights.length}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center border-2 border-foreground bg-background text-foreground">
                <ScaleIcon className="size-4" />
              </div>
            </div>
            <p className="mt-4 text-xs font-bold tracking-wider uppercase text-primary-foreground/80">
              Total bobot{" "}
              <span className="inline-block border-2 border-foreground bg-background px-1.5 py-0.5 font-extrabold tabular-nums text-foreground">
                {totalActiveWeight}%
              </span>
            </p>
          </div>

          <div className="border-2 border-foreground bg-secondary p-5 text-secondary-foreground shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--foreground)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-wider text-secondary-foreground/80 uppercase">
                  Mapel 100%
                </p>
                <p className="text-5xl font-extrabold tabular-nums leading-none">
                  {completeSubjects}
                  <span className="ml-1 text-base font-bold text-secondary-foreground/70">
                    / {subjectTotals.size || 0}
                  </span>
                </p>
              </div>
              <div className="flex size-10 items-center justify-center border-2 border-foreground bg-background text-foreground">
                <CheckCircle2Icon className="size-4" />
              </div>
            </div>
            <p className="mt-4 text-xs font-bold tracking-wider uppercase text-secondary-foreground/80">
              Bobot lengkap
            </p>
          </div>

          <div className="border-2 border-foreground bg-accent p-5 text-accent-foreground shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--foreground)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-wider text-accent-foreground/80 uppercase">
                  Belum 100%
                </p>
                <p className="text-5xl font-extrabold tabular-nums leading-none">
                  {incompleteSubjects}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center border-2 border-foreground bg-background text-foreground">
                <AlertTriangleIcon className="size-4" />
              </div>
            </div>
            <p className="mt-4 text-xs font-bold tracking-wider uppercase text-accent-foreground/80">
              Mapel perlu dilengkapi
            </p>
          </div>

          <div className="border-2 border-foreground bg-card p-5 text-foreground shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--foreground)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Tanpa Bobot
                </p>
                <p className="text-5xl font-extrabold tabular-nums leading-none">
                  {subjectsWithoutWeights}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center border-2 border-foreground bg-foreground text-background">
                <PercentIcon className="size-4" />
              </div>
            </div>
            <p className="mt-4 text-xs font-bold tracking-wider uppercase text-muted-foreground">
              {inactiveWeights.length > 0
                ? `${inactiveWeights.length} komponen nonaktif`
                : "Semua komponen aktif"}
            </p>
          </div>
        </div>
      </section>

      {incompleteSubjects > 0 ? (
        <div className="inline-flex items-center gap-2 self-start border-2 border-foreground bg-muted px-3 py-2 text-xs font-bold tracking-wider text-foreground uppercase">
          <AlertTriangleIcon className="size-3.5" aria-hidden />
          {incompleteSubjects} mapel belum 100% — lengkapi bobot sebelum menilai.
        </div>
      ) : null}

      <GradeWeightTableClient weights={weights} subjects={subjects} />
    </div>
  )
}
