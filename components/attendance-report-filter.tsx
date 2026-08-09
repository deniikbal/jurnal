"use client"

import { useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type AttendanceReportFilterProps = {
  month: string
  currentMonth: string
  classroomId: string
  subjectId: string
  classrooms: { id: string; name: string }[]
  subjects: { id: string; name: string }[]
}

export function AttendanceReportFilter({
  month,
  currentMonth,
  classroomId,
  subjectId,
  classrooms,
  subjects,
}: AttendanceReportFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function updateParam(key: string, value: string, defaultValue = "all") {
    const params = new URLSearchParams(searchParams)
    params.set("tab", "laporan")

    if (value && value !== defaultValue && !(key === "month" && value === currentMonth))
      params.set(key, value)
    else params.delete(key)

    startTransition(() => {
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    })
  }

  return (
    <div
      className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row data-[pending=true]:opacity-70"
      data-pending={isPending}
    >
      <Input
        type="month"
        defaultValue={month}
        onChange={(event) => updateParam("month", event.target.value, "")}
        className="h-9 w-full border-border/80 bg-background text-sm shadow-none sm:w-auto"
        aria-label="Filter bulan laporan"
      />
      <Select value={classroomId} onValueChange={(value) => updateParam("classroomId", value)}>
        <SelectTrigger
          className="h-9 w-full text-sm shadow-none sm:w-40"
          aria-label="Filter kelas laporan"
        >
          <SelectValue placeholder="Semua kelas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua kelas</SelectItem>
          {classrooms.map((classroom) => (
            <SelectItem key={classroom.id} value={classroom.id}>
              {classroom.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={subjectId} onValueChange={(value) => updateParam("subjectId", value)}>
        <SelectTrigger
          className="h-9 w-full text-sm shadow-none sm:w-44"
          aria-label="Filter mapel laporan"
        >
          <SelectValue placeholder="Semua mapel" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua mapel</SelectItem>
          {subjects.map((subject) => (
            <SelectItem key={subject.id} value={subject.id}>
              {subject.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
