"use client"

import { useMemo, useState } from "react"
import { useActionState, useEffect } from "react"
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  PlusIcon,
  SaveIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  saveAssessmentStandalone,
  type GradeActionState,
} from "@/lib/grade-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

type Subject = {
  id: string
  name: string
  kode: string
  status: "aktif" | "nonaktif"
}

type Classroom = {
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

type GradeWeight = {
  id: string
  name: string
  weight: number
  subjectId: string
  status: string
}

type Assessment = {
  id: string
  title: string
  description: string | null
  date: string | null
  gradeWeightId: string
  gradeWeightName: string
  subjectId: string
  subjectName: string
  subjectKode: string | null
  classroomId: string
  classroomName: string
}

type Grade = {
  assessmentId: string
  siswaId: string
  score: number
}

type PenilaianPageClientProps = {
  subjects: Subject[]
  classrooms: Classroom[]
  students: Student[]
  gradeWeights: GradeWeight[]
  assessments: Assessment[]
  grades: Grade[]
}

const initialState: GradeActionState = { success: false, message: "" }

const naturalCollator = new Intl.Collator("id-ID", {
  numeric: true,
  sensitivity: "base",
})

export function PenilaianPageClient({
  subjects,
  classrooms,
  students,
  gradeWeights,
  assessments,
  grades,
}: PenilaianPageClientProps) {
  const [subjectId, setSubjectId] = useState<string>("")
  const [classroomId, setClassroomId] = useState<string>("")
  const [gradeWeightId, setGradeWeightId] = useState<string>("")
  const [assessmentId, setAssessmentId] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const [scores, setScores] = useState<Record<string, string>>({})
  const [state, formAction, isPending] = useActionState(
    saveAssessmentStandalone,
    initialState,
  )

  const activeSubjects = useMemo(
    () => subjects.filter((s) => s.status === "aktif"),
    [subjects],
  )

  const activeWeights = useMemo(
    () => gradeWeights.filter((w) => w.status === "aktif" && w.subjectId === subjectId),
    [gradeWeights, subjectId],
  )

  const subjectAssessments = useMemo(
    () =>
      assessments
        .filter(
          (a) =>
            a.subjectId === subjectId &&
            a.classroomId === classroomId &&
            (gradeWeightId ? a.gradeWeightId === gradeWeightId : true),
        )
        .sort((a, b) =>
          (b.date ?? "").localeCompare(a.date ?? "") ||
          naturalCollator.compare(a.title, b.title),
        ),
    [assessments, subjectId, classroomId, gradeWeightId],
  )

  const selectedAssessment = useMemo(
    () => assessments.find((a) => a.id === assessmentId),
    [assessments, assessmentId],
  )

  const classroomStudents = useMemo(() => {
    if (!classroomId) return []
    return students
      .filter((s) => s.classroomId === classroomId && s.status === "aktif")
      .sort((a, b) => naturalCollator.compare(a.name, b.name))
  }, [students, classroomId])

  // Reset scores + assessment saat mapel/kelas/komponen berubah.
  useEffect(() => {
    setAssessmentId("")
    setTitle("")
    setScores({})
  }, [subjectId, classroomId, gradeWeightId])

  // Muat nilai existing saat assessment dipilih.
  useEffect(() => {
    if (!assessmentId) {
      setScores({})
      return
    }
    const initial: Record<string, string> = {}
    for (const student of classroomStudents) {
      const found = grades.find(
        (g) => g.assessmentId === assessmentId && g.siswaId === student.id,
      )
      initial[student.id] = found ? String(found.score) : ""
    }
    setScores(initial)
    const a = assessments.find((x) => x.id === assessmentId)
    if (a) setTitle(a.title)
  }, [assessmentId, classroomStudents, grades, assessments])

  useEffect(() => {
    if (!state.message) return
    if (state.success) {
      toast.success(state.message)
    } else {
      toast.error(state.message)
    }
  }, [state])

  function parseScore(value: string): number | null {
    const trimmed = value.trim()
    if (trimmed === "") return null
    const num = Number(trimmed)
    if (!Number.isFinite(num)) return null
    return Math.min(Math.max(Math.round(num), 0), 100)
  }

  function setStudentScore(studentId: string, value: string) {
    setScores((current) => ({ ...current, [studentId]: value }))
  }

  function isDinilai(studentId: string): boolean {
    const v = scores[studentId]
    // "Dinilai" = nilai numeric > 0. 0 dianggap "belum dinilai" karena
    // di praktik sekolah, 0 sering = siswa tidak ikut / kosong. Nilai 0
    // tetap tersimpan di DB, hanya counter/indikator saja yang
    // memperlakukannya sebagai "belum".
    return v !== undefined && v.trim() !== "" && Number(v) > 0
  }

  const sudahDinilai = classroomStudents.filter((s) => isDinilai(s.id)).length
  const belumDinilai = classroomStudents.length - sudahDinilai
  const isEdit = Boolean(assessmentId)
  const willInsertAsZero = !isEdit ? belumDinilai : 0

  const canSubmit =
    !isPending &&
    subjectId &&
    classroomId &&
    gradeWeightId &&
    title.trim() &&
    classroomStudents.length > 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Penilaian
        </h1>
        <p className="text-sm text-muted-foreground">
          Input nilai per kelas dan komponen bobot. Lihat progres isi dan
          pastikan setiap siswa punya nilai sebelum simpan.
        </p>
      </div>

      <section className="grid gap-3 rounded-md border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-1.5">
          <Label htmlFor="mapel">Mata pelajaran</Label>
          <Select
            value={subjectId}
            onValueChange={(value) => {
              setSubjectId(value)
              setGradeWeightId("")
            }}
          >
            <SelectTrigger id="mapel" className="!h-9 w-full text-sm">
              <SelectValue placeholder="Pilih mapel" />
            </SelectTrigger>
            <SelectContent>
              {activeSubjects.length === 0 ? (
                <SelectItem value="__none__" disabled>
                  Belum ada mapel
                </SelectItem>
              ) : null}
              {activeSubjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} ({s.kode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="kelas">Kelas</Label>
          <Select
            value={classroomId}
            onValueChange={setClassroomId}
            disabled={!subjectId}
          >
            <SelectTrigger id="kelas" className="!h-9 w-full text-sm">
              <SelectValue placeholder="Pilih kelas" />
            </SelectTrigger>
            <SelectContent>
              {classrooms.length === 0 ? (
                <SelectItem value="__none__" disabled>
                  Belum ada kelas
                </SelectItem>
              ) : null}
              {classrooms
                .slice()
                .sort((a, b) => naturalCollator.compare(a.name, b.name))
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="bobot">Komponen bobot</Label>
          <Select
            value={gradeWeightId}
            onValueChange={setGradeWeightId}
            disabled={!subjectId}
          >
            <SelectTrigger id="bobot" className="!h-9 w-full text-sm">
              <SelectValue placeholder="Pilih komponen" />
            </SelectTrigger>
            <SelectContent>
              {activeWeights.length === 0 ? (
                <SelectItem value="__none__" disabled>
                  {subjectId
                    ? "Belum ada bobot untuk mapel ini"
                    : "Pilih mapel dulu"}
                </SelectItem>
              ) : null}
              {activeWeights.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name} ({w.weight}%)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="penilaian">Penilaian</Label>
          <Select
            value={assessmentId}
            onValueChange={(value) =>
              setAssessmentId(value === "__new__" ? "" : value)
            }
            disabled={!subjectId || !classroomId || !gradeWeightId}
          >
            <SelectTrigger id="penilaian" className="!h-9 w-full text-sm">
              <SelectValue placeholder="Pilih atau buat baru" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__new__">
                <span className="inline-flex items-center gap-1.5">
                  <PlusIcon className="size-3" aria-hidden />
                  Penilaian baru
                </span>
              </SelectItem>
              {subjectAssessments.length > 0 ? (
                <>
                  {subjectAssessments.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.title}
                    </SelectItem>
                  ))}
                </>
              ) : null}
            </SelectContent>
          </Select>
        </div>
      </section>

      {subjectId && classroomId && gradeWeightId ? (
        <form action={formAction} className="flex flex-col gap-4">
          <input
            type="hidden"
            name="assessmentId"
            value={isEdit ? assessmentId : ""}
          />
          <input type="hidden" name="subjectId" value={subjectId} />
          <input type="hidden" name="classroomId" value={classroomId} />
          <input type="hidden" name="gradeWeightId" value={gradeWeightId} />

          <section className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 sm:flex-row sm:items-end">
            <div className="grid flex-1 gap-1.5">
              <Label htmlFor="title">Nama penilaian</Label>
              <Input
                id="title"
                name="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Contoh: Tugas 1, UH 1, ..."
                required
                disabled={isPending}
                className="!h-9 text-sm"
              />
            </div>
            <div className="grid gap-1.5 sm:w-40">
              <Label htmlFor="date">Tanggal (opsional)</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={selectedAssessment?.date ?? ""}
                disabled={isPending}
                className="!h-9 text-sm"
              />
            </div>
            <div className="grid flex-1 gap-1.5">
              <Label htmlFor="description">Catatan (opsional)</Label>
              <Input
                id="description"
                name="description"
                defaultValue={selectedAssessment?.description ?? ""}
                placeholder="Catatan singkat"
                disabled={isPending}
                className="!h-9 text-sm"
              />
            </div>
          </section>

          {willInsertAsZero > 0 ? (
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-sm border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-900 dark:text-amber-200"
            >
              <AlertTriangleIcon
                className="mt-0.5 size-3.5 shrink-0"
                aria-hidden
              />
              <p>
                <span className="font-medium">
                  {willInsertAsZero} siswa belum punya nilai.
                </span>{" "}
                Kalau simpan sekarang, mereka akan disimpan sebagai 0.
              </p>
            </div>
          ) : null}

          {classroomStudents.length === 0 ? (
            <div className="rounded-md border border-border bg-card px-6 py-12 text-center">
              <p className="text-sm font-medium text-foreground">
                Belum ada siswa aktif di kelas ini
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tambahkan siswa dulu di menu Siswa.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-md border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-foreground">
                      Daftar siswa
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-mono tabular-nums text-foreground">
                        {sudahDinilai}
                      </span>
                      {" / "}
                      <span className="font-mono tabular-nums">
                        {classroomStudents.length}
                      </span>{" "}
                      siswa dinilai
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setScores(
                        Object.fromEntries(
                          classroomStudents.map((s) => [s.id, "100"]),
                        ),
                      )
                    }
                    disabled={isPending}
                    className="text-xs"
                  >
                    Isi semua 100
                  </Button>
                </div>

                <div className="max-h-[55vh] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12 pl-4 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                          No
                        </TableHead>
                        <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                          Nama
                        </TableHead>
                        <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                          NIS
                        </TableHead>
                        <TableHead className="w-44 pr-4 text-right text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                          Nilai (0–100)
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classroomStudents.map((student, index) => {
                        const raw = scores[student.id] ?? ""
                        const parsed = parseScore(raw)
                        const adaNilai = isDinilai(student.id)
                        return (
                          <TableRow key={student.id}>
                            <TableCell className="pl-4 font-mono text-xs tabular-nums text-muted-foreground">
                              {index + 1}
                            </TableCell>
                            <TableCell className="text-sm font-medium text-foreground">
                              {student.name}
                            </TableCell>
                            <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
                              {student.nis ?? (
                                <span className="inline-flex h-5 items-center rounded-sm border border-dashed border-border px-1.5 text-[11px] text-muted-foreground">
                                  Tanpa NIS
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="pr-4">
                              <div className="flex items-center justify-end gap-1.5">
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  name={`score-${student.id}`}
                                  value={raw}
                                  onChange={(event) =>
                                    setStudentScore(
                                      student.id,
                                      event.target.value,
                                    )
                                  }
                                  disabled={isPending}
                                  aria-label={`Nilai ${student.name}`}
                                  className={`!h-8 w-20 text-right font-mono tabular-nums text-sm ${
                                    parsed !== null
                                          ? "text-foreground"
                                          : "text-muted-foreground"
                                      }`}
                                />
                                {adaNilai ? (
                                  <CheckCircle2Icon
                                    className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                                    aria-label="Sudah dinilai"
                                  />
                                ) : (
                                  <span
                                    className="size-3.5 shrink-0 rounded-full border border-dashed border-border"
                                    aria-label="Belum dinilai"
                                  />
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/30 px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  {isEdit
                    ? "Mode edit: nilai DB yang tidak diubah di form akan tetap."
                    : "Mode tambah: siswa tanpa nilai akan disimpan 0."}
                </p>
                <Button type="submit" disabled={!canSubmit} className="gap-1.5">
                  <SaveIcon className="size-3.5" />
                  {isPending
                    ? "Menyimpan..."
                    : isEdit
                      ? `Simpan (${sudahDinilai} nilai)`
                      : `Simpan ${sudahDinilai}/${classroomStudents.length} nilai`}
                </Button>
              </div>
            </>
          )}
        </form>
      ) : (
        <div className="rounded-md border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm font-medium text-foreground">
            Mulai dengan memilih mapel, kelas, dan komponen bobot
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Atau buat penilaian baru dari dropdown Penilaian.
          </p>
        </div>
      )}
    </div>
  )
}
