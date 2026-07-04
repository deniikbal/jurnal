"use client"

import { useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const days = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"]

export function ScheduleFilter({
  day,
  subjectId,
  classroomId,
  subjects,
  classrooms,
}: {
  day: string
  subjectId: string
  classroomId: string
  subjects: { id: string; name: string }[]
  classrooms: { id: string; name: string }[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams)

    if (value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    params.delete("page")

    startTransition(() => {
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname)
    })
  }

  function reset() {
    startTransition(() => router.replace(pathname))
  }

  return (
    <div className="grid gap-2 sm:grid-cols-[180px_1fr_1fr_auto]">
      <Select value={day} onValueChange={(value) => updateParam("day", value)}>
        <SelectTrigger className="w-full !h-9" aria-label="Filter hari">
          <SelectValue placeholder="Pilih hari" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Hari</SelectItem>
          {days.map((item) => (
            <SelectItem key={item} value={item} className="capitalize">
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={subjectId}
        onValueChange={(value) => updateParam("subjectId", value)}
      >
        <SelectTrigger className="w-full !h-9" aria-label="Filter mapel">
          <SelectValue placeholder="Pilih mapel" />
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

      <Select
        value={classroomId}
        onValueChange={(value) => updateParam("classroomId", value)}
      >
        <SelectTrigger className="w-full !h-9" aria-label="Filter kelas">
          <SelectValue placeholder="Pilih kelas" />
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

      <Button
        type="button"
        variant="outline"
        onClick={reset}
        disabled={
          isPending ||
          (day === "all" && subjectId === "all" && classroomId === "all")
        }
      >
        Reset
      </Button>
    </div>
  )
}
