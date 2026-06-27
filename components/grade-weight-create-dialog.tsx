"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { createGradeWeight, type GradeWeightActionState } from "@/lib/grade-weight-actions"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const initialState: GradeWeightActionState = { success: false, message: "" }

type SubjectOption = { id: string; name: string; kode: string }

export function GradeWeightCreateDialog({ subjects }: { subjects: SubjectOption[] }) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(createGradeWeight, initialState)

  useEffect(() => {
    if (!state.message) return
    if (state.success) {
      toast.success(state.message)
      setOpen(false)
      formRef.current?.reset()
    } else {
      toast.error(state.message)
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Tambah Bobot</Button>
      </DialogTrigger>
      <DialogContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Tambah Bobot Nilai</DialogTitle>
            <DialogDescription>Atur bobot nilai per mata pelajaran.</DialogDescription>
          </DialogHeader>
          <GradeWeightFormFields subjects={subjects} disabled={isPending} />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>Batal</Button>
            </DialogClose>
            <Button type="submit" disabled={isPending || !subjects.length}>{isPending ? "Menyimpan..." : "Simpan"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function GradeWeightFormFields({
  subjects,
  disabled,
  defaultValues,
}: {
  subjects: SubjectOption[]
  disabled?: boolean
  defaultValues?: { name?: string; weight?: number; subjectId?: string; status?: "aktif" | "nonaktif" }
}) {
  return (
    <div className="grid gap-3">
      <div className="grid gap-1.5">
        <Label htmlFor="subjectId">Mata Pelajaran</Label>
        <Select name="subjectId" defaultValue={defaultValues?.subjectId} disabled={disabled || !subjects.length} required>
          <SelectTrigger id="subjectId" className="w-full">
            <SelectValue placeholder={subjects.length ? "Pilih mata pelajaran" : "Belum ada mapel"} />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>{subject.name} ({subject.kode})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="name">Nama Bobot</Label>
        <Input id="name" name="name" defaultValue={defaultValues?.name ?? ""} placeholder="Contoh: Tugas, UTS, UAS" required autoFocus disabled={disabled} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="weight">Bobot (%)</Label>
        <Input id="weight" name="weight" type="number" min={1} max={100} defaultValue={defaultValues?.weight ?? ""} placeholder="Contoh: 30" required disabled={disabled} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="status">Status</Label>
        <Select name="status" defaultValue={defaultValues?.status ?? "aktif"} disabled={disabled}>
          <SelectTrigger id="status" className="w-full"><SelectValue placeholder="Pilih status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="aktif">Aktif</SelectItem>
            <SelectItem value="nonaktif">Nonaktif</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
