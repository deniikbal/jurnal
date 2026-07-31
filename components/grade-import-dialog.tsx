"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { CheckIcon, UploadIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { importGrades, type GradeImportState } from "@/lib/grade-actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
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
import { cn } from "@/lib/utils"

const initialState: GradeImportState = {
  success: false,
  message: "",
  imported: 0,
  skipped: 0,
}

type AssessmentOption = {
  id: string
  title: string
  gradeWeightName: string
}

type GradeImportDialogProps = {
  assessments: AssessmentOption[]
}

export function GradeImportDialog({ assessments }: GradeImportDialogProps) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(importGrades, initialState)
  const [selectedAssessment, setSelectedAssessment] = useState("")
  const done = state.success || (!state.success && state.message && !isPending)

  useEffect(() => {
    if (!state.message || isPending) return
    if (state.success) {
      toast.success(state.message)
    } else {
      toast.error(state.message)
    }
  }, [state, isPending])

  function handleClose() {
    setOpen(false)
    setSelectedAssessment("")
    formRef.current?.reset()
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) handleClose(); else setOpen(true) }}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          <UploadIcon />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "max-w-[calc(100vw-1.5rem)] p-4 sm:p-6",
          done && state.rows ? "sm:max-w-2xl" : "sm:max-w-md",
        )}
      >
        <form ref={formRef} action={formAction} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {done && state.rows ? "Hasil Import Nilai" : "Import Nilai dari Excel"}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {done && state.rows
                ? `${state.imported} berhasil · ${state.skipped} dilewati`
                : "Upload file .xls atau .xlsx. Kolom: A (NIS), B (Nama), C (Nilai). Baris 1 (header) dilewati."}
            </DialogDescription>
          </DialogHeader>

          {(!done || !state.rows) ? (
            <>
              <input type="hidden" name="assessmentId" value={selectedAssessment} />

              <div className="grid gap-1.5">
                <Label htmlFor="assessmentId" className="text-xs sm:text-sm">Penilaian</Label>
                <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
                  <SelectTrigger id="assessmentId" className="w-full">
                    <SelectValue placeholder="Pilih penilaian" />
                  </SelectTrigger>
                  <SelectContent>
                    {assessments.length > 0 ? (
                      assessments.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.title} ({a.gradeWeightName})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="-" disabled>
                        Belum ada penilaian
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="file" className="text-xs sm:text-sm">File Excel</Label>
                <Input
                  id="file"
                  name="file"
                  type="file"
                  accept=".xls,.xlsx"
                  required
                  disabled={isPending}
                  className="text-xs sm:text-sm"
                />
              </div>

              <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isPending} className="w-full sm:w-auto text-xs">
                    Batal
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isPending || !selectedAssessment}
                  className="w-full sm:w-auto text-xs gap-1.5"
                >
                  {isPending ? "Memproses..." : "Import"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="max-h-[50vh] overflow-auto rounded-sm border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8" />
                      <TableHead className="w-10">No</TableHead>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead>NIS</TableHead>
                      <TableHead className="w-20 text-right">Nilai</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.rows.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {row.matched ? (
                            <CheckIcon className="size-4 text-emerald-600" />
                          ) : (
                            <XIcon className="size-4 text-destructive" />
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                        <TableCell className={cn("font-medium", !row.matched && "text-destructive")}>
                          {row.name}
                          {!row.matched && row.reason && (
                            <span className="ml-1.5 text-xs font-normal text-destructive/70">
                              ({row.reason})
                            </span>
                          )}
                        </TableCell>
                        <TableCell className={cn(!row.matched && "text-destructive/60")}>
                          {row.nis ?? "-"}
                        </TableCell>
                        <TableCell className={cn("text-right tabular-nums font-semibold", !row.matched && "text-destructive/60")}>
                          {row.matched ? row.score : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {state.errors && state.errors.length > 0 && (
                <div className="max-h-32 overflow-y-auto rounded-sm border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                  <p className="mb-1 font-medium">Baris yang dilewati:</p>
                  <ul className="list-inside list-disc space-y-0.5">
                    {state.errors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}

              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={handleClose} className="w-full sm:w-auto text-xs">
                  Tutup
                </Button>
              </DialogFooter>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
