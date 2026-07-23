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
  classroomId: string
  subjectId: string
  classrooms: { id: string; name: string }[]
  subjects: { id: string; name: string }[]
}

export function AttendanceReportFilter({
  month,
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

    if (value && value !== defaultValue) params.set(key, value)
    else params.delete(key)

    startTransition(() => {
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    })
  }

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto opacity-100 data-[pending=true]:opacity-70" data-pending={isPending}>
      <Input
        type="month"
        defaultValue={month}
        onChange={(event) => updateParam("month", event.target.value, "")}
        className="w-full sm:w-auto !h-9 text-xs sm:text-sm"
        aria-label="Filter bulan laporan"
      />
      <Select
        value={classroomId}
        onValueChange={(value) => updateParam("classroomId", value)}
      >
        <SelectTrigger className="w-full sm:w-40 !h-9 text-xs sm:text-sm" aria-label="Filter kelas laporan">
          <SelectValue placeholder="Semua Kelas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Kelas</SelectItem>
          {classrooms.map((classroom) => (
            <SelectItem key={classroom.id} value={classroom.id}>{classroom.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={subjectId}
        onValueChange={(value) => updateParam("subjectId", value)}
      >
        <SelectTrigger className="w-full sm:w-44 !h-9 text-xs sm:text-sm" aria-label="Filter mapel laporan">
          <SelectValue placeholder="Semua Mapel" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Mapel</SelectItem>
          {subjects.map((subject) => (
            <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
