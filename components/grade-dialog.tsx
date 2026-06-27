"use client"

import { useActionState, useEffect, useMemo, useState } from "react"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import {
  deleteAssessment,
  saveAssessment,
  type GradeActionState,
} from "@/lib/grade-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
}

type StudentItem = {
  id: string
  name: string
  nis: string | null
}

type GradeDialogProps = {
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
  assessments: AssessmentItem[]
  scoresByAssessment: Record<string, Record<string, number>>
}

type ViewMode =
  | { type: "list" }
  | { type: "form"; assessment?: AssessmentItem }

export function GradeDialog({
  schedule,
  subjectName,
  classroomName,
  students,
  weights,
  assessments,
  scoresByAssessment,
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
        {view.type === "list" ? (
          <AssessmentList
            subjectName={subjectName}
            classroomName={classroomName}
            schedule={schedule}
            weights={weights}
            weightById={weightById}
            assessments={assessments}
            onAdd={() => setView({ type: "form" })}
            onEdit={(assessment) => setView({ type: "form", assessment })}
            onDeleted={() => setView({ type: "list" })}
          />
        ) : (
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
        )}
      </DialogContent>
    </Dialog>
  )
}

function AssessmentList({
  subjectName,
  classroomName,
  schedule,
  weights,
  weightById,
  assessments,
  onAdd,
  onEdit,
  onDeleted,
}: {
  subjectName: string
  classroomName: string
  schedule: { jamKe: number; startTime: string; endTime: string }
  weights: GradeWeightOption[]
  weightById: Map<string, GradeWeightOption>
  assessments: AssessmentItem[]
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
      <DialogHeader>
        <DialogTitle>Penilaian {classroomName}</DialogTitle>
        <DialogDescription>
          {subjectName} • Jam {schedule.jamKe} • {schedule.startTime}–{schedule.endTime}
        </DialogDescription>
      </DialogHeader>

      {!hasWeights ? (
        <div className="rounded-lg border py-10 text-center text-sm text-muted-foreground">
          Belum ada komponen bobot nilai untuk mapel ini. Tambahkan dulu di menu
          Bobot Nilai.
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Daftar penilaian (mis. Tugas 1, Tugas 2, UH 1, ...).
            </p>
            <Button type="button" size="sm" onClick={onAdd}>
              <PlusIcon />
              Tambah Penilaian
            </Button>
          </div>

          <div className="max-h-[55vh] overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Komponen</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="w-24 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.length > 0 ? (
                  assessments.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {weightById.get(item.gradeWeightId)?.name ?? item.gradeWeightName}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.date ?? "-"}</TableCell>
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
                  ))
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

      <DialogHeader>
        <DialogTitle>
          {assessment ? "Edit Penilaian" : "Tambah Penilaian"} — {classroomName}
        </DialogTitle>
        <DialogDescription>
          {subjectName} • Jam {schedule.jamKe} • {schedule.startTime}–{schedule.endTime}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor="gradeWeight">Komponen</Label>
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

      <div className="max-h-[45vh] overflow-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">No</TableHead>
              <TableHead>Nama Siswa</TableHead>
              <TableHead>NIS</TableHead>
              <TableHead className="w-32">Nilai (0–100)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length > 0 ? (
              students.map((student, index) => (
                <TableRow key={student.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.nis ?? "-"}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      name={`score-${student.id}`}
                      value={scores[student.id] ?? ""}
                      onChange={(event) => setStudentScore(student.id, event.target.value)}
                      disabled={isPending}
                      className="w-24"
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Belum ada siswa aktif di kelas ini.
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
        <Button type="submit" disabled={isPending || !selectedWeightId || !students.length}>
          {isPending ? "Menyimpan..." : "Simpan Penilaian"}
        </Button>
      </DialogFooter>
    </form>
  )
}
