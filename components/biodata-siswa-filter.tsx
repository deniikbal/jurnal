"use client"

import { useEffect, useRef, useState } from "react"
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

type BiodataSiswaFilterProps = {
  q: string
  filter: string
  onSearchChange: (q: string) => void
  onFilterChange: (filter: string) => void
}

export function BiodataSiswaFilter({
  q,
  filter,
  onSearchChange,
  onFilterChange,
}: BiodataSiswaFilterProps) {
  const [search, setSearch] = useState(q)
  const prevQRef = useRef(q)

  useEffect(() => {
    if (q !== prevQRef.current) {
      prevQRef.current = q
      setSearch(q)
    }
  }, [q])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (search !== q) {
        onSearchChange(search)
      }
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [search, q, onSearchChange])

  function handleReset() {
    setSearch("")
    onSearchChange("")
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari nama, orang tua, atau nomor HP..."
          className="h-9 border-0 bg-transparent pl-8 text-xs shadow-none focus-visible:ring-0 sm:text-sm"
          aria-label="Cari biodata siswa"
        />
      </div>
      <div className="flex items-center gap-2 sm:shrink-0">
        <Select
          value={filter}
          onValueChange={(value) => onFilterChange(value)}
        >
          <SelectTrigger
            className="h-9 w-full border-0 bg-transparent shadow-none sm:w-36 text-xs sm:text-sm"
            aria-label="Urutkan"
          >
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
          variant="ghost"
          onClick={handleReset}
          disabled={!search && filter === "natural"}
          className="h-9 shrink-0 text-xs sm:text-sm"
        >
          Reset
        </Button>
      </div>
    </div>
  )
}
