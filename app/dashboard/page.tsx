import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRightIcon,
  BookOpenTextIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  ClipboardCheckIcon,
  GraduationCapIcon,
  PenLineIcon,
  UsersIcon,
} from "lucide-react"

import {
  getCurrentUser,
  getJournalsForCurrentUser,
  getKelasForCurrentUser,
  getSchedulesForCurrentUser,
  getSiswaForCurrentUser,
  getSubjectsForCurrentUser,
} from "@/lib/dal"

export const metadata: Metadata = {
  title: "Dashboard",
}

const DAY_KEYS = [
  "minggu",
  "senin",
  "selasa",
  "rabu",
  "kamis",
  "jumat",
  "sabtu",
] as const

type DayKey = (typeof DAY_KEYS)[number]

function getGreeting(date: Date) {
  const hour = date.getHours()
  if (hour < 11) return "Selamat pagi"
  if (hour < 15) return "Selamat siang"
  if (hour < 18) return "Selamat sore"
  return "Selamat malam"
}

function isToday(isoDate: string, today: Date) {
  const d = new Date(isoDate)
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  )
}

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

function formatDateLong(date: Date) {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatDateShort(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  })
}

export default async function DashboardPage() {
  const [user, daftarKelas, daftarSiswa, daftarMapel, daftarJurnal, daftarJadwal] =
    await Promise.all([
      getCurrentUser(),
      getKelasForCurrentUser(),
      getSiswaForCurrentUser(),
      getSubjectsForCurrentUser(),
      getJournalsForCurrentUser(),
      getSchedulesForCurrentUser(),
    ])

  const today = new Date()
  const todayKey: DayKey = DAY_KEYS[today.getDay()]
  const nowMinutes = today.getHours() * 60 + today.getMinutes()
  const tanggal = formatDateLong(today)

  const siswaAktif = daftarSiswa.filter((item) => item.status === "aktif")
  const siswaPerKelas = daftarKelas
    .map((kelas) => ({
      name: kelas.name,
      count: siswaAktif.filter((s) => s.classroomId === kelas.id).length,
    }))
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }),
    )
  const maxSiswa = Math.max(...siswaPerKelas.map((k) => k.count), 1)

  const jurnalTerbaru = [...daftarJurnal]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
  const jurnalHariIni = daftarJurnal.filter((j) => isToday(j.date, today)).length

  const subjectMap = new Map(daftarMapel.map((m) => [m.id, m]))
  const jadwalHariIni = daftarJadwal
    .filter((s) => s.day === todayKey)
    .sort((a, b) => a.jamKe - b.jamKe)
    .map((s) => ({
      ...s,
      subjectName: subjectMap.get(s.subjectId)?.name ?? "Mata pelajaran",
    }))
  const sesiAktif = jadwalHariIni.find(
    (s) => nowMinutes >= toMinutes(s.startTime) && nowMinutes <= toMinutes(s.endTime),
  )
  const sesiBerikutnya = jadwalHariIni.find(
    (s) => toMinutes(s.startTime) > nowMinutes,
  )

  const firstName = user?.name?.split(" ")[0] ?? "User"
  const roleLabel = user?.role === "admin" ? "Administrator" : "Guru"
  const greeting = getGreeting(today)

  return (
    <div className="flex flex-col gap-8">
      <section className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-primary/8 via-primary/3 to-transparent px-6 py-7 sm:px-8 sm:py-9">
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {greeting} &middot; {tanggal}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {firstName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {roleLabel}
              {user?.email ? (
                <>
                  <span className="mx-1.5 text-border">&middot;</span>
                  {user.email}
                </>
              ) : null}
            </p>
          </div>

          {sesiAktif ? (
            <Link
              href="/dashboard/jurnal"
              className="group inline-flex items-center gap-3 self-start rounded-lg border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm transition-colors hover:bg-primary/15 sm:self-end"
            >
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-primary/60" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              <span className="flex flex-col text-left">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  Sedang mengajar
                </span>
                <span className="font-medium text-foreground">
                  Jam ke-{sesiAktif.jamKe} &middot; {sesiAktif.subjectName}
                </span>
              </span>
              <ArrowRightIcon className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : sesiBerikutnya ? (
            <div className="inline-flex items-center gap-3 self-start rounded-lg border border-border bg-card/60 px-4 py-2.5 text-sm sm:self-end">
              <GraduationCapIcon className="size-4 text-muted-foreground" />
              <span className="flex flex-col text-left">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  Sesi berikutnya
                </span>
                <span className="font-medium text-foreground">
                  Jam ke-{sesiBerikutnya.jamKe} &middot; {sesiBerikutnya.subjectName} &middot;{" "}
                  <span className="text-muted-foreground">{sesiBerikutnya.startTime}</span>
                </span>
              </span>
            </div>
          ) : jadwalHariIni.length === 0 ? (
            <div className="inline-flex items-center gap-3 self-start rounded-lg border border-border bg-card/60 px-4 py-2.5 text-sm sm:self-end">
              <CalendarDaysIcon className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Tidak ada jadwal hari ini
              </span>
            </div>
          ) : null}
        </div>
      </section>

      <section>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/dashboard/jurnal"
            className="group relative col-span-2 overflow-hidden rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Jurnal
                </p>
                <p className="text-3xl font-semibold tabular-nums text-foreground">
                  {daftarJurnal.length}
                </p>
              </div>
              <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <BookOpenTextIcon className="size-4" />
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {jurnalHariIni > 0
                ? `${jurnalHariIni} jurnal dibuat hari ini`
                : "Belum ada jurnal hari ini"}
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary">
              <span>Catat pembelajaran</span>
              <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>

          <Link
            href="/dashboard/siswa"
            className="group flex flex-col justify-between rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Siswa aktif
                </p>
                <p className="text-3xl font-semibold tabular-nums text-foreground">
                  {siswaAktif.length}
                </p>
              </div>
              <div className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <UsersIcon className="size-4" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {daftarKelas.length} kelas &middot; {daftarMapel.length} mapel
            </p>
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-medium text-foreground">Aksi cepat</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            href="/dashboard/jurnal"
            className="group flex items-start gap-3 rounded-md border border-border bg-card px-4 py-3 transition-colors hover:bg-accent/30"
          >
            <PenLineIcon className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <span className="block text-sm font-medium text-foreground">
                Buat jurnal
              </span>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                Catat pembelajaran
              </p>
            </div>
          </Link>
          <Link
            href="/dashboard/kehadiran"
            className="group flex items-start gap-3 rounded-md border border-border bg-card px-4 py-3 transition-colors hover:bg-accent/30"
          >
            <ClipboardCheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <span className="block text-sm font-medium text-foreground">
                Presensi
              </span>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                Isi absensi siswa
              </p>
            </div>
          </Link>
          <Link
            href="/dashboard/jadwal"
            className="group flex items-start gap-3 rounded-md border border-border bg-card px-4 py-3 transition-colors hover:bg-accent/30"
          >
            <CalendarDaysIcon className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <span className="block text-sm font-medium text-foreground">
                Jadwal
              </span>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                Lihat jadwal mengajar
              </p>
            </div>
          </Link>
          <Link
            href="/dashboard/siswa"
            className="group flex items-start gap-3 rounded-md border border-border bg-card px-4 py-3 transition-colors hover:bg-accent/30"
          >
            <UsersIcon className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <span className="block text-sm font-medium text-foreground">
                Data siswa
              </span>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                Kelola daftar siswa
              </p>
            </div>
          </Link>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-medium text-foreground">
              Distribusi siswa per kelas
            </h2>
            <Link
              href="/dashboard/kelas"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Kelola kelas
            </Link>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            {siswaPerKelas.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {siswaPerKelas.map((item) => {
                  const pct = Math.round((item.count / maxSiswa) * 100)
                  return (
                    <li
                      key={item.name}
                      className="grid grid-cols-[5rem_1fr_2.5rem] items-center gap-3 sm:grid-cols-[6rem_1fr_2.5rem]"
                    >
                      <span className="truncate text-sm font-medium text-foreground">
                        {item.name}
                      </span>
                      <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-primary/70"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-right text-sm tabular-nums text-muted-foreground">
                        {item.count}
                      </span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <p className="text-sm text-muted-foreground">Belum ada data kelas</p>
                <Link
                  href="/dashboard/kelas"
                  className="inline-flex items-center gap-1 text-xs font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Tambah kelas
                  <ArrowRightIcon className="size-3" />
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="lg:col-span-2">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-medium text-foreground">Jurnal terbaru</h2>
            {jurnalTerbaru.length > 0 ? (
              <Link
                href="/dashboard/jurnal"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Lihat semua
              </Link>
            ) : null}
          </div>
          <div className="rounded-lg border border-border bg-card p-2">
            {jurnalTerbaru.length > 0 ? (
              <ol>
                {jurnalTerbaru.map((j, idx) => {
                  const todayRow = isToday(j.date, today)
                  return (
                    <li
                      key={j.id}
                      className="relative flex gap-3 px-2 py-2.5"
                    >
                      <div className="relative flex flex-col items-center">
                        <div
                          className={`flex size-6 items-center justify-center rounded-full border ${
                            todayRow
                              ? "border-primary/30 bg-primary/10 text-primary"
                              : "border-border bg-background text-muted-foreground"
                          }`}
                        >
                          {todayRow ? (
                            <CheckCircle2Icon className="size-3.5" />
                          ) : (
                            <span className="text-[10px] font-semibold tabular-nums">
                              {idx + 1}
                            </span>
                          )}
                        </div>
                        {idx < jurnalTerbaru.length - 1 ? (
                          <div className="absolute top-6 h-[calc(100%-1rem)] w-px bg-border" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="truncate text-sm font-medium text-foreground">
                          {j.subjectName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {j.classroomName} &middot; {j.materi}
                        </p>
                      </div>
                      <time
                        className="shrink-0 pt-1 text-xs tabular-nums text-muted-foreground"
                        dateTime={j.date}
                      >
                        {todayRow ? "Hari ini" : formatDateShort(j.date)}
                      </time>
                    </li>
                  )
                })}
              </ol>
            ) : (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <p className="text-sm text-muted-foreground">Belum ada jurnal</p>
                <Link
                  href="/dashboard/jurnal"
                  className="inline-flex items-center gap-1 text-xs font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Buat jurnal pertama
                  <ArrowRightIcon className="size-3" />
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
