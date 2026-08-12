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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

const initialState: JournalActionState = { success: false, message: "" }

type HistoryJournal = {
  id: string
  date: string
  jamKe: number
  startTime: string
  endTime: string
  subjectName: string
  subjectKode: string | null
  materi: string
  kegiatan: string
  catatan: string | null
}

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
  historyJournals: HistoryJournal[]
}

export function JournalDialog({
  date,
  schedule,
  subjectName,
  classroomName,
  journal,
  historyJournals,
}: JournalDialogProps) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<"input" | "history">("input")
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

  const sortedHistory = [...historyJournals].sort(
    (a, b) =>
      b.date.localeCompare(a.date) ||
      b.jamKe - a.jamKe ||
      b.startTime.localeCompare(a.startTime),
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (value) setTab("input")
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant={journal ? "outline" : "default"}>
          {journal ? "Edit Jurnal" : "Isi Jurnal"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] gap-0 overflow-y-auto sm:max-w-4xl">
        <DialogHeader className="px-4 pt-4 sm:px-6">
          <DialogTitle>Jurnal {classroomName}</DialogTitle>
          <DialogDescription>
            {subjectName} • Jam {schedule.jamKe} • {schedule.startTime}–{schedule.endTime}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-1 border-b border-border px-4 pt-3 sm:px-6">
          <button
            type="button"
            onClick={() => setTab("input")}
            className={`-mb-px border-b-2 pb-2 text-sm transition-colors ${
              tab === "input"
                ? "border-foreground font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Input Jurnal
          </button>
          <button
            type="button"
            onClick={() => setTab("history")}
            className={`-mb-px border-b-2 pb-2 text-sm transition-colors ${
              tab === "history"
                ? "border-foreground font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            History Jurnal
            <span className="ml-1.5 text-xs tabular-nums text-muted-foreground">
              {sortedHistory.length}
            </span>
          </button>
        </div>

        {tab === "input" ? (
          <form action={formAction} className="space-y-4 p-4 sm:p-6">
            <input type="hidden" name="date" value={date} />
            <input type="hidden" name="scheduleId" value={schedule.id} />

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
        ) : (
          <div className="p-4 sm:p-6">
            {sortedHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12 pl-3 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      No
                    </TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      Tanggal
                    </TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      Mapel
                    </TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      Jam
                    </TableHead>
                    <TableHead className="pr-3 text-right text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      Materi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedHistory.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="pl-3 text-xs tabular-nums text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-xs tabular-nums text-foreground whitespace-nowrap">
                        {item.date}
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {item.subjectName}
                        {item.subjectKode ? (
                          <span className="ml-1 text-xs font-normal text-muted-foreground">
                            ({item.subjectKode})
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-xs tabular-nums text-muted-foreground whitespace-nowrap">
                        {item.jamKe} · {item.startTime}–{item.endTime}
                      </TableCell>
                      <TableCell className="max-w-[12rem] truncate pr-3 text-right text-xs text-muted-foreground">
                        {item.materi}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-14 text-center">
                <p className="text-sm text-muted-foreground">
                  Belum ada jurnal yang terinput untuk kelas ini.
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}