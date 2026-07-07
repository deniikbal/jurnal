"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { PencilIcon, Trash2Icon } from "lucide-react"

import { deleteGradeWeight, updateGradeWeight, type GradeWeightActionState } from "@/lib/grade-weight-actions"
import { GradeWeightFormFields } from "@/components/grade-weight-create-dialog"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const initialState: GradeWeightActionState = { success: false, message: "" }

type SubjectOption = { id: string; name: string; kode: string }
type GradeWeightItem = { id: string; name: string; weight: number; subjectId: string; status: "aktif" | "nonaktif" }

export function GradeWeightActions({ item, subjects }: { item: GradeWeightItem; subjects: SubjectOption[] }) {
  return (
    <div className="flex items-center gap-2">
      <GradeWeightEditDialog item={item} subjects={subjects} />
      <GradeWeightDeleteDialog item={item} />
    </div>
  )
}

function GradeWeightEditDialog({ item, subjects }: { item: GradeWeightItem; subjects: SubjectOption[] }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(updateGradeWeight, initialState)

  useEffect(() => {
    if (!state.message) return
    if (state.success) {
      toast.success(state.message)
      setOpen(false)
    } else {
      toast.error(state.message)
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button type="button" variant="outline" size="icon" className="size-7"><PencilIcon className="size-3.5" /></Button></DialogTrigger>
      <DialogContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={item.id} />
          <DialogHeader>
            <DialogTitle>Edit Bobot Nilai</DialogTitle>
            <DialogDescription>Ubah bobot nilai per mata pelajaran.</DialogDescription>
          </DialogHeader>
          <GradeWeightFormFields subjects={subjects} disabled={isPending} defaultValues={item} />
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline" disabled={isPending}>Batal</Button></DialogClose>
            <Button type="submit" disabled={isPending}>{isPending ? "Menyimpan..." : "Simpan Perubahan"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function GradeWeightDeleteDialog({ item }: { item: GradeWeightItem }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(deleteGradeWeight, initialState)

  useEffect(() => {
    if (!state.message) return
    if (state.success) {
      toast.success(state.message)
      setOpen(false)
    } else {
      toast.error(state.message)
    }
  }, [state])

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild><Button type="button" variant="destructive" size="icon" className="size-7"><Trash2Icon className="size-3.5" /></Button></AlertDialogTrigger>
      <AlertDialogContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={item.id} />
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus bobot nilai?</AlertDialogTitle>
            <AlertDialogDescription>Bobot <span className="font-medium text-foreground">{item.name}</span> akan dihapus permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isPending}>Batal</AlertDialogCancel>
            <Button type="submit" variant="destructive" disabled={isPending}>{isPending ? "Menghapus..." : "Hapus"}</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
