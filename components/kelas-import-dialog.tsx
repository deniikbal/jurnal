"use client"

import * as React from "react"
import { useActionState, useEffect, useRef, useState } from "react"
import { UploadIcon } from "lucide-react"
import { toast } from "sonner"

import { importKelas, type KelasImportState } from "@/lib/kelas-actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { ScrollArea } from "@/components/ui/scroll-area"

const initialState: KelasImportState = { success: false, message: "" }

type KelasImportDialogProps = {
  trigger?: React.ReactNode
}

export function KelasImportDialog({ trigger }: KelasImportDialogProps = {}) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(
    importKelas,
    initialState
  )

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
        {trigger ?? (
          <Button
            variant="outline"
            className="w-full text-xs sm:w-auto sm:text-sm"
          >
            <UploadIcon className="size-4" />
            Import Excel
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-1.5rem)] p-4 sm:max-w-md sm:p-6">
        <form ref={formRef} action={formAction} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              Import Kelas dari Excel
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Unggah file .xls atau .xlsx dengan kolom: Nama Kelas, Wali Kelas
              (opsional).
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="file" className="text-xs sm:text-sm">
                File Excel
              </Label>
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
            <Alert variant="destructive">
              <AlertTitle>Baris yang dilewati</AlertTitle>
              <AlertDescription>
                <ScrollArea className="max-h-40">
                  <ul className="list-inside list-disc space-y-0.5">
                    {state.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </ScrollArea>
              </AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter className="flex-col-reverse gap-2 pt-2 sm:flex-row">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                className="w-full text-xs sm:w-auto"
              >
                Batal
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full text-xs sm:w-auto"
            >
              {isPending ? "Mengimpor..." : "Import"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
