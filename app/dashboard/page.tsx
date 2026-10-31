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
  SchoolIcon,
  UsersIcon,
} from "lucide-react"

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
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

const quickActions = [
  {
    href: "/dashboard/jurnal",
    title: "Buat jurnal",
    hint: "Catat pembelajaran",
    icon: PenLineIcon,
  },
  {
    href: "/dashboard/kehadiran",
    title: "Presensi",
    hint: "Isi absensi siswa",
    icon: ClipboardCheckIcon,
  },
  {
    href: "/dashboard/jadwal",
    title: "Jadwal",
    hint: "Lihat jadwal mengajar",
    icon: CalendarDaysIcon,
  },
  {
    href: "/dashboard/siswa",
    title: "Data siswa",
    hint: "Kelola daftar siswa",
    icon: UsersIcon,
  },
]

export default async function DashboardPage() {
  const [
    user,
    daftarKelas,
    daftarSiswa,
    daftarMapel,
    daftarJurnal,
    daftarJadwal,
  ] = await Promise.all([
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
      a.name.localeCompare(b.name, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    )
  const maxSiswa = Math.max(...siswaPerKelas.map((k) => k.count), 1)

  const jurnalTerbaru = [...daftarJurnal]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
  const jurnalHariIni = daftarJurnal.filter((j) =>
    isToday(j.date, today)
  ).length

  const subjectMap = new Map(daftarMapel.map((m) => [m.id, m]))
  const jadwalHariIni = daftarJadwal
    .filter((s) => s.day === todayKey)
    .sort((a, b) => a.jamKe - b.jamKe)
    .map((s) => ({
      ...s,
      subjectName: subjectMap.get(s.subjectId)?.name ?? "Mata pelajaran",
    }))
  const sesiAktif = jadwalHariIni.find(
    (s) =>
      nowMinutes >= toMinutes(s.startTime) && nowMinutes <= toMinutes(s.endTime)
  )
  const sesiBerikutnya = jadwalHariIni.find(
    (s) => toMinutes(s.startTime) > nowMinutes
  )

  const firstName = user?.name?.split(" ")[0] ?? "User"
  const roleLabel = user?.role === "admin" ? "Administrator" : "Guru"
  const greeting = getGreeting(today)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`${greeting}, ${firstName}`}
        description={`${tanggal} · ${roleLabel}`}
        actions={
          sesiAktif ? (
            <Link
              href="/dashboard/jurnal"
              className="group inline-flex items-center gap-3 rounded-xl bg-card px-3 py-2 ring-1 ring-foreground/10 transition-colors hover:bg-muted/60"
            >
              <span className="relative flex size-2" aria-hidden>
                <span className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              <span className="flex flex-col text-left leading-tight">
                <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Sedang mengajar
                </span>
                <span className="text-sm font-medium text-foreground">
                  Jam ke-{sesiAktif.jamKe} · {sesiAktif.subjectName}
                </span>
              </span>
              <ArrowRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : sesiBerikutnya ? (
            <div className="inline-flex items-center gap-3 rounded-xl bg-card px-3 py-2 ring-1 ring-foreground/10">
              <GraduationCapIcon className="size-4 text-muted-foreground" />
              <span className="flex flex-col text-left leading-tight">
                <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Sesi berikutnya
                </span>
                <span className="text-sm font-medium text-foreground">
                  Jam ke-{sesiBerikutnya.jamKe} · {sesiBerikutnya.subjectName}
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    · {sesiBerikutnya.startTime}
                  </span>
                </span>
              </span>
            </div>
          ) : jadwalHariIni.length === 0 ? (
            <div className="inline-flex items-center gap-2 rounded-xl bg-card px-3 py-2 text-sm text-muted-foreground ring-1 ring-foreground/10">
              <CalendarDaysIcon className="size-4" />
              Tidak ada jadwal hari ini
            </div>
          ) : null
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Jurnal"
          value={daftarJurnal.length}
          hint={
            jurnalHariIni > 0
              ? `${jurnalHariIni} dibuat hari ini`
              : "Belum ada jurnal hari ini"
          }
          icon={BookOpenTextIcon}
        />
        <StatCard
          label="Siswa aktif"
          value={siswaAktif.length}
          hint={`${daftarKelas.length} kelas`}
          icon={UsersIcon}
          emphasis
        />
        <StatCard
          label="Kelas"
          value={daftarKelas.length}
          hint="Rombongan belajar"
          icon={SchoolIcon}
        />
        <StatCard
          label="Mata pelajaran"
          value={daftarMapel.length}
          hint="Mapel terdaftar"
          icon={BookOpenTextIcon}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-foreground">Aksi cepat</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-start gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10 transition-colors hover:bg-muted/60"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                <action.icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">
                  {action.title}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {action.hint}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="flex flex-col gap-3 lg:col-span-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-medium text-foreground">
              Distribusi siswa per kelas
            </h2>
            <Link
              href="/dashboard/kelas"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Kelola kelas
              <ArrowRightIcon className="size-3" />
            </Link>
          </div>

          <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            {siswaPerKelas.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {siswaPerKelas.map((item) => {
                  const pct = Math.round((item.count / maxSiswa) * 100)
                  return (
                    <li
                      key={item.name}
                      className="grid grid-cols-[4.5rem_1fr_2rem] items-center gap-3 sm:grid-cols-[6rem_1fr_2rem]"
                    >
                      <span className="truncate text-sm text-foreground">
                        {item.name}
                      </span>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-right text-sm text-muted-foreground tabular-nums">
                        {item.count}
                      </span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <SchoolIcon />
                  </EmptyMedia>
                  <EmptyTitle>Belum ada data kelas</EmptyTitle>
                  <EmptyDescription>
                    Tambahkan kelas untuk mulai mengelola siswa dan jadwal.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/dashboard/kelas">
                      Tambah kelas
                      <ArrowRightIcon />
                    </Link>
                  </Button>
                </EmptyContent>
              </Empty>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-3 lg:col-span-2">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-medium text-foreground">
              Jurnal terbaru
            </h2>
            {jurnalTerbaru.length > 0 ? (
              <Link
                href="/dashboard/jurnal"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Lihat semua
                <ArrowRightIcon className="size-3" />
              </Link>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
            {jurnalTerbaru.length > 0 ? (
              <ol className="divide-y">
                {jurnalTerbaru.map((j) => {
                  const todayRow = isToday(j.date, today)
                  return (
                    <li
                      key={j.id}
                      className="flex items-center gap-3 px-4 py-2.5"
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        {todayRow ? (
                          <CheckCircle2Icon className="size-3.5" />
                        ) : (
                          <span className="text-[10px] font-medium tabular-nums">
                            {new Date(j.date).getDate()}
                          </span>
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-foreground">
                          {j.subjectName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {j.classroomName} · {j.materi}
                        </p>
                      </div>
                      <time
                        className="shrink-0 text-xs text-muted-foreground tabular-nums"
                        dateTime={j.date}
                      >
                        {todayRow ? "Hari ini" : formatDateShort(j.date)}
                      </time>
                    </li>
                  )
                })}
              </ol>
            ) : (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <BookOpenTextIcon />
                  </EmptyMedia>
                  <EmptyTitle>Belum ada jurnal</EmptyTitle>
                  <EmptyDescription>
                    Catat kegiatan mengajar harian Anda agar mudah ditelusuri.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/dashboard/jurnal">
                      Buat jurnal pertama
                      <ArrowRightIcon />
                    </Link>
                  </Button>
                </EmptyContent>
              </Empty>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
