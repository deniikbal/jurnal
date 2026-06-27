"use client"

import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/kelas": "Kelas",
  "/dashboard/siswa": "Siswa",
  "/dashboard/subject": "Mata Pelajaran",
  "/dashboard/bobot-nilai": "Bobot Nilai",
  "/dashboard/jadwal": "Jadwal",
  "/dashboard/kehadiran": "Kehadiran",
  "/dashboard/jurnal": "Jurnal",
  "/dashboard/settings": "Pengaturan",
}

export function DashboardBreadcrumb() {
  const pathname = usePathname()
  const title = routeTitles[pathname] ?? "Dashboard"

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/dashboard">Jurnal</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>{title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
