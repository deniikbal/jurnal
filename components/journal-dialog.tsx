"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"

import { saveJournal, type JournalActionState } from "@/lib/journal-actions"
import { Badge } from "@/components/ui/badge"
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
import { Textarea } from "@/components/ui/textarea"

const initialState: JournalActionState = { success: false, message: "" }

type JournalDialogProps = {
  date: string
  schedule: {
    id: string
    jamKe: number
    startTime: string
    endTime: string
  }
  subjectName: string
  classroomName: string
  journal?: {
    materi: string
    kegiatan: string
    catatan: string | null
  }
}

export function JournalDialog({
  date,
  schedule,
  subjectName,
  classroomName,
  journal,
}: JournalDialogProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(saveJournal, initialState)

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
        <Button type="button" variant={journal ? "outline" : "default"}>
          {journal ? "Edit Jurnal" : "Isi Jurnal"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="date" value={date} />
          <input type="hidden" name="scheduleId" value={schedule.id} />

          <DialogHeader>
            <DialogTitle>Jurnal {classroomName}</DialogTitle>
            <DialogDescription>
              {subjectName} • Jam {schedule.jamKe} • {schedule.startTime}–{schedule.endTime}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Tanggal: {date}</Badge>
            <Badge variant={journal ? "default" : "outline"}>
              {journal ? "Sudah diisi" : "Belum diisi"}
            </Badge>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="materi">Materi</Label>
              <Textarea
                id="materi"
                name="materi"
                defaultValue={journal?.materi ?? ""}
                placeholder="Contoh: Persamaan linear satu variabel"
                required
                disabled={isPending}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="kegiatan">Kegiatan Pembelajaran</Label>
              <Textarea
                id="kegiatan"
                name="kegiatan"
                defaultValue={journal?.kegiatan ?? ""}
                placeholder="Tuliskan ringkasan kegiatan pembelajaran hari ini"
                required
                disabled={isPending}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="catatan">Catatan</Label>
              <Textarea
                id="catatan"
                name="catatan"
                defaultValue={journal?.catatan ?? ""}
                placeholder="Catatan tambahan, kendala, atau tindak lanjut"
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
              {isPending ? "Menyimpan..." : "Simpan Jurnal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
