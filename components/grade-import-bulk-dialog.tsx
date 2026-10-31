"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { CheckIcon, LayersIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { importGradesBulk, type BulkImportState } from "@/lib/grade-actions"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

const initialState: BulkImportState = {
  success: false,
  message: "",
  imported: 0,
  skipped: 0,
}

type Props = {
  assessment: { id: string; title: string; gradeWeightName: string }
}

export function GradeImportBulkDialog({ assessment }: Props) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(
    importGradesBulk,
    initialState
  )
  const done = !isPending && !!state.message

  useEffect(() => {
    if (!state.message || isPending) return
    if (state.success) toast.success(state.message)
    else toast.error(state.message)
  }, [state, isPending])

  function handleClose() {
    setOpen(false)
    formRef.current?.reset()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose()
        else setOpen(true)
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Import Bulk ke Semua Kelas"
        >
          <LayersIcon />
        </Button>
      </DialogTrigger>

      <DialogContent
        className={cn(
          "max-w-[calc(100vw-1.5rem)] p-4 sm:p-6",
          done && state.rows ? "sm:max-w-3xl" : "sm:max-w-md"
        )}
      >
        <form ref={formRef} action={formAction} className="space-y-4">
          <input type="hidden" name="refAssessmentId" value={assessment.id} />

          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {done && state.rows
                ? "Hasil Import Nilai Bulk"
                : "Import Nilai Bulk (Semua Kelas)"}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {done && state.rows ? (
                <>
                  <span className="font-medium text-green-600">
                    {state.imported} berhasil
                  </span>
                  {" · "}
                  <span className="font-medium text-destructive">
                    {state.skipped} dilewati
                  </span>
                </>
              ) : (
                <>
                  Referensi: <strong>&quot;{assessment.title}&quot;</strong> (
                  {assessment.gradeWeightName}). Sistem akan mencari semua kelas
                  yang memiliki penilaian berjudul sama, lalu mencocokkan NIS
                  dari file Excel ke siswa di kelas masing-masing.
                  <br />
                  <span className="mt-1 inline-block text-muted-foreground">
                    Format: A (No) · B (NIS) · C (Nama) · D (Nilai). Baris 1
                    dilewati.
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {!done || !state.rows ? (
            <>
              <div className="grid gap-1.5">
                <Label htmlFor="bulk-file" className="text-xs sm:text-sm">
                  File Excel (.xls / .xlsx)
                </Label>
                <Input
                  id="bulk-file"
                  name="file"
                  type="file"
                  accept=".xls,.xlsx"
                  required
                  disabled={isPending}
                  className="text-xs sm:text-sm"
                />
              </div>

              <DialogFooter className="flex-col-reverse gap-2 pt-2 sm:flex-row">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    className="w-full text-xs sm:w-auto"
                  >
                    Batal
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full gap-1.5 text-xs sm:w-auto"
                >
                  {isPending ? "Memproses..." : "Import ke Semua Kelas"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="max-h-[55vh] overflow-auto rounded-sm border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8" />
                      <TableHead>NIS</TableHead>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead className="w-20 text-right">Nilai</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.rows.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          {row.matched ? (
                            <CheckIcon className="size-4 text-emerald-600" />
                          ) : (
                            <XIcon className="size-4 text-destructive" />
                          )}
                        </TableCell>
                        <TableCell
                          className={cn(!row.matched && "text-destructive/60")}
                        >
                          {row.nis}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "font-medium",
                            !row.matched && "text-destructive"
                          )}
                        >
                          {row.name}
                          {!row.matched && row.reason && (
                            <span className="ml-1.5 text-xs font-normal text-destructive/70">
                              ({row.reason})
                            </span>
                          )}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-sm",
                            !row.matched && "text-muted-foreground"
                          )}
                        >
                          {row.classroomName}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-semibold tabular-nums",
                            !row.matched && "text-destructive/60"
                          )}
                        >
                          {row.matched ? row.score : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="w-full text-xs sm:w-auto"
                >
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
