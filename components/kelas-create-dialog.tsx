"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { createKelas, type KelasActionState } from "@/lib/kelas-actions"
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

export function KelasCreateDialog() {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(createKelas, initialState)

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
        <Button>Tambah Kelas</Button>
      </DialogTrigger>
      <DialogContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Tambah Kelas</DialogTitle>
            <DialogDescription>
              Masukkan data kelas baru untuk akun yang sedang login.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Nama Kelas</Label>
              <Input
                id="name"
                name="name"
                placeholder="Contoh: X IPA 1"
                required
                autoFocus
                disabled={isPending}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="waliKelas">Wali Kelas</Label>
              <Input
                id="waliKelas"
                name="waliKelas"
                placeholder="Contoh: Ibu Siti"
                disabled={isPending}
              />
            </div>
          </div>

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
