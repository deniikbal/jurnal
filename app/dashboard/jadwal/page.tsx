import type { Metadata } from "next"

import { JadwalPageClient } from "@/components/jadwal-page-client"
import {
  getKelasForCurrentUser,
  getSchedulesForCurrentUser,
  getSubjectsForCurrentUser,
} from "@/lib/dal"

export const metadata: Metadata = { title: "Jadwal" }

export default async function JadwalPage() {
  const [schedules, subjects, classrooms] = await Promise.all([
    getSchedulesForCurrentUser(),
    getSubjectsForCurrentUser(),
    getKelasForCurrentUser(),
  ])

  return (
    <JadwalPageClient
      schedules={schedules}
      subjects={subjects}
      classrooms={classrooms}
    />
  )
}
