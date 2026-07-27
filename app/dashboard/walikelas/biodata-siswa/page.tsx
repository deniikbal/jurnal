import { Suspense } from "react"
import type { Metadata } from "next"

import { BiodataSiswaTableClient } from "@/components/biodata-siswa-table-client"
import {
  getBiodataSiswaForCurrentUser,
  getKelasForCurrentUser,
} from "@/lib/dal"

export const metadata: Metadata = {
  title: "Biodata Siswa",
}

export default async function BiodataSiswaPage() {
  const [biodataList, kelasList] = await Promise.all([
    getBiodataSiswaForCurrentUser(),
    getKelasForCurrentUser(),
  ])

  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Memuat data...</div>}>
      <BiodataSiswaTableClient
        items={biodataList}
        kelasList={kelasList}
      />
    </Suspense>
  )
}
