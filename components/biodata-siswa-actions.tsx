"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { PencilIcon, Trash2Icon } from "lucide-react"

import {
  deleteBiodataSiswa,
  updateBiodataSiswa,
  type BiodataSiswaActionState,
} from "@/lib/biodata-siswa-actions"
import { BiodataSiswaFormFields } from "@/components/biodata-siswa-create-dialog"
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

const initialState: BiodataSiswaActionState = { success: false, message: "" }

type BiodataItem = {
  id: string
  nama: string
  alamat: string | null
  nohpOrtu: string | null
  namaAyah: string | null
  namaIbu: string | null
  statusPernikahan: string | null
  kondisiKeluarga: string | null
  fotoRumah: string | null
}

type BiodataActionsProps = {
  biodata: BiodataItem
}

export function BiodataSiswaActions({ biodata }: BiodataActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <BiodataEditDialog biodata={biodata} />
      <BiodataDeleteDialog biodata={biodata} />
    </div>
  )
}

function BiodataEditDialog({ biodata }: BiodataActionsProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(updateBiodataSiswa, initialState)

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
        <Button type="button" variant="outline" size="icon" className="size-7">
          <PencilIcon className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={biodata.id} />
          <DialogHeader>
            <DialogTitle>Edit Biodata Siswa</DialogTitle>
            <DialogDescription>Ubah data biodata siswa.</DialogDescription>
          </DialogHeader>

          <BiodataSiswaFormFields
            disabled={isPending}
            defaultValues={{
              nama: biodata.nama,
              alamat: biodata.alamat ?? "",
              nohpOrtu: biodata.nohpOrtu ?? "",
              namaAyah: biodata.namaAyah ?? "",
              namaIbu: biodata.namaIbu ?? "",
              statusPernikahan: biodata.statusPernikahan ?? "",
              kondisiKeluarga: biodata.kondisiKeluarga ?? "",
              fotoRumah: biodata.fotoRumah ?? "",
            }}
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function BiodataDeleteDialog({ biodata }: BiodataActionsProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(deleteBiodataSiswa, initialState)

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
        <Button type="button" variant="destructive" size="icon" className="size-7">
          <Trash2Icon className="size-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={biodata.id} />
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus biodata siswa?</AlertDialogTitle>
            <AlertDialogDescription>
              Biodata siswa <span className="font-medium text-foreground">{biodata.nama}</span> akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isPending}>
              Batal
            </AlertDialogCancel>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? "Menghapus..." : "Hapus"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
