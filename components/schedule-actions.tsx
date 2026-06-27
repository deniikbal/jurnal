"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { PencilIcon, Trash2Icon } from "lucide-react"

import { deleteSchedule, updateSchedule, type ScheduleActionState } from "@/lib/schedule-actions"
import { ScheduleFormFields, type ScheduleOption } from "@/components/schedule-create-dialog"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const initialState: ScheduleActionState = { success: false, message: "" }
type ScheduleItem = { id: string; day: string; jamKe: number; startTime: string; endTime: string; subjectId: string; classroomId: string }

export function ScheduleActions({ item, subjects, classrooms }: { item: ScheduleItem; subjects: ScheduleOption[]; classrooms: ScheduleOption[] }) {
  return <div className="flex items-center gap-2"><ScheduleEditDialog item={item} subjects={subjects} classrooms={classrooms} /><ScheduleDeleteDialog item={item} /></div>
}

function ScheduleEditDialog({ item, subjects, classrooms }: { item: ScheduleItem; subjects: ScheduleOption[]; classrooms: ScheduleOption[] }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(updateSchedule, initialState)
  useEffect(() => { if (!state.message) return; if (state.success) { toast.success(state.message); setOpen(false) } else toast.error(state.message) }, [state])
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="icon-sm">
          <PencilIcon />
          <span className="sr-only">Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent><form action={formAction} className="space-y-4"><input type="hidden" name="id" value={item.id} /><DialogHeader><DialogTitle>Edit Jadwal</DialogTitle><DialogDescription>Ubah data jadwal.</DialogDescription></DialogHeader><ScheduleFormFields subjects={subjects} classrooms={classrooms} disabled={isPending} defaultValues={item} /><DialogFooter><DialogClose asChild><Button type="button" variant="outline" disabled={isPending}>Batal</Button></DialogClose><Button type="submit" disabled={isPending}>{isPending ? "Menyimpan..." : "Simpan Perubahan"}</Button></DialogFooter></form></DialogContent>
    </Dialog>
  )
}

function ScheduleDeleteDialog({ item }: { item: ScheduleItem }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(deleteSchedule, initialState)
  useEffect(() => { if (!state.message) return; if (state.success) { toast.success(state.message); setOpen(false) } else toast.error(state.message) }, [state])
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" size="icon-sm">
          <Trash2Icon />
          <span className="sr-only">Hapus</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent><form action={formAction} className="space-y-4"><input type="hidden" name="id" value={item.id} /><AlertDialogHeader><AlertDialogTitle>Hapus jadwal?</AlertDialogTitle><AlertDialogDescription>Jadwal jam ke-{item.jamKe} akan dihapus permanen.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel type="button" disabled={isPending}>Batal</AlertDialogCancel><Button type="submit" variant="destructive" disabled={isPending}>{isPending ? "Menghapus..." : "Hapus"}</Button></AlertDialogFooter></form></AlertDialogContent>
    </AlertDialog>
  )
}
