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
        <Button className="w-full sm:w-auto text-xs sm:text-sm">Tambah Kelas</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-1.5rem)] sm:max-w-md p-4 sm:p-6">
        <form ref={formRef} action={formAction} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Tambah Kelas</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Masukkan data kelas baru untuk akun yang sedang login.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="name" className="text-xs sm:text-sm">Nama Kelas</Label>
              <Input
                id="name"
                name="name"
                placeholder="Contoh: X IPA 1"
                required
                autoFocus
                disabled={isPending}
                className="text-xs sm:text-sm"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="waliKelas" className="text-xs sm:text-sm">Wali Kelas</Label>
              <Input
                id="waliKelas"
                name="waliKelas"
                placeholder="Contoh: Ibu Siti"
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
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
