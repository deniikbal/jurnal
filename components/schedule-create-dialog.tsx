"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { createSchedule, type ScheduleActionState } from "@/lib/schedule-actions"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const initialState: ScheduleActionState = { success: false, message: "" }
export type ScheduleOption = { id: string; name: string; kode?: string }
const days = ["senin", "selasa", "rabu", "kamis", "jumat"]

export function ScheduleCreateDialog({ subjects, classrooms }: { subjects: ScheduleOption[]; classrooms: ScheduleOption[] }) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(createSchedule, initialState)
  useEffect(() => {
    if (!state.message) return
    if (state.success) { toast.success(state.message); setOpen(false); formRef.current?.reset() }
    else toast.error(state.message)
  }, [state])
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="w-full sm:w-auto text-xs sm:text-sm">Tambah Jadwal</Button></DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-1.5rem)] sm:max-w-lg p-4 sm:p-6">
        <form ref={formRef} action={formAction} className="space-y-4">
          <DialogHeader><DialogTitle className="text-base sm:text-lg">Tambah Jadwal</DialogTitle><DialogDescription className="text-xs sm:text-sm">Masukkan hari, jam, mapel, dan kelas.</DialogDescription></DialogHeader>
          <ScheduleFormFields subjects={subjects} classrooms={classrooms} disabled={isPending} />
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2"><DialogClose asChild><Button type="button" variant="outline" disabled={isPending} className="w-full sm:w-auto text-xs">Batal</Button></DialogClose><Button type="submit" disabled={isPending || !subjects.length || !classrooms.length} className="w-full sm:w-auto text-xs">{isPending ? "Menyimpan..." : "Simpan"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ScheduleFormFields({ subjects, classrooms, disabled, defaultValues }: { subjects: ScheduleOption[]; classrooms: ScheduleOption[]; disabled?: boolean; defaultValues?: { day?: string; jamKe?: number; startTime?: string; endTime?: string; subjectId?: string; classroomId?: string } }) {
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5"><Label htmlFor="day">Hari</Label><Select name="day" defaultValue={defaultValues?.day ?? "senin"} disabled={disabled}><SelectTrigger id="day" className="w-full"><SelectValue /></SelectTrigger><SelectContent>{days.map((day) => <SelectItem key={day} value={day} className="capitalize">{day}</SelectItem>)}</SelectContent></Select></div>
        <div className="grid gap-1.5"><Label htmlFor="jamKe">Jam Ke</Label><Input id="jamKe" name="jamKe" type="number" min={1} defaultValue={defaultValues?.jamKe ?? 1} required disabled={disabled} /></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5"><Label htmlFor="startTime">Mulai</Label><Input id="startTime" name="startTime" type="time" defaultValue={defaultValues?.startTime ?? ""} required disabled={disabled} /></div>
        <div className="grid gap-1.5"><Label htmlFor="endTime">Selesai</Label><Input id="endTime" name="endTime" type="time" defaultValue={defaultValues?.endTime ?? ""} required disabled={disabled} /></div>
      </div>
      <div className="grid gap-1.5"><Label htmlFor="subjectId">Mapel</Label><Select name="subjectId" defaultValue={defaultValues?.subjectId} disabled={disabled || !subjects.length} required><SelectTrigger id="subjectId" className="w-full"><SelectValue placeholder={subjects.length ? "Pilih mapel" : "Belum ada mapel"} /></SelectTrigger><SelectContent>{subjects.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}{item.kode ? ` (${item.kode})` : ""}</SelectItem>)}</SelectContent></Select></div>
      <div className="grid gap-1.5"><Label htmlFor="classroomId">Kelas</Label><Select name="classroomId" defaultValue={defaultValues?.classroomId} disabled={disabled || !classrooms.length} required><SelectTrigger id="classroomId" className="w-full"><SelectValue placeholder={classrooms.length ? "Pilih kelas" : "Belum ada kelas"} /></SelectTrigger><SelectContent>{classrooms.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div>
    </div>
  )
}
