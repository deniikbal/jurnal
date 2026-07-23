"use client"

import { useActionState, useEffect, useState } from "react"
import { SearchIcon, UserCheckIcon } from "lucide-react"
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
import { Input } from "@/components/ui/input"
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
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, AttendanceStatus>>({})
  const [state, formAction, isPending] = useActionState(saveAttendance, initialState)

  useEffect(() => {
    if (!open) return
    setSearchQuery("")
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

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.nis && student.nis.includes(searchQuery)),
  )

  const countHadir = students.filter((s) => (selectedStatuses[s.id] ?? "hadir") === "hadir").length
  const countSakit = students.filter((s) => (selectedStatuses[s.id] ?? "hadir") === "sakit").length
  const countIzin = students.filter((s) => (selectedStatuses[s.id] ?? "hadir") === "izin").length
  const countAlfa = students.filter((s) => (selectedStatuses[s.id] ?? "hadir") === "alfa").length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant={filledCount ? "outline" : "default"} className="w-full sm:w-auto text-xs sm:text-sm">
          {filledCount ? "Edit Kehadiran" : "Isi Kehadiran"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-3xl h-[92vh] sm:h-[85vh] max-h-[92vh] sm:max-h-[85vh] flex flex-col p-3.5 sm:p-6 gap-3 sm:gap-4 overflow-hidden">
        <form action={formAction} className="flex flex-col flex-1 min-h-0 gap-3 sm:gap-4">
          <input type="hidden" name="date" value={date} />
          <input type="hidden" name="scheduleId" value={schedule.id} />

          {/* Header */}
          <DialogHeader className="text-left shrink-0 pr-6">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base sm:text-lg font-bold">Kehadiran {classroomName}</DialogTitle>
              <Badge variant={filledCount ? "default" : "outline"} className="text-[10px]">
                {filledCount ? "Sudah diisi" : "Belum diisi"}
              </Badge>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              {subjectName} • Jam {schedule.jamKe} ({schedule.startTime}–{schedule.endTime}) • {date}
            </DialogDescription>
          </DialogHeader>

          {/* Live Summary Chips & Quick Action */}
          <div className="flex flex-col gap-2 shrink-0 bg-muted/40 p-2.5 sm:p-3 rounded-xl border">
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className="rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 p-1.5">
                <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Hadir</span>
                <span className="block text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">{countHadir}</span>
              </div>
              <div className="rounded-lg bg-amber-500/10 dark:bg-amber-500/20 p-1.5">
                <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-medium">Sakit</span>
                <span className="block text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400">{countSakit}</span>
              </div>
              <div className="rounded-lg bg-blue-500/10 dark:bg-blue-500/20 p-1.5">
                <span className="block text-[10px] text-blue-600 dark:text-blue-400 font-medium">Izin</span>
                <span className="block text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">{countIzin}</span>
              </div>
              <div className="rounded-lg bg-rose-500/10 dark:bg-rose-500/20 p-1.5">
                <span className="block text-[10px] text-rose-600 dark:text-rose-400 font-medium">Alfa</span>
                <span className="block text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400">{countAlfa}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari siswa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs bg-background"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={setAllPresent}
                disabled={isPending || !students.length}
                className="h-8 text-xs shrink-0 gap-1"
              >
                <UserCheckIcon className="size-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Set</span> Hadir Semua
              </Button>
            </div>
          </div>

          {/* Student List (Scrollable Area) */}
          <div className="flex-1 overflow-y-auto min-h-0 rounded-xl border bg-background">
            {/* Desktop Table View (sm screens and above) */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-12 text-xs font-semibold">No</TableHead>
                    <TableHead className="text-xs font-semibold">Nama Siswa</TableHead>
                    <TableHead className="text-xs font-semibold">NIS</TableHead>
                    <TableHead className="w-[300px] text-xs font-semibold text-center">Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student, index) => {
                      const currentStatus = selectedStatuses[student.id] ?? "hadir"
                      return (
                        <TableRow key={student.id} className="hover:bg-muted/30">
                          <TableCell className="text-xs text-muted-foreground">{index + 1}</TableCell>
                          <TableCell className="text-xs font-medium">{student.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{student.nis ?? "-"}</TableCell>
                          <TableCell>
                            <input type="hidden" name={`status-${student.id}`} value={currentStatus} />
                            <div className="flex items-center justify-center gap-1">
                              {attendanceStatusOptions.map((option) => {
                                const isSelected = currentStatus === option.value
                                return (
                                  <Button
                                    key={option.value}
                                    type="button"
                                    size="sm"
                                    variant={isSelected ? "default" : "outline"}
                                    disabled={isPending}
                                    onClick={() => setStudentStatus(student.id, option.value)}
                                    className={cn(
                                      "h-7 min-w-14 px-2 text-xs font-medium transition-colors",
                                      isSelected && option.value === "hadir" && "bg-emerald-600 hover:bg-emerald-600/90 text-white",
                                      isSelected && option.value === "sakit" && "bg-amber-500 hover:bg-amber-500/90 text-white",
                                      isSelected && option.value === "izin" && "bg-blue-500 hover:bg-blue-500/90 text-white",
                                      isSelected && option.value === "alfa" && "bg-rose-600 hover:bg-rose-600/90 text-white",
                                    )}
                                  >
                                    {option.label}
                                  </Button>
                                )
                              })}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-xs text-muted-foreground">
                        {searchQuery ? "Tidak ada siswa yang sesuai dengan pencarian." : "Belum ada siswa aktif di kelas ini."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Touch-Friendly Card List (below sm) */}
            <div className="block sm:hidden p-2.5 space-y-2.5">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => {
                  const currentStatus = selectedStatuses[student.id] ?? "hadir"
                  return (
                    <div key={student.id} className="rounded-xl border bg-card p-3 shadow-2xs space-y-2">
                      <input type="hidden" name={`status-${student.id}`} value={currentStatus} />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-xs font-semibold leading-tight">{student.name}</span>
                        </div>
                        {student.nis && (
                          <span className="text-[10px] text-muted-foreground font-mono">NIS: {student.nis}</span>
                        )}
                      </div>

                      {/* 4 Large Touch Buttons */}
                      <div className="grid grid-cols-4 gap-1.5 pt-1">
                        {attendanceStatusOptions.map((option) => {
                          const isSelected = currentStatus === option.value
                          return (
                            <button
                              key={option.value}
                              type="button"
                              disabled={isPending}
                              onClick={() => setStudentStatus(student.id, option.value)}
                              className={cn(
                                "flex h-9 items-center justify-center rounded-lg text-xs font-semibold transition-all active:scale-95 touch-manipulation border",
                                isSelected
                                  ? option.value === "hadir"
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                    : option.value === "sakit"
                                    ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                                    : option.value === "izin"
                                    ? "bg-blue-500 text-white border-blue-500 shadow-xs"
                                    : "bg-rose-600 text-white border-rose-600 shadow-xs"
                                  : "bg-muted/40 border-transparent text-muted-foreground hover:bg-muted"
                              )}
                            >
                              {option.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  {searchQuery ? "Tidak ada siswa yang sesuai pencarian." : "Belum ada siswa aktif di kelas ini."}
                </div>
              )}
            </div>
          </div>

          {/* Sticky Bottom Footer */}
          <DialogFooter className="flex-row items-center justify-end gap-2 shrink-0 pt-1 border-t">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending} className="flex-1 sm:flex-initial h-9 text-xs">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending || !students.length} className="flex-1 sm:flex-initial h-9 text-xs font-medium">
              {isPending ? "Menyimpan..." : "Simpan Kehadiran"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
