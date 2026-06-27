"use server"

import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { classroom, journal, schedule, subject } from "@/lib/db/schema"
import { verifySession } from "@/lib/dal"

export type JournalActionState = {
  success: boolean
  message: string
}

const errorState = (message: string): JournalActionState => ({ success: false, message })
const successState = (message: string): JournalActionState => ({ success: true, message })

export async function saveJournal(
  _prevState: JournalActionState,
  formData: FormData,
): Promise<JournalActionState> {
  const session = await verifySession()
  const date = String(formData.get("date") ?? "").trim()
  const scheduleId = String(formData.get("scheduleId") ?? "")
  const materi = String(formData.get("materi") ?? "").trim()
  const kegiatan = String(formData.get("kegiatan") ?? "").trim()
  const catatan = String(formData.get("catatan") ?? "").trim()

  if (!date) return errorState("Tanggal wajib diisi")
  if (!scheduleId) return errorState("Jadwal wajib dipilih")
  if (!materi) return errorState("Materi wajib diisi")
  if (!kegiatan) return errorState("Kegiatan wajib diisi")

  const [selectedSchedule] = await db
    .select()
    .from(schedule)
    .where(and(eq(schedule.id, scheduleId), eq(schedule.userId, session.userId)))
    .limit(1)

  if (!selectedSchedule) return errorState("Jadwal tidak ditemukan")

  const [[selectedSubject], [selectedClassroom]] = await Promise.all([
    db
      .select({ id: subject.id, name: subject.name, kode: subject.kode })
      .from(subject)
      .where(and(eq(subject.id, selectedSchedule.subjectId), eq(subject.userId, session.userId)))
      .limit(1),
    db
      .select({ id: classroom.id, name: classroom.name })
      .from(classroom)
      .where(and(eq(classroom.id, selectedSchedule.classroomId), eq(classroom.userId, session.userId)))
      .limit(1),
  ])

  if (!selectedSubject) return errorState("Mata pelajaran tidak ditemukan")
  if (!selectedClassroom) return errorState("Kelas tidak ditemukan")

  await db
    .delete(journal)
    .where(
      and(
        eq(journal.date, date),
        eq(journal.scheduleId, scheduleId),
        eq(journal.userId, session.userId),
      ),
    )

  await db.insert(journal).values({
    date,
    scheduleId,
    subjectId: selectedSubject.id,
    subjectName: selectedSubject.name,
    subjectKode: selectedSubject.kode,
    classroomId: selectedClassroom.id,
    classroomName: selectedClassroom.name,
    day: selectedSchedule.day,
    jamKe: selectedSchedule.jamKe,
    startTime: selectedSchedule.startTime,
    endTime: selectedSchedule.endTime,
    materi,
    kegiatan,
    catatan: catatan || null,
    userId: session.userId,
  })

  revalidatePath("/dashboard/jurnal")

  return successState("Jurnal berhasil disimpan")
}

export async function deleteJournal(
  _prevState: JournalActionState,
  formData: FormData,
): Promise<JournalActionState> {
  const session = await verifySession()
  const id = String(formData.get("id") ?? "")

  if (!id) return errorState("ID jurnal tidak valid")

  const rows = await db
    .delete(journal)
    .where(and(eq(journal.id, id), eq(journal.userId, session.userId)))
    .returning({ id: journal.id })

  if (!rows.length) return errorState("Jurnal tidak ditemukan")

  revalidatePath("/dashboard/jurnal")

  return successState("Jurnal berhasil dihapus")
}
