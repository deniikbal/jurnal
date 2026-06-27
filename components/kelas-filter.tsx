"use client"

import { useEffect, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

type KelasFilterProps = {
  q: string
  filter: string
}

export function KelasFilter({ q, filter }: KelasFilterProps) {
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

      if (trimmedSearch) {
        params.set("q", trimmedSearch)
      } else {
        params.delete("q")
      }

      params.delete("page")

      const nextQuery = params.toString()

      if (nextQuery === currentQuery) {
        return
      }

      startTransition(() => {
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname)
      })
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [currentQuery, pathname, router, search])

  function handleFilterChange(value: string) {
    const params = new URLSearchParams(searchParams)

    if (value !== "natural") {
      params.set("filter", value)
    } else {
      params.delete("filter")
    }

    params.delete("page")

    startTransition(() => {
      router.replace(params.toString() ? `${pathname}?${params}` : pathname)
    })
  }

  function handleReset() {
    setSearch("")
    startTransition(() => {
      router.replace(pathname)
    })
  }

  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_180px_auto]">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari nama kelas..."
          className="pl-8"
          aria-label="Cari nama kelas"
        />
      </div>
      <NativeSelect
        value={filter}
        onChange={(event) => handleFilterChange(event.target.value)}
        className="w-full"
        aria-label="Urutkan kelas"
      >
        <NativeSelectOption value="natural">Natural</NativeSelectOption>
        <NativeSelectOption value="az">Nama A-Z</NativeSelectOption>
        <NativeSelectOption value="za">Nama Z-A</NativeSelectOption>
        <NativeSelectOption value="terbaru">Terbaru</NativeSelectOption>
        <NativeSelectOption value="terlama">Terlama</NativeSelectOption>
      </NativeSelect>
      <Button
        type="button"
        variant="outline"
        onClick={handleReset}
        disabled={isPending || (!search && filter === "natural")}
      >
        Reset
      </Button>
    </div>
  )
}
