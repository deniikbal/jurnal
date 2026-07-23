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
        <Button type="button" variant="ghost" size="icon" className="size-8 sm:size-7">
          <PencilIcon className="size-4 sm:size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-1.5rem)] sm:max-w-lg p-4 sm:p-6"><form action={formAction} className="space-y-4"><input type="hidden" name="id" value={item.id} /><DialogHeader><DialogTitle className="text-base sm:text-lg">Edit Jadwal</DialogTitle><DialogDescription className="text-xs sm:text-sm">Ubah data jadwal.</DialogDescription></DialogHeader><ScheduleFormFields subjects={subjects} classrooms={classrooms} disabled={isPending} defaultValues={item} /><DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2"><DialogClose asChild><Button type="button" variant="outline" disabled={isPending} className="w-full sm:w-auto text-xs">Batal</Button></DialogClose><Button type="submit" disabled={isPending} className="w-full sm:w-auto text-xs">{isPending ? "Menyimpan..." : "Simpan Perubahan"}</Button></DialogFooter></form></DialogContent>
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
        <Button type="button" variant="destructive" size="icon" className="size-8 sm:size-7">
          <Trash2Icon className="size-4 sm:size-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[calc(100vw-1.5rem)] sm:max-w-md p-4 sm:p-6"><form action={formAction} className="space-y-4"><input type="hidden" name="id" value={item.id} /><AlertDialogHeader><AlertDialogTitle className="text-base sm:text-lg">Hapus jadwal?</AlertDialogTitle><AlertDialogDescription className="text-xs sm:text-sm">Jadwal jam ke-{item.jamKe} akan dihapus permanen.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2"><AlertDialogCancel type="button" disabled={isPending} className="w-full sm:w-auto text-xs">Batal</AlertDialogCancel><Button type="submit" variant="destructive" disabled={isPending} className="w-full sm:w-auto text-xs">{isPending ? "Menghapus..." : "Hapus"}</Button></AlertDialogFooter></form></AlertDialogContent>
    </AlertDialog>
  )
}
