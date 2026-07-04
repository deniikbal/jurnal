"use client"

import { useEffect, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SiswaFilterProps = {
  q: string
  filter: string
  classroomId: string
  status: string
  classrooms: { id: string; name: string }[]
}

export function SiswaFilter({ q, filter, classroomId, status, classrooms }: SiswaFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentQuery = searchParams.toString()
  const [search, setSearch] = useState(q)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(currentQuery)
      const trimmedSearch = search.trim()

      if (trimmedSearch) params.set("q", trimmedSearch)
      else params.delete("q")

      params.delete("page")

      const nextQuery = params.toString()

      if (nextQuery === currentQuery) return

      startTransition(() => {
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname)
      })
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [currentQuery, pathname, router, search])

  function updateParam(key: string, value: string, defaultValue: string) {
    const params = new URLSearchParams(searchParams)

    if (value !== defaultValue) params.set(key, value)
    else params.delete(key)

    params.delete("page")

    startTransition(() => {
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname)
    })
  }

  function handleReset() {
    setSearch("")
    startTransition(() => {
      router.replace(pathname)
    })
  }

  return (
    <div className="grid gap-2 lg:grid-cols-[1fr_180px_180px_160px_auto]">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari nama atau NIS..."
          className="pl-8"
          aria-label="Cari siswa"
        />
      </div>
      <Select
        value={classroomId}
        onValueChange={(value) => updateParam("classroomId", value, "all")}
      >
        <SelectTrigger className="w-full !h-9" aria-label="Filter kelas">
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
        value={status}
        onValueChange={(value) => updateParam("status", value, "all")}
      >
        <SelectTrigger className="w-full !h-9" aria-label="Filter status">
          <SelectValue placeholder="Semua Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Status</SelectItem>
          <SelectItem value="aktif">Aktif</SelectItem>
          <SelectItem value="keluar">Keluar</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filter}
        onValueChange={(value) => updateParam("filter", value, "natural")}
      >
        <SelectTrigger className="w-full !h-9" aria-label="Urutkan siswa">
          <SelectValue placeholder="Natural" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="natural">Natural</SelectItem>
          <SelectItem value="za">Nama Z-A</SelectItem>
          <SelectItem value="terbaru">Terbaru</SelectItem>
          <SelectItem value="terlama">Terlama</SelectItem>
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        onClick={handleReset}
        disabled={isPending || (!search && filter === "natural" && classroomId === "all" && status === "all")}
      >
        Reset
      </Button>
    </div>
  )
}
