"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { UploadIcon } from "lucide-react"
import { toast } from "sonner"

import { importKelas, type KelasImportState } from "@/lib/kelas-actions"
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

const initialState: KelasImportState = { success: false, message: "" }

export function KelasImportDialog() {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(importKelas, initialState)

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
        <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
          <UploadIcon className="size-4" />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-1.5rem)] sm:max-w-md p-4 sm:p-6">
        <form ref={formRef} action={formAction} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Import Kelas dari Excel</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Unggah file .xls atau .xlsx dengan kolom: Nama Kelas, Wali Kelas
              (opsional).
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="file" className="text-xs sm:text-sm">File Excel</Label>
              <a
                href="/api/kelas/template"
                className="text-xs text-primary underline-offset-2 hover:underline"
                download
              >
                Download template
              </a>
            </div>
            <Input
              id="file"
              name="file"
              type="file"
              accept=".xls,.xlsx"
              required
              disabled={isPending}
              className="text-xs sm:text-sm"
            />
          </div>

          {state.errors && state.errors.length > 0 ? (
            <div className="max-h-40 overflow-y-auto rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              <p className="mb-1 font-medium">Baris yang dilewati:</p>
              <ul className="list-inside list-disc space-y-0.5">
                {state.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending} className="w-full sm:w-auto text-xs">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto text-xs">
              {isPending ? "Mengimpor..." : "Import"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
