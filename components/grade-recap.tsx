"use client"

import { Fragment, useMemo, useState } from "react"
import { ClipboardListIcon, FileSpreadsheetIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Classroom = {
  id: string
  name: string
}

type Subject = {
  id: string
  name: string
}

type Student = {
  id: string
  name: string
  nis: string | null
  classroomId: string
  status: "aktif" | "keluar"
}

type Assessment = {
  id: string
  title: string
  date: string | null
  gradeWeightId: string
  gradeWeightName: string
  classroomId: string
  subjectId: string
}

type Grade = {
  assessmentId: string
  siswaId: string
  score: number
}

type GradeWeight = {
  id: string
  name: string
  weight: number
  subjectId: string
  status: string
}

type GradeRecapProps = {
  classrooms: Classroom[]
  subjects: Subject[]
  students: Student[]
  assessments: Assessment[]
  grades: Grade[]
  gradeWeights: GradeWeight[]
}

const collator = new Intl.Collator("id-ID", { numeric: true, sensitivity: "base" })

function fmt(value: number | null) {
  if (value === null) return "—"
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

export function GradeRecap({
  classrooms,
  subjects,
  students,
  assessments,
  grades,
  gradeWeights,
}: GradeRecapProps) {
  const sortedClassrooms = useMemo(
    () => [...classrooms].sort((a, b) => collator.compare(a.name, b.name)),
    [classrooms],
  )
  const sortedSubjects = useMemo(
    () => [...subjects].sort((a, b) => collator.compare(a.name, b.name)),
    [subjects],
  )

  const [classroomId, setClassroomId] = useState(sortedClassrooms[0]?.id ?? "")
  const [subjectId, setSubjectId] = useState("")

  const classroomAssessments = useMemo(
    () => assessments.filter((a) => a.classroomId === classroomId),
    [assessments, classroomId],
  )

  const subjectOptions = useMemo(() => {
    const ids = new Set(classroomAssessments.map((a) => a.subjectId))
    return sortedSubjects.filter((s) => ids.has(s.id))
  }, [sortedSubjects, classroomAssessments])

  const effectiveSubjectId =
    subjectId && subjectOptions.some((s) => s.id === subjectId)
      ? subjectId
      : (subjectOptions[0]?.id ?? "")

  const selectedSubject = subjects.find((s) => s.id === effectiveSubjectId)

  const weights = useMemo(
    () =>
      gradeWeights
        .filter((w) => w.status === "aktif" && w.subjectId === effectiveSubjectId)
        .sort((a, b) => collator.compare(a.name, b.name)),
    [gradeWeights, effectiveSubjectId],
  )

  const recappedAssessments = useMemo(
    () => classroomAssessments.filter((a) => a.subjectId === effectiveSubjectId),
    [classroomAssessments, effectiveSubjectId],
  )

  const columns = useMemo(
    () =>
      weights.map((weight) => ({
        weight,
        assessments: recappedAssessments
          .filter((a) => a.gradeWeightId === weight.id)
          .sort(
            (a, b) =>
              (a.date ?? "").localeCompare(b.date ?? "") || collator.compare(a.title, b.title),
          ),
      })),
    [weights, recappedAssessments],
  )

  const gradesByAssessment = useMemo(() => {
    const map = new Map<string, Grade[]>()
    for (const g of grades) {
      const list = map.get(g.assessmentId) ?? []
      list.push(g)
      map.set(g.assessmentId, list)
    }
    return map
  }, [grades])

  const classStudents = useMemo(
    () =>
      students
        .filter((s) => s.status === "aktif" && s.classroomId === classroomId)
        .sort((a, b) => collator.compare(a.name, b.name)),
    [students, classroomId],
  )

  const rows = useMemo(() => {
    return classStudents.map((student) => {
      const weightResults = columns.map((col) => {
        const values = col.assessments.map((a) => {
          const score = gradesByAssessment.get(a.id)?.find((g) => g.siswaId === student.id)?.score ?? 0
          return score > 0 ? score : null
        })
        const filled = values.filter((v): v is number => v !== null)
        const avg = filled.length ? filled.reduce((s, v) => s + v, 0) / filled.length : null
        return { values, avg }
      })

      const filledPairs = columns
        .map((col, index) => [col.weight.weight, weightResults[index].avg] as const)
        .filter(([, avg]) => avg !== null) as [number, number][]

      const finalScore =
        filledPairs.length > 0
          ? filledPairs.reduce((sum, [w, avg]) => sum + w * avg, 0) /
            filledPairs.reduce((sum, [w]) => sum + w, 0)
          : null

      return { student, weightResults, finalScore }
    })
  }, [classStudents, columns, gradesByAssessment])

  const scoredRows = rows.filter((r) => r.finalScore !== null)
  const classAverage =
    scoredRows.length > 0
      ? scoredRows.reduce((sum, r) => sum + r.finalScore!, 0) / scoredRows.length
      : null
  const classHighest = scoredRows.length ? Math.max(...scoredRows.map((r) => r.finalScore!)) : null
  const classLowest = scoredRows.length ? Math.min(...scoredRows.map((r) => r.finalScore!)) : null

  const classAverageByColumn = columns.map((col, colIndex) =>
    col.assessments.map((_, assIndex) => {
      const vals = rows
        .map((r) => r.weightResults[colIndex].values[assIndex])
        .filter((v): v is number => v !== null)
      return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null
    }),
  )

  const classAverageByWeight = columns.map((col, colIndex) => {
    const avgs = rows
      .map((r) => r.weightResults[colIndex].avg)
      .filter((a): a is number => a !== null)
    return avgs.length ? avgs.reduce((s, a) => s + a, 0) / avgs.length : null
  })

  const selectedClassName =
    sortedClassrooms.find((c) => c.id === classroomId)?.name ?? "Kelas"

  function handleClassroomChange(value: string) {
    setClassroomId(value)
    setSubjectId("")
  }

  return (
    <section className="overflow-hidden rounded-md border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Rekap nilai</h2>
          <p className="text-xs text-muted-foreground">
            Nilai akhir berbobot per siswa · {selectedClassName}
            {selectedSubject ? ` · ${selectedSubject.name}` : ""}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={classroomId} onValueChange={handleClassroomChange}>
            <SelectTrigger
              className="h-9 w-full text-sm shadow-none sm:w-40"
              aria-label="Filter kelas rekap"
            >
              <SelectValue placeholder="Pilih kelas" />
            </SelectTrigger>
            <SelectContent>
              {sortedClassrooms.map((classroom) => (
                <SelectItem key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={effectiveSubjectId} onValueChange={setSubjectId}>
            <SelectTrigger
              className="h-9 w-full text-sm shadow-none sm:w-48"
              aria-label="Filter mapel rekap"
            >
              <SelectValue placeholder="Pilih mapel" />
            </SelectTrigger>
            <SelectContent>
              {subjectOptions.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild variant="outline" size="default" className="h-9 text-sm">
            <a href="/api/rekap-nilai/export">
              <FileSpreadsheetIcon />
              Export Excel
            </a>
          </Button>
        </div>
      </div>

      <dl className="grid grid-cols-3 divide-x divide-border border-b border-border text-center">
        <div className="px-2 py-3">
          <dt className="text-[11px] text-muted-foreground">Rata-rata kelas</dt>
          <dd className="text-sm font-semibold tabular-nums text-foreground">
            {fmt(classAverage)}
          </dd>
        </div>
        <div className="px-2 py-3">
          <dt className="text-[11px] text-muted-foreground">Tertinggi</dt>
          <dd className="text-sm font-semibold tabular-nums text-foreground">
            {fmt(classHighest)}
          </dd>
        </div>
        <div className="px-2 py-3">
          <dt className="text-[11px] text-muted-foreground">Terendah</dt>
          <dd className="text-sm font-semibold tabular-nums text-foreground">
            {fmt(classLowest)}
          </dd>
        </div>
      </dl>

      {classroomAssessments.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-14 text-center">
          <ClipboardListIcon className="size-7 text-muted-foreground/35" />
          <p className="text-sm text-muted-foreground">Belum ada penilaian untuk kelas ini.</p>
        </div>
      ) : weights.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-14 text-center">
          <ClipboardListIcon className="size-7 text-muted-foreground/35" />
          <p className="text-sm text-muted-foreground">
            Belum ada komponen bobot nilai untuk mapel ini.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead
                  rowSpan={2}
                  className="w-10 pl-5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
                >
                  No
                </TableHead>
                <TableHead
                  rowSpan={2}
                  className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
                >
                  NIS
                </TableHead>
                <TableHead
                  rowSpan={2}
                  className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
                >
                  Nama
                </TableHead>
                {columns.map((col) => (
                  <TableHead
                    key={col.weight.id}
                    colSpan={col.assessments.length + 1}
                    className="border-l border-border text-center text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
                  >
                    <div>{col.weight.name}</div>
                    <div className="font-normal text-muted-foreground/70">{col.weight.weight}%</div>
                  </TableHead>
                ))}
                <TableHead
                  rowSpan={2}
                  className="pr-5 text-right text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
                >
                  Nilai Akhir
                </TableHead>
              </TableRow>
              <TableRow className="hover:bg-transparent">
                {columns.map((col) => (
                  <Fragment key={col.weight.id}>
                    {col.assessments.map((a) => (
                      <TableHead
                        key={a.id}
                        className="border-l border-border text-center text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
                      >
                        {a.title}
                      </TableHead>
                    ))}
                    <TableHead className="text-center text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      Rata²
                    </TableHead>
                  </Fragment>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={row.student.id}>
                  <TableCell className="pl-5 text-xs tabular-nums text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-xs tabular-nums text-muted-foreground">
                    {row.student.nis ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-foreground">
                    {row.student.name}
                  </TableCell>
                  {row.weightResults.map((wr, i) => (
                    <Fragment key={columns[i].weight.id}>
                      {wr.values.map((value, j) => (
                        <TableCell
                          key={columns[i].assessments[j].id}
                          className="border-l border-border text-center text-xs tabular-nums text-foreground"
                        >
                          {fmt(value)}
                        </TableCell>
                      ))}
                      <TableCell className="text-center text-xs font-medium tabular-nums text-foreground">
                        {fmt(wr.avg)}
                      </TableCell>
                    </Fragment>
                  ))}
                  <TableCell className="pr-5 text-right text-sm font-semibold tabular-nums text-foreground">
                    {fmt(row.finalScore)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t-2 border-border bg-muted/40 hover:bg-muted/40">
                <TableCell className="pl-5 text-xs font-medium text-foreground" colSpan={3}>
                  Rata-rata kelas
                </TableCell>
                {columns.map((col, i) => (
                  <Fragment key={col.weight.id}>
                    {col.assessments.map((a, j) => (
                      <TableCell
                        key={a.id}
                        className="border-l border-border text-center text-xs tabular-nums text-muted-foreground"
                      >
                        {fmt(classAverageByColumn[i]?.[j] ?? null)}
                      </TableCell>
                    ))}
                    <TableCell className="text-center text-xs font-medium tabular-nums text-foreground">
                      {fmt(classAverageByWeight[i] ?? null)}
                    </TableCell>
                  </Fragment>
                ))}
                <TableCell className="pr-5 text-right text-sm font-semibold tabular-nums text-foreground">
                  {fmt(classAverage)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  )
}
