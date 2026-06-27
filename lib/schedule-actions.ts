"use server"

import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { classroom, schedule, subject } from "@/lib/db/schema"
import { verifySession } from "@/lib/dal"

export type ScheduleActionState = { success: boolean; message: string }
const errorState = (message: string): ScheduleActionState => ({ success: false, message })
const successState = (message: string): ScheduleActionState => ({ success: true, message })

const days = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"] as const
function parseDay(value: FormDataEntryValue | null) {
  const day = String(value ?? "")
  return days.includes(day as (typeof days)[number]) ? day as (typeof days)[number] : "senin"
}
async function ensureSubject(id: string, userId: string) {
  return Boolean((await db.select({ id: subject.id }).from(subject).where(and(eq(subject.id, id), eq(subject.userId, userId))).limit(1))[0])
}
async function ensureClassroom(id: string, userId: string) {
  return Boolean((await db.select({ id: classroom.id }).from(classroom).where(and(eq(classroom.id, id), eq(classroom.userId, userId))).limit(1))[0])
}

function readForm(formData: FormData) {
  return {
    day: parseDay(formData.get("day")),
    jamKe: Math.max(Number(formData.get("jamKe") ?? "1") || 1, 1),
    startTime: String(formData.get("startTime") ?? "").trim(),
    endTime: String(formData.get("endTime") ?? "").trim(),
    subjectId: String(formData.get("subjectId") ?? ""),
    classroomId: String(formData.get("classroomId") ?? ""),
  }
}

async function validate(data: ReturnType<typeof readForm>, userId: string) {
  if (!data.startTime) return "Jam mulai wajib diisi"
  if (!data.endTime) return "Jam selesai wajib diisi"
  if (!data.subjectId) return "Mata pelajaran wajib dipilih"
  if (!data.classroomId) return "Kelas wajib dipilih"
  if (!(await ensureSubject(data.subjectId, userId))) return "Mata pelajaran tidak ditemukan"
  if (!(await ensureClassroom(data.classroomId, userId))) return "Kelas tidak ditemukan"
  return null
}

export async function createSchedule(_prev: ScheduleActionState, formData: FormData): Promise<ScheduleActionState> {
  const session = await verifySession()
  const data = readForm(formData)
  const error = await validate(data, session.userId)
  if (error) return errorState(error)
  await db.insert(schedule).values({ ...data, userId: session.userId })
  revalidatePath("/dashboard/jadwal")
  return successState("Jadwal berhasil ditambahkan")
}

export async function updateSchedule(_prev: ScheduleActionState, formData: FormData): Promise<ScheduleActionState> {
  const session = await verifySession()
  const id = String(formData.get("id") ?? "")
  const data = readForm(formData)
  if (!id) return errorState("ID jadwal tidak valid")
  const error = await validate(data, session.userId)
  if (error) return errorState(error)
  const rows = await db.update(schedule).set({ ...data, updatedAt: new Date() }).where(and(eq(schedule.id, id), eq(schedule.userId, session.userId))).returning({ id: schedule.id })
  if (!rows.length) return errorState("Jadwal tidak ditemukan")
  revalidatePath("/dashboard/jadwal")
  return successState("Jadwal berhasil diperbarui")
}

export async function deleteSchedule(_prev: ScheduleActionState, formData: FormData): Promise<ScheduleActionState> {
  const session = await verifySession()
  const id = String(formData.get("id") ?? "")
  if (!id) return errorState("ID jadwal tidak valid")
  const rows = await db.delete(schedule).where(and(eq(schedule.id, id), eq(schedule.userId, session.userId))).returning({ id: schedule.id })
  if (!rows.length) return errorState("Jadwal tidak ditemukan")
  revalidatePath("/dashboard/jadwal")
  return successState("Jadwal berhasil dihapus")
}
