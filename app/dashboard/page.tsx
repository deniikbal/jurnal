import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRightIcon,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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

function formatDateIndonesian(date: Date) {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
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

  // Mata pelajaran aktif
  const mapelAktif = daftarMapel.filter((m) => m.status === "aktif").length

  return (
    <>
      {/* ===== Welcome Banner ===== */}
      <Card className="overflow-hidden border-0 bg-primary/5 shadow-none">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-14 rounded-xl ring-2 ring-primary/20">
              <AvatarImage
                src={user?.image ?? undefined}
                alt={user?.name ?? "User"}
              />
              <AvatarFallback className="rounded-xl bg-primary/10 text-lg font-semibold text-primary">
                {getInitials(user?.name, user?.email)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold tracking-tight">
                  Selamat datang, {user?.name?.split(" ")[0] ?? "User"}
                </h2>
                <Badge variant="secondary" className="capitalize">
                  {user?.role === "admin" ? "Admin" : "Guru"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-background/60 px-4 py-2 text-sm text-muted-foreground shadow-xs">
            <CalendarDaysIcon className="size-4" />
            <span>{formatDateIndonesian(today)}</span>
          </div>
        </CardContent>
      </Card>

      {/* ===== Stat Cards ===== */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Siswa */}
        <Card className="relative overflow-hidden">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <UsersIcon className="size-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-muted-foreground">
                Total Siswa
              </p>
              <p className="text-2xl font-bold tracking-tight">
                {daftarSiswa.length}
              </p>
              <p className="text-xs text-muted-foreground">
                {daftarSiswa.filter((s) => s.status === "aktif").length} aktif
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Kelas */}
        <Card className="relative overflow-hidden">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
              <SchoolIcon className="size-5 text-blue-500" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-muted-foreground">
                Total Kelas
              </p>
              <p className="text-2xl font-bold tracking-tight">
                {daftarKelas.length}
              </p>
              <p className="text-xs text-muted-foreground">
                {siswaPerKelas.length > 0
                  ? `Rata-rata ${Math.round(daftarSiswa.length / daftarKelas.length)} siswa/kelas`
                  : "Belum ada kelas"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mata Pelajaran */}
        <Card className="relative overflow-hidden">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
              <BookOpenIcon className="size-5 text-purple-500" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-muted-foreground">
                Mata Pelajaran
              </p>
              <p className="text-2xl font-bold tracking-tight">
                {daftarMapel.length}
              </p>
              <p className="text-xs text-muted-foreground">
                {mapelAktif} aktif
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Jurnal */}
        <Card className="relative overflow-hidden">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <BookOpenTextIcon className="size-5 text-amber-500" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-muted-foreground">
                Total Jurnal
              </p>
              <p className="text-2xl font-bold tracking-tight">
                {daftarJurnal.length}
              </p>
              <p className="text-xs text-muted-foreground">
                {jurnalTerbaru.length > 0
                  ? `Terakhir ${new Date(jurnalTerbaru[0].date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`
                  : "Belum ada jurnal"}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ===== Quick Actions ===== */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
            Aksi Cepat
          </h2>
          <Separator className="flex-1" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/dashboard/siswa"
            className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
              <UserPlusIcon className="size-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Kelola Siswa</p>
              <p className="text-xs text-muted-foreground">
                Tambah, edit, atau lihat data siswa
              </p>
            </div>
            <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/dashboard/jurnal"
            className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:border-amber-500/30 hover:bg-amber-500/5 hover:shadow-sm"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 transition-colors group-hover:bg-amber-500/20">
              <PenLineIcon className="size-4 text-amber-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Tulis Jurnal</p>
              <p className="text-xs text-muted-foreground">
                Catat materi & kegiatan mengajar
              </p>
            </div>
            <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/dashboard/kehadiran"
            className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:border-blue-500/30 hover:bg-blue-500/5 hover:shadow-sm"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 transition-colors group-hover:bg-blue-500/20">
              <ClipboardCheckIcon className="size-4 text-blue-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Catat Kehadiran</p>
              <p className="text-xs text-muted-foreground">
                Input presensi siswa hari ini
              </p>
            </div>
            <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/dashboard/jadwal"
            className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:border-purple-500/30 hover:bg-purple-500/5 hover:shadow-sm"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 transition-colors group-hover:bg-purple-500/20">
              <CalendarDaysIcon className="size-4 text-purple-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Atur Jadwal</p>
              <p className="text-xs text-muted-foreground">
                Kelola jadwal pelajaran
              </p>
            </div>
            <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* ===== Two-Column Overview ===== */}
      <section className="grid gap-4 lg:grid-cols-2">
        {/* Distribusi Siswa per Kelas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCapIcon className="size-4 text-primary" />
              Distribusi Siswa per Kelas
            </CardTitle>
            <CardDescription>
              Sebaran jumlah siswa di setiap kelas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {siswaPerKelas.length > 0 ? (
              <div className="space-y-3">
                {siswaPerKelas.map((item) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate">{item.name}</span>
                      <span className="ml-2 shrink-0 text-muted-foreground tabular-nums">
                        {item.count} siswa
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${Math.round((item.count / maxSiswa) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
                <SchoolIcon className="size-8 opacity-40" />
                <p>Belum ada data kelas</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Jurnal Terbaru */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpenTextIcon className="size-4 text-amber-500" />
              Jurnal Terbaru
            </CardTitle>
            <CardDescription>
              5 aktivitas mengajar terakhir
            </CardDescription>
          </CardHeader>
          <CardContent>
            {jurnalTerbaru.length > 0 ? (
              <div className="space-y-1">
                {jurnalTerbaru.map((jurnal, i) => (
                  <div key={jurnal.id}>
                    {i > 0 && <Separator className="my-1" />}
                    <div className="flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                        <BookOpenTextIcon className="size-4 text-amber-500" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium">
                            {jurnal.subjectName}
                          </p>
                          <Badge
                            variant="secondary"
                            className="shrink-0 text-[10px]"
                          >
                            {jurnal.classroomName}
                          </Badge>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {jurnal.materi}
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          {new Date(jurnal.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
                <PenLineIcon className="size-8 opacity-40" />
                <p>Belum ada jurnal</p>
                <Link
                  href="/dashboard/jurnal"
                  className="text-xs text-primary hover:underline"
                >
                  Mulai tulis jurnal pertama →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  )
}
