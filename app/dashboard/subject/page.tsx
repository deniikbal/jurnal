import type { Metadata } from "next"
import { BookIcon, BookCheckIcon } from "lucide-react"

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
    <div className="flex flex-col gap-8">
      <section className="relative border-4 border-foreground bg-accent p-6 text-accent-foreground shadow-[6px_6px_0px_0px_var(--foreground)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-block border-2 border-foreground bg-background px-2.5 py-1 text-[11px] font-bold tracking-wider text-foreground uppercase">
              Manajemen mapel
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Mata Pelajaran
            </h1>
            <p className="max-w-lg text-sm font-medium text-accent-foreground/85">
              Kelola mapel, kode, dan status aktif untuk jadwal serta jurnal.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 border-2 border-foreground bg-background px-3 py-2 text-foreground">
              <span className="size-3 bg-foreground" aria-hidden />
              <span className="text-[11px] font-bold tracking-wider uppercase">
                Total Mapel
              </span>
              <span className="border-2 border-foreground bg-foreground px-2 py-0.5 text-xs font-extrabold tabular-nums text-background">
                {totalSubjects}
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
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="border-2 border-foreground bg-primary p-5 text-primary-foreground shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--foreground)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-wider text-primary-foreground/80 uppercase">
                  Total Mapel
                </p>
                <p className="text-5xl font-extrabold tabular-nums leading-none">
                  {totalSubjects}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center border-2 border-foreground bg-background text-foreground">
                <BookIcon className="size-4" />
              </div>
            </div>
            <p className="mt-4 text-xs font-bold tracking-wider uppercase text-primary-foreground/80">
              Seluruh mapel terdaftar
            </p>
          </div>

          <div className="border-2 border-foreground bg-secondary p-5 text-secondary-foreground shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--foreground)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-wider text-secondary-foreground/80 uppercase">
                  Aktif
                </p>
                <p className="text-5xl font-extrabold tabular-nums leading-none">
                  {totalAktif}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center border-2 border-foreground bg-background text-foreground">
                <BookCheckIcon className="size-4" />
              </div>
            </div>
            <p className="mt-4 text-xs font-bold tracking-wider uppercase text-secondary-foreground/80">
              {totalSubjects > 0
                ? `${Math.round((totalAktif / totalSubjects) * 100)}% aktif`
                : "Belum ada data"}
            </p>
          </div>

          <div className="border-2 border-foreground bg-card p-5 text-foreground shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--foreground)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Ber-kode
                </p>
                <p className="text-5xl font-extrabold tabular-nums leading-none">
                  {withKode}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center border-2 border-foreground bg-foreground text-background">
                <span className="font-mono text-xs font-extrabold">#</span>
              </div>
            </div>
            <p className="mt-4 text-xs font-bold tracking-wider uppercase text-muted-foreground">
              Mapel yang punya kode unik
            </p>
          </div>
        </div>
      </section>

      {totalNonaktif > 0 ? (
        <div className="inline-flex items-center gap-2 self-start border-2 border-foreground bg-muted px-3 py-2 text-xs font-bold tracking-wider text-foreground uppercase">
          <span className="size-2 bg-foreground" aria-hidden />
          {totalNonaktif} mapel berstatus nonaktif tidak ditampilkan di ringkasan.
        </div>
      ) : null}

      <SubjectTableClient subjects={subjects} />
    </div>
  )
}
