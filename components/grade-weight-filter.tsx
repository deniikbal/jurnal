"use client"

import { useEffect, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

type GradeWeightFilterProps = {
  q: string
  filter: string
  subjectId: string
  status: string
  subjects: { id: string; name: string; kode: string }[]
}

export function GradeWeightFilter({ q, filter, subjectId, status, subjects }: GradeWeightFilterProps) {
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
      startTransition(() => router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname))
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
    startTransition(() => router.replace(pathname))
  }

  return (
    <div className="grid gap-2 lg:grid-cols-[1fr_190px_160px_160px_auto]">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama bobot..." className="pl-8" aria-label="Cari bobot nilai" />
      </div>
      <NativeSelect value={subjectId} onChange={(event) => updateParam("subjectId", event.target.value, "all")} className="w-full" aria-label="Filter mapel">
        <NativeSelectOption value="all">Semua Mapel</NativeSelectOption>
        {subjects.map((subject) => <NativeSelectOption key={subject.id} value={subject.id}>{subject.name}</NativeSelectOption>)}
      </NativeSelect>
      <NativeSelect value={status} onChange={(event) => updateParam("status", event.target.value, "all")} className="w-full" aria-label="Filter status">
        <NativeSelectOption value="all">Semua Status</NativeSelectOption>
        <NativeSelectOption value="aktif">Aktif</NativeSelectOption>
        <NativeSelectOption value="nonaktif">Nonaktif</NativeSelectOption>
      </NativeSelect>
      <NativeSelect value={filter} onChange={(event) => updateParam("filter", event.target.value, "natural")} className="w-full" aria-label="Urutkan bobot">
        <NativeSelectOption value="natural">Natural</NativeSelectOption>
        <NativeSelectOption value="za">Nama Z-A</NativeSelectOption>
        <NativeSelectOption value="terbesar">Bobot Terbesar</NativeSelectOption>
        <NativeSelectOption value="terkecil">Bobot Terkecil</NativeSelectOption>
      </NativeSelect>
      <Button type="button" variant="outline" onClick={handleReset} disabled={isPending || (!search && filter === "natural" && subjectId === "all" && status === "all")}>Reset</Button>
    </div>
  )
}
