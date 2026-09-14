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

type GradeImportDialogProps = {
  assessment: { id: string; title: string; gradeWeightName: string }
}

export function GradeImportDialog({ assessment }: GradeImportDialogProps) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(importGrades, initialState)
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
    formRef.current?.reset()
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) handleClose(); else setOpen(true) }}>
      <DialogTrigger asChild>
        <Button type="button" size="icon" variant="ghost" aria-label="Import Excel">
          <UploadIcon />
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "max-w-[calc(100vw-1.5rem)] p-4 sm:p-6",
          done && state.rows ? "sm:max-w-2xl" : "sm:max-w-md",
        )}
      >
        <form ref={formRef} action={formAction} className="space-y-4">
          <input type="hidden" name="assessmentId" value={assessment.id} />
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {done && state.rows ? "Hasil Import Nilai" : "Import Nilai dari Excel"}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {done && state.rows
                ? `${state.imported} berhasil · ${state.skipped} dilewati`
                : `Untuk penilaian "${assessment.title}" (${assessment.gradeWeightName}). Upload file .xls atau .xlsx. Kolom: A (No), B (NIS), C (Nama), D (Nilai). Baris 1 (header) dilewati.`}
            </DialogDescription>
          </DialogHeader>

          {(!done || !state.rows) ? (
            <>
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
                  disabled={isPending}
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

              {state.skipped > 0 && (
                <div className="max-h-32 overflow-y-auto rounded-sm border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                  <p className="mb-1 font-medium text-foreground">
                    {state.skipped} baris dilewati (nama/NIS tidak cocok dengan siswa di kelas):
                  </p>
                  <ul className="list-inside list-disc space-y-0.5">
                    {state.rows
                      ?.filter((r) => !r.matched)
                      .map((row, i) => (
                        <li key={i}>
                          {row.name}
                          {row.nis ? ` (NIS: ${row.nis})` : ""}
                          {row.reason ? ` — ${row.reason}` : ""}
                        </li>
                      ))}
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
