"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { UploadIcon } from "lucide-react"
import { toast } from "sonner"

import { importSiswa, type SiswaImportState } from "@/lib/siswa-actions"
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

const initialState: SiswaImportState = { success: false, message: "" }

export function SiswaImportDialog() {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(importSiswa, initialState)

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
        <Button variant="outline">
          <UploadIcon />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Import Siswa dari Excel</DialogTitle>
            <DialogDescription>
              Unggah file .xls atau .xlsx dengan kolom: Nama, NIS, Kelas, Jenis
              Kelamin, Status. Nama kelas harus sesuai dengan kelas yang sudah ada.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-1.5">
            <Label htmlFor="file">File Excel</Label>
            <Input
              id="file"
              name="file"
              type="file"
              accept=".xls,.xlsx"
              required
              disabled={isPending}
            />
          </div>

          {state.errors && state.errors.length > 0 ? (
            <div className="max-h-40 overflow-y-auto rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <p className="mb-1 font-medium">Baris yang dilewati:</p>
              <ul className="list-inside list-disc space-y-0.5">
                {state.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Mengimpor..." : "Import"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
