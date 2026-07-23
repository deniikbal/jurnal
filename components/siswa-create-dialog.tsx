"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { createSiswa, type SiswaActionState } from "@/lib/siswa-actions"
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

const initialState: SiswaActionState = { success: false, message: "" }

type ClassroomOption = {
  id: string
  name: string
}

type SiswaCreateDialogProps = {
  classrooms: ClassroomOption[]
}

export function SiswaCreateDialog({ classrooms }: SiswaCreateDialogProps) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(createSiswa, initialState)

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
        <Button className="w-full sm:w-auto text-xs sm:text-sm">Tambah Siswa</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-1.5rem)] sm:max-w-md p-4 sm:p-6">
        <form ref={formRef} action={formAction} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Tambah Siswa</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Masukkan data siswa baru untuk akun yang sedang login.
            </DialogDescription>
          </DialogHeader>

          <SiswaFormFields classrooms={classrooms} disabled={isPending} />

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending} className="w-full sm:w-auto text-xs">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending || !classrooms.length} className="w-full sm:w-auto text-xs">
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function SiswaFormFields({
  classrooms,
  disabled,
  defaultValues,
}: {
  classrooms: ClassroomOption[]
  disabled?: boolean
  defaultValues?: {
    name?: string
    nis?: string | null
    classroomId?: string
    jenisKelamin?: "laki-laki" | "perempuan"
    status?: "aktif" | "keluar"
  }
}) {
  return (
    <div className="grid gap-3">
      <div className="grid gap-1.5">
        <Label htmlFor="name">Nama Siswa</Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaultValues?.name ?? ""}
          placeholder="Contoh: Andi Saputra"
          required
          autoFocus
          disabled={disabled}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="nis">NIS</Label>
        <Input
          id="nis"
          name="nis"
          defaultValue={defaultValues?.nis ?? ""}
          placeholder="Contoh: 12345"
          disabled={disabled}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="classroomId">Kelas</Label>
        <Select
          name="classroomId"
          defaultValue={defaultValues?.classroomId}
          disabled={disabled || !classrooms.length}
          required
        >
          <SelectTrigger id="classroomId" className="w-full">
            <SelectValue placeholder={classrooms.length ? "Pilih kelas" : "Belum ada kelas"} />
          </SelectTrigger>
          <SelectContent>
            {classrooms.map((classroom) => (
              <SelectItem key={classroom.id} value={classroom.id}>
                {classroom.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
          <Select
            name="jenisKelamin"
            defaultValue={defaultValues?.jenisKelamin ?? "laki-laki"}
            disabled={disabled}
          >
            <SelectTrigger id="jenisKelamin" className="w-full">
              <SelectValue placeholder="Pilih jenis kelamin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="laki-laki">Laki-laki</SelectItem>
              <SelectItem value="perempuan">Perempuan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="status">Status</Label>
          <Select
            name="status"
            defaultValue={defaultValues?.status ?? "aktif"}
            disabled={disabled}
          >
            <SelectTrigger id="status" className="w-full">
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aktif">Aktif</SelectItem>
              <SelectItem value="keluar">Keluar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
