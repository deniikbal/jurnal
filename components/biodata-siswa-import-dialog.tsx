"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { DownloadIcon } from "lucide-react"

import { importBiodataSiswaByClass, type BiodataSiswaActionState } from "@/lib/biodata-siswa-actions"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const initialState: BiodataSiswaActionState = { success: false, message: "" }

export function BiodataSiswaImportDialog({
  kelasList,
}: {
  kelasList: { id: string; name: string }[]
}) {
  const [open, setOpen] = useState(false)
  const [selectedKelas, setSelectedKelas] = useState("")
  const [state, formAction, isPending] = useActionState(importBiodataSiswaByClass, initialState)

  useEffect(() => {
    if (!state.message) return

    if (state.success) {
      toast.success(state.message)
      setOpen(false)
      setSelectedKelas("")
    } else {
      toast.error(state.message)
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <DownloadIcon className="size-4" />
          Import Siswa
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Import Biodata Siswa</DialogTitle>
            <DialogDescription>
              Import semua nama siswa dari kelas tertentu ke biodata.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-1.5">
            <Label htmlFor="classroom_id">Pilih Kelas</Label>
            <Select
              name="classroom_id"
              value={selectedKelas}
              onValueChange={setSelectedKelas}
              required
            >
              <SelectTrigger id="classroom_id">
                <SelectValue placeholder="Pilih kelas..." />
              </SelectTrigger>
              <SelectContent>
                {kelasList.map((kelas) => (
                  <SelectItem key={kelas.id} value={kelas.id}>
                    {kelas.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending || !selectedKelas}>
              {isPending ? "Mengimpor..." : "Import"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
