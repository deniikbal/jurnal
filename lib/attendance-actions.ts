"use server"

import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { attendance, classroom, schedule, siswa, subject } from "@/lib/db/schema"
import { verifySession } from "@/lib/dal"

export type AttendanceActionState = {
  success: boolean
  message: string
}

type AttendanceStatus = "hadir" | "sakit" | "izin" | "alfa"

const errorState = (message: string): AttendanceActionState => ({ success: false, message })
const successState = (message: string): AttendanceActionState => ({ success: true, message })

function parseStatus(value: FormDataEntryValue | null): AttendanceStatus {
  if (value === "sakit" || value === "izin" || value === "alfa") return value
  return "hadir"
}

export async function saveAttendance(
  _prevState: AttendanceActionState,
  formData: FormData,
): Promise<AttendanceActionState> {
  const session = await verifySession()
  const date = String(formData.get("date") ?? "").trim()
  const scheduleId = String(formData.get("scheduleId") ?? "")

  if (!date) return errorState("Tanggal wajib diisi")
  if (!scheduleId) return errorState("Jadwal wajib dipilih")

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

  const students = await db
    .select({ id: siswa.id })
    .from(siswa)
    .where(
      and(
        eq(siswa.classroomId, selectedSchedule.classroomId),
        eq(siswa.userId, session.userId),
        eq(siswa.status, "aktif"),
      ),
    )

  await db
    .delete(attendance)
    .where(
      and(
        eq(attendance.date, date),
        eq(attendance.scheduleId, scheduleId),
        eq(attendance.userId, session.userId),
      ),
    )

  if (students.length) {
    await db.insert(attendance).values(
      students.map((student) => ({
        date,
        scheduleId,
        siswaId: student.id,
        status: parseStatus(formData.get(`status-${student.id}`)),
        subjectId: selectedSubject.id,
        subjectName: selectedSubject.name,
        subjectKode: selectedSubject.kode,
        classroomId: selectedClassroom.id,
        classroomName: selectedClassroom.name,
        day: selectedSchedule.day,
        jamKe: selectedSchedule.jamKe,
        startTime: selectedSchedule.startTime,
        endTime: selectedSchedule.endTime,
        userId: session.userId,
      })),
    )
  }

  revalidatePath("/dashboard/kehadiran")

  return successState("Kehadiran berhasil disimpan")
}
