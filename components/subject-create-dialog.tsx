"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { createSubject, type SubjectActionState } from "@/lib/subject-actions"
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

const initialState: SubjectActionState = { success: false, message: "" }

export function SubjectCreateDialog() {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(createSubject, initialState)

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
        <Button>Tambah Mapel</Button>
      </DialogTrigger>
      <DialogContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Tambah Mata Pelajaran</DialogTitle>
            <DialogDescription>
              Masukkan nama, kode, dan status mata pelajaran.
            </DialogDescription>
          </DialogHeader>

          <SubjectFormFields disabled={isPending} />

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function SubjectFormFields({
  disabled,
  defaultValues,
}: {
  disabled?: boolean
  defaultValues?: {
    name?: string
    kode?: string
    status?: "aktif" | "nonaktif"
  }
}) {
  return (
    <div className="grid gap-3">
      <div className="grid gap-1.5">
        <Label htmlFor="name">Nama Mata Pelajaran</Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaultValues?.name ?? ""}
          placeholder="Contoh: Matematika"
          required
          autoFocus
          disabled={disabled}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="kode">Kode</Label>
        <Input
          id="kode"
          name="kode"
          defaultValue={defaultValues?.kode ?? ""}
          placeholder="Contoh: MTK"
          required
          disabled={disabled}
        />
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
            <SelectItem value="nonaktif">Nonaktif</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
