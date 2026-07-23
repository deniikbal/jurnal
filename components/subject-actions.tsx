"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { PencilIcon, Trash2Icon } from "lucide-react"

import {
  deleteSubject,
  updateSubject,
  type SubjectActionState,
} from "@/lib/subject-actions"
import { SubjectFormFields } from "@/components/subject-create-dialog"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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

const initialState: SubjectActionState = { success: false, message: "" }

type SubjectItem = {
  id: string
  name: string
  kode: string
  status: "aktif" | "nonaktif"
}

type SubjectActionsProps = {
  subject: SubjectItem
}

export function SubjectActions({ subject }: SubjectActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <SubjectEditDialog subject={subject} />
      <SubjectDeleteDialog subject={subject} />
    </div>
  )
}

function SubjectEditDialog({ subject }: SubjectActionsProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(updateSubject, initialState)

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
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="icon" className="size-8 sm:size-7">
          <PencilIcon className="size-4 sm:size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-1.5rem)] sm:max-w-md p-4 sm:p-6">
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={subject.id} />
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Edit Mata Pelajaran</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Ubah nama, kode, atau status mata pelajaran.</DialogDescription>
          </DialogHeader>

          <SubjectFormFields disabled={isPending} defaultValues={subject} />

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending} className="w-full sm:w-auto text-xs">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto text-xs">
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SubjectDeleteDialog({ subject }: SubjectActionsProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(deleteSubject, initialState)

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
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" size="icon" className="size-8 sm:size-7">
          <Trash2Icon className="size-4 sm:size-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[calc(100vw-1.5rem)] sm:max-w-md p-4 sm:p-6">
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={subject.id} />
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Hapus mata pelajaran?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Mata pelajaran <span className="font-medium text-foreground">{subject.name}</span> akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
            <AlertDialogCancel type="button" disabled={isPending} className="w-full sm:w-auto text-xs">
              Batal
            </AlertDialogCancel>
            <Button type="submit" variant="destructive" disabled={isPending} className="w-full sm:w-auto text-xs">
              {isPending ? "Menghapus..." : "Hapus"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
