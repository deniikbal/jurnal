"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { PencilIcon, Trash2Icon } from "lucide-react"

import {
  deleteSiswa,
  updateSiswa,
  type SiswaActionState,
} from "@/lib/siswa-actions"
import { SiswaFormFields } from "@/components/siswa-create-dialog"
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

const initialState: SiswaActionState = { success: false, message: "" }

type ClassroomOption = {
  id: string
  name: string
}

type SiswaItem = {
  id: string
  name: string
  nis: string | null
  classroomId: string
  jenisKelamin: "laki-laki" | "perempuan"
  status: "aktif" | "keluar"
}

type SiswaActionsProps = {
  siswa: SiswaItem
  classrooms: ClassroomOption[]
}

export function SiswaActions({ siswa, classrooms }: SiswaActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <SiswaEditDialog siswa={siswa} classrooms={classrooms} />
      <SiswaDeleteDialog siswa={siswa} />
    </div>
  )
}

function SiswaEditDialog({ siswa, classrooms }: SiswaActionsProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(updateSiswa, initialState)

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
          <input type="hidden" name="id" value={siswa.id} />
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Edit Siswa</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Ubah data siswa.</DialogDescription>
          </DialogHeader>

          <SiswaFormFields
            classrooms={classrooms}
            disabled={isPending}
            defaultValues={siswa}
          />

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

function SiswaDeleteDialog({ siswa }: { siswa: SiswaItem }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(deleteSiswa, initialState)

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
          <input type="hidden" name="id" value={siswa.id} />
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Hapus siswa?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Data siswa <span className="font-medium text-foreground">{siswa.name}</span> akan dihapus permanen.
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
