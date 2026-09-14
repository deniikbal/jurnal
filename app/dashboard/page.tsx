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
      <section className="relative border-4 border-foreground bg-primary p-6 text-primary-foreground shadow-[6px_6px_0px_0px_var(--foreground)] sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 border-2 border-foreground bg-background px-2.5 py-1 text-[11px] font-bold tracking-wider text-foreground uppercase">
              <span className="size-2 bg-foreground" aria-hidden />
              {greeting}
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              {firstName}
            </h1>
            <p className="text-sm font-medium text-primary-foreground/85">
              {tanggal}
              {user?.email ? (
                <>
                  <span className="mx-2 inline-block size-1.5 bg-primary-foreground/60 align-middle" />
                  {user.email}
                </>
              ) : null}
            </p>
            <span className="inline-block border-2 border-foreground bg-background px-2 py-0.5 text-xs font-bold tracking-wide text-foreground uppercase">
              {roleLabel}
            </span>
          </div>

          {sesiAktif ? (
            <Link
              href="/dashboard/jurnal"
              className="group inline-flex items-center gap-3 self-start border-2 border-foreground bg-background px-4 py-2.5 text-foreground shadow-[3px_3px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--foreground)] sm:self-end"
            >
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping bg-primary" />
                <span className="relative inline-flex size-2 bg-primary" />
              </span>
              <span className="flex flex-col text-left">
                <span className="text-[10px] font-bold tracking-wider text-foreground uppercase">
                  Sedang mengajar
                </span>
                <span className="text-sm font-bold">
                  Jam ke-{sesiAktif.jamKe} &middot; {sesiAktif.subjectName}
                </span>
              </span>
              <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : sesiBerikutnya ? (
            <div className="inline-flex items-center gap-3 self-start border-2 border-foreground bg-background px-4 py-2.5 text-foreground sm:self-end">
              <GraduationCapIcon className="size-4" />
              <span className="flex flex-col text-left">
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Sesi berikutnya
                </span>
                <span className="text-sm font-bold">
                  Jam ke-{sesiBerikutnya.jamKe} &middot; {sesiBerikutnya.subjectName}{" "}
                  <span className="font-medium text-muted-foreground">
                    &middot; {sesiBerikutnya.startTime}
                  </span>
                </span>
              </span>
            </div>
          ) : jadwalHariIni.length === 0 ? (
            <div className="inline-flex items-center gap-3 self-start border-2 border-foreground bg-background px-4 py-2.5 text-foreground sm:self-end">
              <CalendarDaysIcon className="size-4" />
              <span className="text-sm font-medium">Tidak ada jadwal hari ini</span>
            </div>
          ) : null}
        </div>
      </section>

      <section>
        <div className="grid gap-5 sm:grid-cols-3">
          <Link
            href="/dashboard/jurnal"
            className="group relative col-span-2 border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--foreground)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Jurnal
                </p>
                <p className="text-5xl font-extrabold tabular-nums leading-none">
                  {daftarJurnal.length}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground">
                <BookOpenTextIcon className="size-4" />
              </div>
            </div>
            <p className="mt-3 text-sm font-medium">
              {jurnalHariIni > 0
                ? `${jurnalHariIni} jurnal dibuat hari ini`
                : "Belum ada jurnal hari ini"}
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 border-2 border-foreground bg-foreground px-2.5 py-1 text-xs font-bold tracking-wide text-background uppercase">
              <span>Catat pembelajaran</span>
              <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>

          <Link
            href="/dashboard/siswa"
            className="group flex flex-col justify-between border-2 border-foreground bg-secondary p-5 text-secondary-foreground shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--foreground)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-wider text-secondary-foreground/80 uppercase">
                  Siswa aktif
                </p>
                <p className="text-5xl font-extrabold tabular-nums leading-none">
                  {siswaAktif.length}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center border-2 border-foreground bg-background text-foreground">
                <UsersIcon className="size-4" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase">
              <span>
                {daftarKelas.length} kelas &middot; {daftarMapel.length} mapel
              </span>
            </div>
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="inline-block border-b-4 border-foreground pb-1 text-sm font-extrabold tracking-wider text-foreground uppercase">
            Aksi cepat
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Link
            href="/dashboard/jurnal"
            className="group flex items-start gap-3 border-2 border-foreground bg-card p-4 shadow-[3px_3px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--foreground)]"
          >
            <span className="flex size-9 shrink-0 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground">
              <PenLineIcon className="size-4" />
            </span>
            <div className="min-w-0">
              <span className="block text-sm font-extrabold text-foreground">
                Buat jurnal
              </span>
              <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
                Catat pembelajaran
              </p>
            </div>
          </Link>
          <Link
            href="/dashboard/kehadiran"
            className="group flex items-start gap-3 border-2 border-foreground bg-card p-4 shadow-[3px_3px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--foreground)]"
          >
            <span className="flex size-9 shrink-0 items-center justify-center border-2 border-foreground bg-accent text-accent-foreground">
              <ClipboardCheckIcon className="size-4" />
            </span>
            <div className="min-w-0">
              <span className="block text-sm font-extrabold text-foreground">
                Presensi
              </span>
              <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
                Isi absensi siswa
              </p>
            </div>
          </Link>
          <Link
            href="/dashboard/jadwal"
            className="group flex items-start gap-3 border-2 border-foreground bg-card p-4 shadow-[3px_3px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--foreground)]"
          >
            <span className="flex size-9 shrink-0 items-center justify-center border-2 border-foreground bg-secondary text-secondary-foreground">
              <CalendarDaysIcon className="size-4" />
            </span>
            <div className="min-w-0">
              <span className="block text-sm font-extrabold text-foreground">
                Jadwal
              </span>
              <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
                Lihat jadwal mengajar
              </p>
            </div>
          </Link>
          <Link
            href="/dashboard/siswa"
            className="group flex items-start gap-3 border-2 border-foreground bg-card p-4 shadow-[3px_3px_0px_0px_var(--foreground)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--foreground)]"
          >
            <span className="flex size-9 shrink-0 items-center justify-center border-2 border-foreground bg-card text-foreground">
              <UsersIcon className="size-4" />
            </span>
            <div className="min-w-0">
              <span className="block text-sm font-extrabold text-foreground">
                Data siswa
              </span>
              <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
                Kelola daftar siswa
              </p>
            </div>
          </Link>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="inline-block border-b-4 border-foreground pb-1 text-sm font-extrabold tracking-wider text-foreground uppercase">
              Distribusi siswa per kelas
            </h2>
            <Link
              href="/dashboard/kelas"
              className="inline-flex items-center gap-1 border-b-2 border-foreground text-xs font-bold tracking-wide text-foreground uppercase hover:opacity-70"
            >
              Kelola kelas
              <ArrowRightIcon className="size-3" />
            </Link>
          </div>
          <div className="border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_var(--foreground)]">
            {siswaPerKelas.length > 0 ? (
              <ul className="flex flex-col gap-3.5">
                {siswaPerKelas.map((item) => {
                  const pct = Math.round((item.count / maxSiswa) * 100)
                  return (
                    <li
                      key={item.name}
                      className="grid grid-cols-[5rem_1fr_2.5rem] items-center gap-3 sm:grid-cols-[6rem_1fr_2.5rem]"
                    >
                      <span className="truncate text-sm font-bold text-foreground">
                        {item.name}
                      </span>
                      <div className="relative h-6 border-2 border-foreground bg-muted">
                        <div
                          className="absolute inset-y-0 left-0 border-r-2 border-foreground bg-primary"
                          style={{ width: `calc(${pct}% )` }}
                        />
                      </div>
                      <span className="border-2 border-foreground bg-background px-1.5 py-0.5 text-right text-sm font-extrabold tabular-nums">
                        {item.count}
                      </span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Belum ada data kelas
                </p>
                <Link
                  href="/dashboard/kelas"
                  className="inline-flex items-center gap-1.5 border-2 border-foreground bg-foreground px-3 py-1.5 text-xs font-bold tracking-wide text-background uppercase hover:opacity-90"
                >
                  Tambah kelas
                  <ArrowRightIcon className="size-3" />
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="lg:col-span-2">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="inline-block border-b-4 border-foreground pb-1 text-sm font-extrabold tracking-wider text-foreground uppercase">
              Jurnal terbaru
            </h2>
            {jurnalTerbaru.length > 0 ? (
              <Link
                href="/dashboard/jurnal"
                className="inline-flex items-center gap-1 border-b-2 border-foreground text-xs font-bold tracking-wide text-foreground uppercase hover:opacity-70"
              >
                Lihat semua
                <ArrowRightIcon className="size-3" />
              </Link>
            ) : null}
          </div>
          <div className="border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_var(--foreground)]">
            {jurnalTerbaru.length > 0 ? (
              <ol>
                {jurnalTerbaru.map((j, idx) => {
                  const todayRow = isToday(j.date, today)
                  return (
                    <li
                      key={j.id}
                      className={`flex items-center gap-3 px-4 py-3 ${
                        idx > 0 ? "border-t-2 border-foreground" : ""
                      } ${todayRow ? "bg-primary/10" : ""}`}
                    >
                      <span
                        className={`flex size-7 shrink-0 items-center justify-center border-2 border-foreground text-[10px] font-extrabold ${
                          todayRow
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-foreground"
                        }`}
                      >
                        {todayRow ? (
                          <CheckCircle2Icon className="size-3.5" />
                        ) : (
                          idx + 1
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-extrabold text-foreground">
                          {j.subjectName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {j.classroomName} &middot; {j.materi}
                        </p>
                      </div>
                      <time
                        className="shrink-0 border-2 border-foreground bg-background px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-foreground uppercase"
                        dateTime={j.date}
                      >
                        {todayRow ? "Hari ini" : formatDateShort(j.date)}
                      </time>
                    </li>
                  )
                })}
              </ol>
            ) : (
              <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Belum ada jurnal
                </p>
                <Link
                  href="/dashboard/jurnal"
                  className="inline-flex items-center gap-1.5 border-2 border-foreground bg-foreground px-3 py-1.5 text-xs font-bold tracking-wide text-background uppercase hover:opacity-90"
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
