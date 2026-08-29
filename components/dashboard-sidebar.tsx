"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpenCheckIcon,
  BookOpenTextIcon,
  CalendarDaysIcon,
  ClipboardCheckIcon,
  ClipboardListIcon,
  GraduationCapIcon,
  LayoutDashboardIcon,
  PercentIcon,
  SchoolIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const mainMenu = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Kelas",
    url: "/dashboard/kelas",
    icon: SchoolIcon,
  },
  {
    title: "Siswa",
    url: "/dashboard/siswa",
    icon: UsersIcon,
  },
  {
    title: "Mata Pelajaran",
    url: "/dashboard/subject",
    icon: BookOpenCheckIcon,
  },
  {
    title: "Bobot Nilai",
    url: "/dashboard/bobot-nilai",
    icon: PercentIcon,
  },
  {
    title: "Penilaian",
    url: "/dashboard/penilaian",
    icon: ClipboardListIcon,
  },
  {
    title: "Jadwal",
    url: "/dashboard/jadwal",
    icon: CalendarDaysIcon,
  },
  {
    title: "Kehadiran",
    url: "/dashboard/kehadiran",
    icon: ClipboardCheckIcon,
  },
  {
    title: "Jurnal",
    url: "/dashboard/jurnal",
    icon: BookOpenTextIcon,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  const isActive = (url: string) =>
    url === "/dashboard" ? pathname === url : pathname.startsWith(url)

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip="Jurnal">
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground">
                  <GraduationCapIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Jurnal</span>
                  <span className="truncate text-xs">Kesiswaan</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenu.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Pengaturan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/dashboard/settings")}
                  tooltip="Pengaturan"
                >
                  <Link href="/dashboard/settings">
                    <SettingsIcon />
                    <span>Pengaturan</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
