"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { PencilIcon, Trash2Icon } from "lucide-react"

import {
  deleteKelas,
  updateKelas,
  type KelasActionState,
} from "@/lib/kelas-actions"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState: KelasActionState = {
  success: false,
  message: "",
}

type KelasActionsProps = {
  kelas: {
    id: string
    name: string
    waliKelas: string | null
  }
}

export function KelasActions({ kelas }: KelasActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <KelasEditDialog kelas={kelas} />
      <KelasDeleteDialog kelas={kelas} />
    </div>
  )
}

function KelasEditDialog({ kelas }: KelasActionsProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(updateKelas, initialState)

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
          <input type="hidden" name="id" value={kelas.id} />
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Edit Kelas</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Ubah nama kelas atau wali kelas.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor={`name-${kelas.id}`} className="text-xs sm:text-sm">Nama Kelas</Label>
              <Input
                id={`name-${kelas.id}`}
                name="name"
                defaultValue={kelas.name}
                required
                disabled={isPending}
                className="text-xs sm:text-sm"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`waliKelas-${kelas.id}`} className="text-xs sm:text-sm">Wali Kelas</Label>
              <Input
                id={`waliKelas-${kelas.id}`}
                name="waliKelas"
                defaultValue={kelas.waliKelas ?? ""}
                disabled={isPending}
                className="text-xs sm:text-sm"
              />
            </div>
          </div>

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

function KelasDeleteDialog({ kelas }: KelasActionsProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(deleteKelas, initialState)

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
          <input type="hidden" name="id" value={kelas.id} />
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Hapus kelas?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Data kelas <span className="font-medium text-foreground">{kelas.name}</span> akan dihapus permanen.
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
