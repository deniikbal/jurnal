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

type SubjectFilterProps = {
  q: string
  filter: string
  status: string
  onSearchChange?: (value: string) => void
  onFilterChange?: (value: string) => void
  onStatusChange?: (value: string) => void
}

export function SubjectFilter({
  q,
  filter,
  status,
  onSearchChange,
  onFilterChange,
  onStatusChange,
}: SubjectFilterProps) {
  const [search, setSearch] = useState(q)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      onSearchChange?.(search.trim())
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [search])

  const isDefault = !search && filter === "natural" && status === "all"

  function handleReset() {
    setSearch("")
    onSearchChange?.("")
    onFilterChange?.("natural")
    onStatusChange?.("all")
  }

  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari nama atau kode…"
          className="h-9 border-border/80 bg-background pl-8 text-sm shadow-none"
          aria-label="Cari mata pelajaran"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:flex sm:shrink-0">
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
          <SelectTrigger className="h-9 w-full text-sm lg:w-[8.5rem]" aria-label="Urutkan mapel">
            <SelectValue placeholder="Urutan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="natural">Nama A–Z</SelectItem>
            <SelectItem value="za">Nama Z–A</SelectItem>
            <SelectItem value="terbaru">Terbaru</SelectItem>
            <SelectItem value="terlama">Terlama</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={isDefault}
          className="h-9 gap-1.5 text-sm shadow-none col-span-2 sm:col-span-1"
        >
          <RotateCcwIcon className="size-3.5" />
          Reset
        </Button>
      </div>
    </div>
  )
}
