"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"

import { saveAttendance, type AttendanceActionState } from "@/lib/attendance-actions"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

const initialState: AttendanceActionState = { success: false, message: "" }

const attendanceStatusOptions = [
  { value: "hadir", label: "Hadir" },
  { value: "sakit", label: "Sakit" },
  { value: "izin", label: "Izin" },
  { value: "alfa", label: "Alfa" },
] as const

type AttendanceStatus = (typeof attendanceStatusOptions)[number]["value"]

type AttendanceDialogProps = {
  date: string
  schedule: {
    id: string
    jamKe: number
    startTime: string
    endTime: string
  }
  subjectName: string
  classroomName: string
  students: {
    id: string
    name: string
    nis: string | null
  }[]
  statuses: Record<string, AttendanceStatus>
}

export function AttendanceDialog({
  date,
  schedule,
  subjectName,
  classroomName,
  students,
  statuses,
}: AttendanceDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, AttendanceStatus>>({})
  const [state, formAction, isPending] = useActionState(saveAttendance, initialState)

  useEffect(() => {
    if (!open) return

    setSelectedStatuses(
      Object.fromEntries(
        students.map((student) => [student.id, statuses[student.id] ?? "hadir"]),
      ),
    )
  }, [open, statuses, students])

  useEffect(() => {
    if (!state.message) return

    if (state.success) {
      toast.success(state.message)
      setOpen(false)
    } else {
      toast.error(state.message)
    }
  }, [state])

  const filledCount = Object.keys(statuses).length

  function setStudentStatus(studentId: string, status: AttendanceStatus) {
    setSelectedStatuses((current) => ({
      ...current,
      [studentId]: status,
    }))
  }

  function setAllPresent() {
    setSelectedStatuses(
      Object.fromEntries(students.map((student) => [student.id, "hadir"])),
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant={filledCount ? "outline" : "default"}>
          {filledCount ? "Edit Kehadiran" : "Isi Kehadiran"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="date" value={date} />
          <input type="hidden" name="scheduleId" value={schedule.id} />

          <DialogHeader>
            <DialogTitle>Kehadiran {classroomName}</DialogTitle>
            <DialogDescription>
              {subjectName} • Jam {schedule.jamKe} • {schedule.startTime}–{schedule.endTime}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Tanggal: {date}</Badge>
            <Badge variant="secondary">Total siswa: {students.length}</Badge>
            <Badge variant={filledCount ? "default" : "outline"}>
              {filledCount ? "Sudah diisi" : "Belum diisi"}
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={setAllPresent}
              disabled={isPending || !students.length}
              className="ml-auto"
            >
              Hadir Semua
            </Button>
          </div>

          <div className="max-h-[60vh] overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">No</TableHead>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead>NIS</TableHead>
                  <TableHead className="w-[300px]">Keterangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length > 0 ? (
                  students.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell className="text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.nis ?? "-"}</TableCell>
                      <TableCell>
                        <input
                          type="hidden"
                          name={`status-${student.id}`}
                          value={selectedStatuses[student.id] ?? "hadir"}
                        />
                        <div className="flex flex-nowrap gap-1.5 whitespace-nowrap">
                          {attendanceStatusOptions.map((option) => {
                            const isSelected =
                              (selectedStatuses[student.id] ?? "hadir") === option.value

                            return (
                              <Button
                                key={option.value}
                                type="button"
                                size="sm"
                                variant={isSelected ? "default" : "outline"}
                                disabled={isPending}
                                onClick={() => setStudentStatus(student.id, option.value)}
                                className={cn(
                                  "min-w-14 shrink-0",
                                  isSelected &&
                                    option.value === "sakit" &&
                                    "bg-yellow-500 text-white hover:bg-yellow-500/90",
                                  isSelected &&
                                    option.value === "izin" &&
                                    "bg-blue-500 text-white hover:bg-blue-500/90",
                                  isSelected &&
                                    option.value === "alfa" &&
                                    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                                )}
                              >
                                {option.label}
                              </Button>
                            )
                          })}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      Belum ada siswa aktif di kelas ini.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending || !students.length}>
              {isPending ? "Menyimpan..." : "Simpan Kehadiran"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
