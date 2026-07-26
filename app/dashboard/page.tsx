import type { Metadata } from "next"
import Link from "next/link"
import {
  BookOpenTextIcon,
  CalendarDaysIcon,
  ClipboardCheckIcon,
  PenLineIcon,
  UsersIcon,
} from "lucide-react"

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

export default async function DashboardPage() {
  const [user, daftarKelas, daftarSiswa, daftarMapel, daftarJurnal] =
    await Promise.all([
      getCurrentUser(),
      getKelasForCurrentUser(),
      getSiswaForCurrentUser(),
      getSubjectsForCurrentUser(),
      getJournalsForCurrentUser(),
    ])

  const tanggal = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const siswaPerKelas = daftarKelas
    .map((kelas) => ({
      name: kelas.name,
      count: daftarSiswa.filter((s) => s.classroomId === kelas.id).length,
    }))
    .sort((a, b) => b.count - a.count)

  const maxSiswa = Math.max(...siswaPerKelas.map((k) => k.count), 1)

  const jurnalTerbaru = [...daftarJurnal]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const mapelAktif = daftarMapel.filter((m) => m.status === "aktif").length
  const firstName = user?.name?.split(" ")[0] ?? "User"
  const roleLabel = user?.role === "admin" ? "Administrator" : "Guru"

  const quickActions = [
    {
      href: "/dashboard/siswa",
      icon: UsersIcon,
      label: "Kelola siswa",
      desc: "Tambah & edit data siswa",
    },
    {
      href: "/dashboard/jurnal",
      icon: PenLineIcon,
      label: "Buat jurnal",
      desc: "Catat pembelajaran hari ini",
    },
    {
      href: "/dashboard/kehadiran",
      icon: ClipboardCheckIcon,
      label: "Presensi",
      desc: "Catat kehadiran siswa",
    },
    {
      href: "/dashboard/jadwal",
      icon: CalendarDaysIcon,
      label: "Jadwal",
      desc: "Atur jadwal mengajar",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Ringkasan
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Selamat datang, {firstName}
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            {roleLabel}
            {user?.email ? (
              <>
                <span className="mx-1.5 text-border">·</span>
                {user.email}
              </>
            ) : null}
            <span className="mx-1.5 text-border">·</span>
            {tanggal}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4 sm:gap-x-8">
          <div>
            <dt className="text-[11px] text-muted-foreground">Siswa</dt>
            <dd className="font-semibold tabular-nums text-foreground">
              {daftarSiswa.length}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Kelas</dt>
            <dd className="font-semibold tabular-nums text-foreground">
              {daftarKelas.length}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Mapel</dt>
            <dd className="font-semibold tabular-nums text-foreground">
              {daftarMapel.length}
              {mapelAktif > 0 ? (
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  · {mapelAktif} aktif
                </span>
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Jurnal</dt>
            <dd className="font-semibold tabular-nums text-foreground">
              {daftarJurnal.length}
            </dd>
          </div>
        </dl>
      </div>

      <section className="overflow-hidden rounded-md border border-border bg-card">
        <div className="border-b border-border px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold text-foreground">Aksi cepat</h2>
          <p className="text-xs text-muted-foreground">Pintasan menu utama</p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col gap-1 px-4 py-4 transition-colors hover:bg-muted/40 sm:px-5"
            >
              <div className="flex items-center gap-2">
                <action.icon className="size-3.5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{action.label}</span>
              </div>
              <p className="pl-5.5 text-xs text-muted-foreground">{action.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-md border border-border bg-card">
          <div className="border-b border-border px-4 py-3 sm:px-5">
            <h2 className="text-sm font-semibold text-foreground">Distribusi siswa</h2>
            <p className="text-xs text-muted-foreground">Jumlah siswa per kelas</p>
          </div>
          <div className="px-4 py-3 sm:px-5">
            {siswaPerKelas.length > 0 ? (
              <ul className="space-y-3">
                {siswaPerKelas.map((item) => (
                  <li key={item.name} className="flex items-center gap-3 text-sm">
                    <span className="w-20 shrink-0 truncate text-xs text-foreground sm:w-24">
                      {item.name}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-foreground/70"
                        style={{
                          width: `${Math.round((item.count / maxSiswa) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="w-6 text-right text-xs tabular-nums text-muted-foreground">
                      {item.count}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <UsersIcon className="size-7 text-muted-foreground/35" />
                <p className="text-sm text-muted-foreground">Belum ada data kelas</p>
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-md border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Jurnal terbaru</h2>
              <p className="text-xs text-muted-foreground">5 catatan terakhir</p>
            </div>
            {jurnalTerbaru.length > 0 ? (
              <Link
                href="/dashboard/jurnal"
                className="text-xs font-medium text-foreground underline-offset-4 hover:underline"
              >
                Lihat semua
              </Link>
            ) : null}
          </div>
          <div>
            {jurnalTerbaru.length > 0 ? (
              <ul className="divide-y divide-border">
                {jurnalTerbaru.map((j) => (
                  <li
                    key={j.id}
                    className="flex items-center gap-3 px-4 py-3 sm:px-5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {j.subjectName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {j.classroomName}
                      </p>
                    </div>
                    <time className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {new Date(j.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </time>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <BookOpenTextIcon className="size-7 text-muted-foreground/35" />
                <p className="text-sm text-muted-foreground">Belum ada jurnal</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
