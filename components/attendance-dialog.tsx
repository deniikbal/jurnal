"use client"

import { useActionState, useEffect, useState } from "react"
import { SearchIcon, UserCheckIcon, UsersIcon } from "lucide-react"
import { toast } from "sonner"

import {
  saveAttendance,
  type AttendanceActionState,
} from "@/lib/attendance-actions"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
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
  const [selectedStatuses, setSelectedStatuses] = useState<
    Record<string, AttendanceStatus>
  >({})
  const [state, formAction, isPending] = useActionState(
    saveAttendance,
    initialState
  )

  useEffect(() => {
    if (!open) return
    setSearchQuery("")
    setSelectedStatuses(
      Object.fromEntries(
        students.map((student) => [student.id, statuses[student.id] ?? "hadir"])
      )
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
      Object.fromEntries(students.map((student) => [student.id, "hadir"]))
    )
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.nis && student.nis.includes(searchQuery))
  )

  const countHadir = students.filter(
    (s) => (selectedStatuses[s.id] ?? "hadir") === "hadir"
  ).length
  const countSakit = students.filter(
    (s) => (selectedStatuses[s.id] ?? "hadir") === "sakit"
  ).length
  const countIzin = students.filter(
    (s) => (selectedStatuses[s.id] ?? "hadir") === "izin"
  ).length
  const countAlfa = students.filter(
    (s) => (selectedStatuses[s.id] ?? "hadir") === "alfa"
  ).length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={filledCount ? "outline" : "default"}
          className="w-full text-xs sm:w-auto sm:text-sm"
        >
          {filledCount ? "Edit Kehadiran" : "Isi Kehadiran"}
        </Button>
      </DialogTrigger>

      <DialogContent className="flex h-[92vh] max-h-[92vh] max-w-[calc(100vw-1rem)] flex-col gap-3 overflow-hidden p-3.5 sm:h-[85vh] sm:max-h-[85vh] sm:max-w-3xl sm:gap-4 sm:p-6">
        <form
          action={formAction}
          className="flex min-h-0 flex-1 flex-col gap-3 sm:gap-4"
        >
          <input type="hidden" name="date" value={date} />
          <input type="hidden" name="scheduleId" value={schedule.id} />

          {/* Header */}
          <DialogHeader className="shrink-0 pr-6 text-left">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base font-bold sm:text-lg">
                Kehadiran {classroomName}
              </DialogTitle>
              <Badge
                variant={filledCount ? "default" : "outline"}
                className="text-[10px]"
              >
                {filledCount ? "Sudah diisi" : "Belum diisi"}
              </Badge>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              {subjectName} • Jam {schedule.jamKe} ({schedule.startTime}–
              {schedule.endTime}) • {date}
            </DialogDescription>
          </DialogHeader>

          {/* Live Summary Chips & Quick Action */}
          <div className="flex shrink-0 flex-col gap-2 rounded-sm border bg-muted/40 p-2.5 sm:p-3">
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className="rounded-sm bg-emerald-500/10 p-1.5 dark:bg-emerald-500/20">
                <span className="block text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  Hadir
                </span>
                <span className="block text-xs font-bold text-emerald-600 sm:text-sm dark:text-emerald-400">
                  {countHadir}
                </span>
              </div>
              <div className="rounded-sm bg-amber-500/10 p-1.5 dark:bg-amber-500/20">
                <span className="block text-[10px] font-medium text-amber-600 dark:text-amber-400">
                  Sakit
                </span>
                <span className="block text-xs font-bold text-amber-600 sm:text-sm dark:text-amber-400">
                  {countSakit}
                </span>
              </div>
              <div className="rounded-sm bg-blue-500/10 p-1.5 dark:bg-blue-500/20">
                <span className="block text-[10px] font-medium text-blue-600 dark:text-blue-400">
                  Izin
                </span>
                <span className="block text-xs font-bold text-blue-600 sm:text-sm dark:text-blue-400">
                  {countIzin}
                </span>
              </div>
              <div className="rounded-sm bg-rose-500/10 p-1.5 dark:bg-rose-500/20">
                <span className="block text-[10px] font-medium text-rose-600 dark:text-rose-400">
                  Alfa
                </span>
                <span className="block text-xs font-bold text-rose-600 sm:text-sm dark:text-rose-400">
                  {countAlfa}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <div className="relative flex-1">
                <SearchIcon className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari siswa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 bg-background pl-8 text-xs"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={setAllPresent}
                disabled={isPending || !students.length}
                className="h-8 shrink-0 gap-1 text-xs"
              >
                <UserCheckIcon className="size-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Set</span> Hadir Semua
              </Button>
            </div>
          </div>

          {/* Student List (Scrollable Area) */}
          <div className="min-h-0 flex-1 overflow-y-auto rounded-sm border bg-background">
            {/* Desktop Table View (sm screens and above) */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-12 text-xs font-semibold">
                      No
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      Nama Siswa
                    </TableHead>
                    <TableHead className="text-xs font-semibold">NIS</TableHead>
                    <TableHead className="w-[300px] text-center text-xs font-semibold">
                      Keterangan
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student, index) => {
                      const currentStatus =
                        selectedStatuses[student.id] ?? "hadir"
                      return (
                        <TableRow
                          key={student.id}
                          className="hover:bg-muted/30"
                        >
                          <TableCell className="text-xs text-muted-foreground">
                            {index + 1}
                          </TableCell>
                          <TableCell className="text-xs font-medium">
                            {student.name}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {student.nis ?? "-"}
                          </TableCell>
                          <TableCell>
                            <input
                              type="hidden"
                              name={`status-${student.id}`}
                              value={currentStatus}
                            />
                            <div className="flex items-center justify-center gap-1">
                              {attendanceStatusOptions.map((option) => {
                                const isSelected =
                                  currentStatus === option.value
                                return (
                                  <Button
                                    key={option.value}
                                    type="button"
                                    size="sm"
                                    variant={isSelected ? "default" : "outline"}
                                    disabled={isPending}
                                    onClick={() =>
                                      setStudentStatus(student.id, option.value)
                                    }
                                    className={cn(
                                      "h-7 min-w-14 px-2 text-xs font-medium transition-colors",
                                      isSelected &&
                                        option.value === "hadir" &&
                                        "bg-emerald-600 text-white hover:bg-emerald-600/90",
                                      isSelected &&
                                        option.value === "sakit" &&
                                        "bg-amber-500 text-white hover:bg-amber-500/90",
                                      isSelected &&
                                        option.value === "izin" &&
                                        "bg-blue-500 text-white hover:bg-blue-500/90",
                                      isSelected &&
                                        option.value === "alfa" &&
                                        "bg-rose-600 text-white hover:bg-rose-600/90"
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
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={4} className="h-32">
                        <Empty>
                          <EmptyHeader>
                            <EmptyMedia variant="icon">
                              <UsersIcon />
                            </EmptyMedia>
                            <EmptyTitle>
                              {searchQuery
                                ? "Tidak ada siswa yang sesuai pencarian."
                                : "Belum ada siswa aktif di kelas ini."}
                            </EmptyTitle>
                          </EmptyHeader>
                        </Empty>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Touch-Friendly Card List (below sm) */}
            <div className="block space-y-2.5 p-2.5 sm:hidden">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => {
                  const currentStatus = selectedStatuses[student.id] ?? "hadir"
                  return (
                    <div
                      key={student.id}
                      className="space-y-2 rounded-sm border bg-card p-3 shadow-2xs"
                    >
                      <input
                        type="hidden"
                        name={`status-${student.id}`}
                        value={currentStatus}
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                            {index + 1}
                          </span>
                          <span className="text-xs leading-tight font-semibold">
                            {student.name}
                          </span>
                        </div>
                        {student.nis && (
                          <span className="font-mono text-[10px] text-muted-foreground">
                            NIS: {student.nis}
                          </span>
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
                              onClick={() =>
                                setStudentStatus(student.id, option.value)
                              }
                              className={cn(
                                "flex h-9 touch-manipulation items-center justify-center rounded-sm border text-xs font-semibold transition-all active:scale-95",
                                isSelected
                                  ? option.value === "hadir"
                                    ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                                    : option.value === "sakit"
                                      ? "border-amber-500 bg-amber-500 text-white shadow-xs"
                                      : option.value === "izin"
                                        ? "border-blue-500 bg-blue-500 text-white shadow-xs"
                                        : "border-rose-600 bg-rose-600 text-white shadow-xs"
                                  : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted"
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
                <Empty className="border">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <UsersIcon />
                    </EmptyMedia>
                    <EmptyTitle>
                      {searchQuery
                        ? "Tidak ada siswa yang sesuai pencarian."
                        : "Belum ada siswa aktif di kelas ini."}
                    </EmptyTitle>
                  </EmptyHeader>
                </Empty>
              )}
            </div>
          </div>

          {/* Sticky Bottom Footer */}
          <DialogFooter className="shrink-0 flex-row items-center justify-end gap-2 border-t pt-1">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                className="h-9 flex-1 text-xs sm:flex-initial"
              >
                Batal
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isPending || !students.length}
              className="h-9 flex-1 text-xs font-medium sm:flex-initial"
            >
              {isPending ? "Menyimpan..." : "Simpan Kehadiran"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
