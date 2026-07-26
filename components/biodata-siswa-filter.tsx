"use client"

import { useEffect, useRef, useState, useTransition } from "react"
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

type BiodataSiswaFilterProps = {
  q: string
  filter: string
}

export function BiodataSiswaFilter({ q, filter }: BiodataSiswaFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentQuery = searchParams.toString()
  const [search, setSearch] = useState(q)
  const [isPending, startTransition] = useTransition()
  const prevSearchRef = useRef(q)

  useEffect(() => {
    const searchChanged = search !== prevSearchRef.current
    prevSearchRef.current = search

    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(currentQuery)
      const trimmedSearch = search.trim()

      if (trimmedSearch) params.set("q", trimmedSearch)
      else params.delete("q")

      if (searchChanged) {
        params.delete("page")
      }

      const nextQuery = params.toString()

      if (nextQuery === currentQuery) return

      startTransition(() => {
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname)
      })
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [currentQuery, pathname, router, search, q])

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
          onValueChange={(value) => updateParam("filter", value, "natural")}
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
          disabled={isPending || (!search && filter === "natural")}
          className="h-9 shrink-0 text-xs sm:text-sm"
        >
          Reset
        </Button>
      </div>
    </div>
  )
}
