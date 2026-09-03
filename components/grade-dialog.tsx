"use client"

import { useActionState, useEffect, useMemo, useState } from "react"
import {
  AlertTriangleIcon,
  DownloadIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import {
  deleteAssessment,
  saveAssessment,
  type GradeActionState,
} from "@/lib/grade-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GradeImportDialog } from "@/components/grade-import-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

const initialState: GradeActionState = { success: false, message: "" }

type GradeWeightOption = {
  id: string
  name: string
  weight: number
}

type AssessmentItem = {
  id: string
  title: string
  description: string | null
  date: string | null
  gradeWeightId: string
  gradeWeightName: string
  classroomId: string
}

type StudentItem = {
  id: string
  name: string
  nis: string | null
}

type GradeDialogProps = {
  schedule: {
    id: string
    classroomId: string
    jamKe: number
    startTime: string
    endTime: string
  }
  subjectName: string
  classroomName: string
  students: StudentItem[]
  weights: GradeWeightOption[]
  assessments: AssessmentItem[]
  scoresByAssessment: Record<string, Record<string, number>>
  allClassrooms?: { id: string; name: string }[]
  allAssessments?: AssessmentItem[]
  studentCountsByClassroom?: Record<string, number>
  allScoresByAssessment?: Record<string, Record<string, number>>
}

type ViewMode =
  | { type: "list" }
  | { type: "summary" }
  | { type: "form"; assessment?: AssessmentItem }

export function GradeDialog({
  schedule,
  subjectName,
  classroomName,
  students,
  weights,
  assessments,
  scoresByAssessment,
  allClassrooms,
  allAssessments,
  studentCountsByClassroom,
  allScoresByAssessment,
}: GradeDialogProps) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<ViewMode>({ type: "list" })

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) setView({ type: "list" })
  }

  const weightById = useMemo(
    () => new Map(weights.map((w) => [w.id, w])),
    [weights],
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant={assessments.length ? "outline" : "secondary"}>
          Penilaian{assessments.length ? ` (${assessments.length})` : ""}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        {view.type === "form" ? (
          <AssessmentForm
            schedule={schedule}
            subjectName={subjectName}
            classroomName={classroomName}
            students={students}
            weights={weights}
            assessment={view.assessment}
            initialScores={
              view.assessment ? scoresByAssessment[view.assessment.id] ?? {} : {}
            }
            onDone={() => setOpen(false)}
            onCancel={() => setView({ type: "list" })}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Penilaian {classroomName}</DialogTitle>
              <DialogDescription>
                {subjectName} • Jam {schedule.jamKe} • {schedule.startTime}–{schedule.endTime}
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-1 border-b pb-2">
              <Button
                type="button"
                variant={view.type === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView({ type: "list" })}
              >
                Daftar
              </Button>
              <Button
                type="button"
                variant={view.type === "summary" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView({ type: "summary" })}
              >
                Ringkasan
              </Button>
            </div>
            {view.type === "list" ? (
              <AssessmentList
                classroomId={schedule.classroomId}
                weights={weights}
                weightById={weightById}
                assessments={assessments}
                students={students}
                scoresByAssessment={scoresByAssessment}
                onAdd={() => setView({ type: "form" })}
                onEdit={(a) => setView({ type: "form", assessment: a })}
                onDeleted={() => setView({ type: "list" })}
              />
            ) : (
              <AssessmentSummary
                allClassrooms={allClassrooms ?? []}
                allAssessments={allAssessments ?? []}
                studentCountsByClassroom={studentCountsByClassroom ?? {}}
                allScoresByAssessment={allScoresByAssessment ?? {}}
                weightById={weightById}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function AssessmentList({
  classroomId,
  weights,
  weightById,
  assessments,
  students,
  scoresByAssessment,
  onAdd,
  onEdit,
  onDeleted,
}: {
  classroomId: string
  weights: GradeWeightOption[]
  weightById: Map<string, GradeWeightOption>
  assessments: AssessmentItem[]
  students: StudentItem[]
  scoresByAssessment: Record<string, Record<string, number>>
  onAdd: () => void
  onEdit: (assessment: AssessmentItem) => void
  onDeleted: () => void
}) {
  const [state, formAction, isPending] = useActionState(deleteAssessment, initialState)

  useEffect(() => {
    if (!state.message) return
    if (state.success) {
      toast.success(state.message)
      onDeleted()
    } else {
      toast.error(state.message)
    }
  }, [state, onDeleted])

  const hasWeights = weights.length > 0

  return (
    <div className="space-y-4">
      {!hasWeights ? (
        <div className="rounded-sm border py-10 text-center text-sm text-muted-foreground">
          Belum ada komponen bobot nilai untuk mapel ini. Tambahkan dulu di menu
          Bobot Nilai.
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Daftar penilaian.
            </p>
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline">
                <a href={`/api/nilai/template?classroomId=${encodeURIComponent(classroomId)}`}>
                  <DownloadIcon />
                  Template Excel
                </a>
              </Button>
              <GradeImportDialog
                assessments={assessments.map((a) => ({
                  id: a.id,
                  title: a.title,
                  gradeWeightName: a.gradeWeightName,
                }))}
              />
              <Button type="button" size="sm" onClick={onAdd}>
                <PlusIcon />
                Tambah Penilaian
              </Button>
            </div>
          </div>

          <div className="max-h-[55vh] overflow-auto rounded-sm border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Komponen</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead className="w-24 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.length > 0 ? (
                  assessments.map((item, index) => {
                    const studentScores = scoresByAssessment[item.id]
                    const lengkap =
                      students.length > 0 &&
                      studentScores &&
                      students.every(
                        (s) =>
                          studentScores[s.id] !== undefined && studentScores[s.id] > 0,
                      )

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {weightById.get(item.gradeWeightId)?.name ?? item.gradeWeightName}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={lengkap ? "default" : "outline"}>
                            {lengkap ? "Lengkap" : "Tidak lengkap"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => onEdit(item)}
                            >
                              <PencilIcon />
                            </Button>
                            <form action={formAction}>
                              <input type="hidden" name="id" value={item.id} />
                              <Button
                                type="submit"
                                size="icon"
                                variant="ghost"
                                disabled={isPending}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2Icon />
                              </Button>
                            </form>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Belum ada penilaian. Klik &quot;Tambah Penilaian&quot;.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}

function AssessmentForm({
  schedule,
  subjectName,
  classroomName,
  students,
  weights,
  assessment,
  initialScores,
  onDone,
  onCancel,
}: {
  schedule: {
    id: string
    jamKe: number
    startTime: string
    endTime: string
  }
  subjectName: string
  classroomName: string
  students: StudentItem[]
  weights: GradeWeightOption[]
  assessment?: AssessmentItem
  initialScores: Record<string, number>
  onDone: () => void
  onCancel: () => void
}) {
  const [state, formAction, isPending] = useActionState(saveAssessment, initialState)
  const [selectedWeightId, setSelectedWeightId] = useState(
    assessment?.gradeWeightId ?? weights[0]?.id ?? "",
  )
  const [scores, setScores] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      students.map((student) => [
        student.id,
        initialScores[student.id] !== undefined ? String(initialScores[student.id]) : "",
      ]),
    ),
  )
  const [statusFilter, setStatusFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  function isDinilai(studentId: string) {
    const v = scores[studentId]
    // "Dinilai" = nilai numeric > 0. 0 dianggap "belum dinilai" karena
    // di praktik sekolah, 0 sering = siswa tidak ikut / kosong. User tetap
    // bisa input 0, nilai 0 akan tersimpan di DB; hanya counter/filter
    // yang memperlakukannya sebagai "belum".
    return v !== undefined && v.trim() !== "" && Number(v) > 0
  }

  const query = searchQuery.trim().toLowerCase()

  const filteredStudents = students.filter((s) => {
    const matchStatus = statusFilter ? (statusFilter === "sudah" ? isDinilai(s.id) : !isDinilai(s.id)) : true
    const matchSearch = !query || s.name.toLowerCase().includes(query)
    return matchStatus && matchSearch
  })

  const sudahDinilai = students.filter((s) => isDinilai(s.id)).length
  const belumDinilai = students.length - sudahDinilai
  const siswaTersembunyi = students.length - filteredStudents.length
  const isEdit = Boolean(assessment)
  const akanDiinsertNol = isEdit ? 0 : belumDinilai

  useEffect(() => {
    if (!state.message) return
    if (state.success) {
      toast.success(state.message)
      onDone()
    } else {
      toast.error(state.message)
    }
  }, [state, onDone])

  function setStudentScore(studentId: string, value: string) {
    setScores((current) => ({ ...current, [studentId]: value }))
  }

  return (
    <form action={formAction} className="space-y-4">
      {assessment ? <input type="hidden" name="assessmentId" value={assessment.id} /> : null}
      <input type="hidden" name="scheduleId" value={schedule.id} />
      <input type="hidden" name="gradeWeightId" value={selectedWeightId} />
      {/* Siswa yang difilter (tidak visible) tidak dikirim — server skip key tsb
          di mode edit agar nilai DB tidak tertimpa. Mode tambah: server insert
          default 0 untuk siswa tanpa key (lihat warning banner di bawah). */}

      <DialogHeader>
        <DialogTitle>
          {assessment ? "Edit Penilaian" : "Tambah Penilaian"} · {classroomName}
        </DialogTitle>
        <DialogDescription>
          {subjectName} • Jam {schedule.jamKe} • {schedule.startTime}–{schedule.endTime}
        </DialogDescription>
      </DialogHeader>

      {!assessment && (akanDiinsertNol > 0 || siswaTersembunyi > 0) ? (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-sm border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-900 dark:text-amber-200"
        >
          <AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <div className="space-y-0.5">
            <p className="font-medium">
              {akanDiinsertNol} siswa belum punya nilai dan akan disimpan
              sebagai 0.
            </p>
            {siswaTersembunyi > 0 ? (
              <p className="text-amber-800/80 dark:text-amber-300/80">
                {siswaTersembunyi} siswa disembunyikan oleh filter. Reset
                filter sebelum simpan kalau ingin menilai mereka.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor="gradeWeight">Penilaian</Label>
          <Select value={selectedWeightId} onValueChange={setSelectedWeightId}>
            <SelectTrigger id="gradeWeight" className="w-full">
              <SelectValue placeholder="Pilih komponen" />
            </SelectTrigger>
            <SelectContent>
              {weights.map((weight) => (
                <SelectItem key={weight.id} value={weight.id}>
                  {weight.name} ({weight.weight}%)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="title">Nama Penilaian</Label>
          <Input
            id="title"
            name="title"
            defaultValue={assessment?.title ?? ""}
            placeholder="Contoh: Tugas 1"
            required
            disabled={isPending}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="date">Tanggal</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={assessment?.date ?? ""}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="description">Deskripsi (opsional)</Label>
        <Input
          id="description"
          name="description"
          defaultValue={assessment?.description ?? ""}
          placeholder="Catatan singkat penilaian"
          disabled={isPending}
        />
      </div>

      {!assessment && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="applyAll"
            id="applyAll"
            value="1"
            className="size-4 rounded-sm border-gray-300"
          />
          <Label htmlFor="applyAll" className="text-sm font-normal cursor-pointer">
            Terapkan juga ke semua kelas dengan mapel ini
          </Label>
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Cari siswa..."
            disabled={isPending}
            className="h-8 pl-7 text-sm"
            aria-label="Cari siswa"
          />
        </div>
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "sudah" ? "" : "sudah")}
          className="flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs transition-colors hover:bg-muted data-active:bg-muted"
          data-active={statusFilter === "sudah" || undefined}
        >
          <span className="text-muted-foreground">Sudah dinilai</span>
          <span className="font-semibold text-primary">{sudahDinilai}</span>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "belum" ? "" : "belum")}
          className="flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs transition-colors hover:bg-muted data-active:bg-muted"
          data-active={statusFilter === "belum" || undefined}
        >
          <span className="text-muted-foreground">Belum dinilai</span>
          <span className="font-semibold text-muted-foreground">{belumDinilai}</span>
        </button>
        {statusFilter && (
          <button
            type="button"
            onClick={() => setStatusFilter("")}
            className="flex items-center gap-1 rounded-sm border px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted"
          >
            Reset
          </button>
        )}
        {sudahDinilai === students.length && students.length > 0 && (
          <Badge variant="secondary" className="ml-auto text-xs">
            Semua sudah dinilai
          </Badge>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setScores(Object.fromEntries(students.map((s) => [s.id, "100"])))}
          disabled={isPending}
          className="ml-auto"
        >
          Isi Semua 100
        </Button>
      </div>

      <div className="max-h-[45vh] overflow-auto rounded-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">No</TableHead>
              <TableHead>Nama Siswa</TableHead>
              <TableHead>NIS</TableHead>
              <TableHead className="w-36">Nilai (0–100)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <TableRow key={student.id} className="*:py-1.5">
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.nis ?? "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        name={`score-${student.id}`}
                        value={scores[student.id] ?? ""}
                        onChange={(event) => setStudentScore(student.id, event.target.value)}
                        disabled={isPending}
                        className="w-16 h-7"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => setStudentScore(student.id, "100")}
                        disabled={isPending}
                        className="h-7 w-8 text-xs font-semibold text-muted-foreground hover:text-primary"
                      >
                        100
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  {searchQuery
                    ? "Tidak ada siswa yang sesuai dengan pencarian."
                    : statusFilter
                      ? `Tidak ada siswa dengan status "${statusFilter === "sudah" ? "sudah dinilai" : "belum dinilai"}".`
                      : "Belum ada siswa aktif di kelas ini."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Kembali
        </Button>
        <Button
          type="submit"
          disabled={isPending || !selectedWeightId || !students.length}
        >
          {isPending
            ? "Menyimpan..."
            : assessment
              ? `Simpan (${sudahDinilai} nilai)`
              : `Simpan ${sudahDinilai}/${students.length} nilai`}
        </Button>
      </DialogFooter>
    </form>
  )
}

function AssessmentSummary({
  allClassrooms,
  allAssessments,
  studentCountsByClassroom,
  allScoresByAssessment,
  weightById,
}: {
  allClassrooms: { id: string; name: string }[]
  allAssessments: AssessmentItem[]
  studentCountsByClassroom: Record<string, number>
  allScoresByAssessment: Record<string, Record<string, number>>
  weightById: Map<string, GradeWeightOption>
}) {
  const columnKeys: string[] = []
  const columnLabels: { title: string; weightName: string }[] = []
  const seen = new Set<string>()
  for (const a of allAssessments) {
    const key = `${a.title}::${a.gradeWeightId}`
    if (!seen.has(key)) {
      seen.add(key)
      columnKeys.push(key)
      columnLabels.push({
        title: a.title,
        weightName: weightById.get(a.gradeWeightId)?.name ?? a.gradeWeightName,
      })
    }
  }

  const byClassroom = new Map<string, Map<string, AssessmentItem>>()
  for (const a of allAssessments) {
    if (!byClassroom.has(a.classroomId)) byClassroom.set(a.classroomId, new Map())
    byClassroom.get(a.classroomId)!.set(`${a.title}::${a.gradeWeightId}`, a)
  }

  const collator = new Intl.Collator("id-ID", { numeric: true, sensitivity: "base" })
  const sortedClassrooms = allClassrooms.toSorted((a, b) => collator.compare(a.name, b.name))

  if (!columnKeys.length) {
    return (
      <div className="rounded-sm border py-16 text-center text-sm text-muted-foreground">
        Belum ada penilaian untuk mapel ini di kelas manapun.
      </div>
    )
  }

  return (
    <div className="max-h-[55vh] overflow-auto rounded-sm border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">Kelas</TableHead>
            {columnLabels.map((col) => (
              <TableHead key={col.title} className="text-center">
                <div>{col.title}</div>
                <div className="text-xs font-normal text-muted-foreground">{col.weightName}</div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedClassrooms.map((cls) => (
            <TableRow key={cls.id}>
              <TableCell className="font-medium">{cls.name}</TableCell>
              {columnKeys.map((key) => {
                const a = byClassroom.get(cls.id)?.get(key)
                if (!a) {
                  return (
                    <TableCell key={key} className="text-center text-muted-foreground">
                      Belum
                    </TableCell>
                  )
                }
                const scores = allScoresByAssessment[a.id] ?? {}
                const filled = Object.values(scores).filter((s) => s > 0).length
                const total = studentCountsByClassroom[cls.id] ?? 0
                const complete = total > 0 && filled === total
                const empty = filled === 0
                return (
                  <TableCell
                    key={key}
                    className={`text-center tabular-nums ${
                      complete
                        ? "text-primary font-semibold"
                        : empty
                          ? "text-destructive"
                          : "text-muted-foreground"
                    }`}
                  >
                    {filled}/{total}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
