"use client"

import { useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

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
    <div className="flex flex-wrap gap-2 opacity-100 data-[pending=true]:opacity-70" data-pending={isPending}>
      <Input
        type="month"
        defaultValue={month}
        onChange={(event) => updateParam("month", event.target.value, "")}
        className="w-auto"
        aria-label="Filter bulan laporan"
      />
      <NativeSelect
        value={classroomId}
        onChange={(event) => updateParam("classroomId", event.target.value)}
        className="w-40"
        aria-label="Filter kelas laporan"
      >
        <NativeSelectOption value="all">Semua Kelas</NativeSelectOption>
        {classrooms.map((classroom) => (
          <NativeSelectOption key={classroom.id} value={classroom.id}>{classroom.name}</NativeSelectOption>
        ))}
      </NativeSelect>
      <NativeSelect
        value={subjectId}
        onChange={(event) => updateParam("subjectId", event.target.value)}
        className="w-44"
        aria-label="Filter mapel laporan"
      >
        <NativeSelectOption value="all">Semua Mapel</NativeSelectOption>
        {subjects.map((subject) => (
          <NativeSelectOption key={subject.id} value={subject.id}>{subject.name}</NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  )
}
