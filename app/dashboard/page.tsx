import type { Metadata } from "next"
import Link from "next/link"
import {
  BookOpenIcon,
  BookOpenTextIcon,
  CalendarDaysIcon,
  ClipboardCheckIcon,
  GraduationCapIcon,
  PenLineIcon,
  SchoolIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getCurrentUser,
  getJournalsForCurrentUser,
  getKelasForCurrentUser,
  getSiswaForCurrentUser,
  getSubjectsForCurrentUser,
} from "@/lib/dal"

export const metadata: Metadata = {
  title: "Dashboard",
}

function getInitials(name?: string | null, email?: string | null) {
  const source = name || email || "User"
  return source
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

const statGradients: Record<string, { bg: string; iconBg: string; ring: string }> = {
  siswa: {
    bg: "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent",
    iconBg: "bg-primary/15 text-primary",
    ring: "ring-primary/20",
  },
  kelas: {
    bg: "bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent",
    iconBg: "bg-blue-500/15 text-blue-500",
    ring: "ring-blue-500/20",
  },
  mapel: {
    bg: "bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent",
    iconBg: "bg-purple-500/15 text-purple-500",
    ring: "ring-purple-500/20",
  },
  jurnal: {
    bg: "bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent",
    iconBg: "bg-amber-500/15 text-amber-500",
    ring: "ring-amber-500/20",
  },
}

export default async function DashboardPage() {
  const [user, daftarKelas, daftarSiswa, daftarMapel, daftarJurnal] =
    await Promise.all([
      getCurrentUser(),
      getKelasForCurrentUser(),
      getSiswaForCurrentUser(),
      getSubjectsForCurrentUser(),
      getJournalsForCurrentUser(),
    ])

  const today = new Date()
  const tanggal = today.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  // Hitung siswa per kelas
  const siswaPerKelas = daftarKelas
    .map((kelas) => ({
      name: kelas.name,
      count: daftarSiswa.filter((s) => s.classroomId === kelas.id).length,
    }))
    .sort((a, b) => b.count - a.count)

  const maxSiswa = Math.max(...siswaPerKelas.map((k) => k.count), 1)

  // 5 jurnal terbaru
  const jurnalTerbaru = [...daftarJurnal]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    .slice(0, 5)

  const mapelAktif = daftarMapel.filter((m) => m.status === "aktif").length

  const stats = [
    { key: "siswa", icon: UsersIcon, label: "Total Siswa", value: daftarSiswa.length, sub: undefined as string | undefined },
    { key: "kelas", icon: SchoolIcon, label: "Total Kelas", value: daftarKelas.length, sub: undefined as string | undefined },
    { key: "mapel", icon: BookOpenIcon, label: "Mata Pelajaran", value: daftarMapel.length, sub: `${mapelAktif} aktif` },
    { key: "jurnal", icon: BookOpenTextIcon, label: "Total Jurnal", value: daftarJurnal.length, sub: undefined as string | undefined },
  ] as const

  return (
    <div className="flex flex-col gap-5">
      {/* ===== Welcome Header ===== */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-5 shadow-lg shadow-primary/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative flex flex-wrap items-center gap-4">
          <Avatar className="size-12 rounded-xl ring-2 ring-white/20 ring-offset-2 ring-offset-primary/50">
            <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? "User"} />
            <AvatarFallback className="rounded-xl bg-white/20 text-sm font-semibold text-white">
              {getInitials(user?.name, user?.email)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-white">
              Selamat datang, {user?.name?.split(" ")[0] ?? "User"}
            </h1>
            <p className="truncate text-sm text-white/70">{user?.email}</p>
          </div>
          <Badge variant="secondary" className="border-white/10 bg-white/15 text-xs font-medium text-white backdrop-blur-sm">
            {user?.role === "admin" ? "Administrator" : "Guru"}
          </Badge>
          <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white/80 backdrop-blur-sm sm:flex">
            <CalendarDaysIcon className="size-3.5" />
            {tanggal}
          </div>
        </div>
      </div>

      {/* ===== Stat Cards ===== */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const g = statGradients[s.key]
          return (
            <div
              key={s.key}
              className={`group relative overflow-hidden rounded-xl p-4 ring-1 ${g.bg} ${g.ring} shadow-sm transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground/80 uppercase">
                    {s.label}
                  </p>
                  <p className="text-2xl font-bold tabular-nums tracking-tight">
                    {s.value}
                  </p>
                  {s.sub && (
                    <p className="text-xs text-muted-foreground">{s.sub}</p>
                  )}
                </div>
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${g.iconBg}`}>
                  <s.icon className="size-4" />
                </div>
              </div>
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted/50">
                <div
                  className="h-full rounded-full bg-primary/40 transition-all duration-500"
                  style={{ width: `${Math.min((s.value / 100) * 100, 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* ===== Quick Actions ===== */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground/80 uppercase tracking-wider">
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              href: "/dashboard/siswa",
              icon: UserPlusIcon,
              gradient: "from-primary/20 to-primary/5",
              iconBg: "bg-primary text-white",
              label: "Kelola Siswa",
              desc: "Tambah & edit data siswa",
            },
            {
              href: "/dashboard/jurnal",
              icon: PenLineIcon,
              gradient: "from-amber-500/20 to-amber-500/5",
              iconBg: "bg-amber-500 text-white",
              label: "Buat Jurnal",
              desc: "Catat pembelajaran hari ini",
            },
            {
              href: "/dashboard/kehadiran",
              icon: ClipboardCheckIcon,
              gradient: "from-blue-500/20 to-blue-500/5",
              iconBg: "bg-blue-500 text-white",
              label: "Presensi",
              desc: "Catat kehadiran siswa",
            },
            {
              href: "/dashboard/jadwal",
              icon: CalendarDaysIcon,
              gradient: "from-purple-500/20 to-purple-500/5",
              iconBg: "bg-purple-500 text-white",
              label: "Jadwal",
              desc: "Atur jadwal mengajar",
            },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${a.gradient} opacity-0 transition-opacity duration-200 group-hover:opacity-100`} />
              <div className="relative flex items-start gap-3">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${a.iconBg} shadow-sm`}>
                  <a.icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ===== Two-Column ===== */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Distribusi Siswa per Kelas */}
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0 pb-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <GraduationCapIcon className="size-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Distribusi Siswa</CardTitle>
              <p className="text-xs text-muted-foreground">Per kelas</p>
            </div>
          </CardHeader>
          <CardContent>
            {siswaPerKelas.length > 0 ? (
              <div className="space-y-3">
                {siswaPerKelas.map((item) => (
                  <div key={item.name} className="flex items-center gap-3 text-sm">
                    <span className="w-22 truncate text-xs font-medium">{item.name}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-500"
                        style={{
                          width: `${Math.round((item.count / maxSiswa) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold tabular-nums text-primary">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8">
                <UsersIcon className="size-8 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">Belum ada data kelas</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Jurnal Terbaru */}
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0 pb-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10">
              <BookOpenTextIcon className="size-4 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Jurnal Terbaru</CardTitle>
              <p className="text-xs text-muted-foreground">5 catatan terakhir</p>
            </div>
            {jurnalTerbaru.length > 0 && (
              <Link
                href="/dashboard/jurnal"
                className="ml-auto text-xs font-medium text-primary hover:underline"
              >
                Lihat semua
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {jurnalTerbaru.length > 0 ? (
              <div className="divide-y divide-border">
                {jurnalTerbaru.map((j) => (
                  <div
                    key={j.id}
                    className="flex items-center gap-3 py-2.5 text-sm first:pt-0 last:pb-0"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                      <BookOpenTextIcon className="size-3.5 text-amber-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{j.subjectName}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{j.classroomName}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 border-amber-500/20 bg-amber-500/5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                      {new Date(j.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8">
                <BookOpenTextIcon className="size-8 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">Belum ada jurnal</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
