"use client"

import { useEffect, useState } from "react"
import { RotateCcwIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type GradeWeightFilterProps = {
  q: string
  filter: string
  subjectId: string
  status: string
  subjects: { id: string; name: string; kode: string }[]
  onSearchChange?: (value: string) => void
  onFilterChange?: (value: string) => void
  onSubjectChange?: (value: string) => void
  onStatusChange?: (value: string) => void
}

export function GradeWeightFilter({
  q,
  filter,
  subjectId,
  status,
  subjects,
  onSearchChange,
  onFilterChange,
  onSubjectChange,
  onStatusChange,
}: GradeWeightFilterProps) {
  const [search, setSearch] = useState(q)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      onSearchChange?.(search.trim())
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [search])

  const isDefault =
    !search && filter === "natural" && subjectId === "all" && status === "all"

  function handleReset() {
    setSearch("")
    onSearchChange?.("")
    onFilterChange?.("natural")
    onSubjectChange?.("all")
    onStatusChange?.("all")
  }

  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari nama bobot…"
          className="h-9 border-border/80 bg-background pl-8 text-sm shadow-none"
          aria-label="Cari bobot nilai"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:flex sm:shrink-0">
        <Select value={subjectId} onValueChange={(value) => onSubjectChange?.(value)}>
          <SelectTrigger className="h-9 w-full text-sm lg:w-[10rem]" aria-label="Filter mapel">
            <SelectValue placeholder="Mapel" />
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

        <Select value={status} onValueChange={(value) => onStatusChange?.(value)}>
          <SelectTrigger className="h-9 w-full text-sm lg:w-[8.5rem]" aria-label="Filter status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            <SelectItem value="aktif">Aktif</SelectItem>
            <SelectItem value="nonaktif">Nonaktif</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filter} onValueChange={(value) => onFilterChange?.(value)}>
          <SelectTrigger className="h-9 w-full text-sm lg:w-[9.5rem]" aria-label="Urutkan bobot">
            <SelectValue placeholder="Urutan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="natural">Nama A–Z</SelectItem>
            <SelectItem value="za">Nama Z–A</SelectItem>
            <SelectItem value="terbesar">Bobot terbesar</SelectItem>
            <SelectItem value="terkecil">Bobot terkecil</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={isDefault}
          className="h-9 gap-1.5 text-sm shadow-none"
        >
          <RotateCcwIcon className="size-3.5" />
          Reset
        </Button>
      </div>
    </div>
  )
}
