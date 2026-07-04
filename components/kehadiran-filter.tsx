"use client"

import { useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type KehadiranFilterProps = {
  classroomId: string
  subjectId: string
  classrooms: { id: string; name: string }[]
  subjects: { id: string; name: string }[]
}

export function KehadiranFilter({
  classroomId,
  subjectId,
  classrooms,
  subjects,
}: KehadiranFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams)
    params.set("tab", "kehadiran")

    if (value !== "all") params.set(key, value)
    else params.delete(key)

    startTransition(() => {
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    })
  }

  return (
    <div className="flex flex-wrap gap-2 opacity-100 data-[pending=true]:opacity-70" data-pending={isPending}>
      <Select
        value={classroomId}
        onValueChange={(value) => updateParam("classroomId", value)}
      >
        <SelectTrigger className="w-40 !h-9" aria-label="Filter kelas">
          <SelectValue placeholder="Semua Kelas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Kelas</SelectItem>
          {classrooms.map((classroom) => (
            <SelectItem key={classroom.id} value={classroom.id}>
              {classroom.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={subjectId}
        onValueChange={(value) => updateParam("subjectId", value)}
      >
        <SelectTrigger className="w-44 !h-9" aria-label="Filter mapel">
          <SelectValue placeholder="Semua Mapel" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Mapel</SelectItem>
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
