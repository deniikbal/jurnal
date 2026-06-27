"use server"

import { revalidatePath } from "next/cache"
import { and, eq, inArray } from "drizzle-orm"

import { db } from "@/lib/db"
import { assessment, classroom, grade, gradeWeight, schedule, siswa, subject } from "@/lib/db/schema"
import { verifySession } from "@/lib/dal"

export type GradeActionState = {
  success: boolean
  message: string
}

const errorState = (message: string): GradeActionState => ({ success: false, message })
const successState = (message: string): GradeActionState => ({ success: true, message })

function parseScore(value: FormDataEntryValue | null) {
  const score = Number(String(value ?? ""))
  if (!Number.isFinite(score)) return 0
  return Math.min(Math.max(Math.round(score), 0), 100)
}

// Membuat/menyimpan satu penilaian (assessment) beserta nilai siswa.
// - assessmentId kosong  => buat assessment baru
// - assessmentId ada     => update assessment + nilainya
export async function saveAssessment(
  _prevState: GradeActionState,
  formData: FormData,
): Promise<GradeActionState> {
  const session = await verifySession()
  const assessmentId = String(formData.get("assessmentId") ?? "").trim()
  const scheduleId = String(formData.get("scheduleId") ?? "")
  const gradeWeightId = String(formData.get("gradeWeightId") ?? "")
  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const date = String(formData.get("date") ?? "").trim()

  if (!scheduleId) return errorState("Jadwal wajib dipilih")
  if (!gradeWeightId) return errorState("Komponen penilaian wajib dipilih")
  if (!title) return errorState("Nama penilaian wajib diisi")

  const [selectedSchedule] = await db
    .select()
    .from(schedule)
    .where(and(eq(schedule.id, scheduleId), eq(schedule.userId, session.userId)))
    .limit(1)

  if (!selectedSchedule) return errorState("Jadwal tidak ditemukan")

  const [[selectedSubject], [selectedClassroom], [selectedWeight]] = await Promise.all([
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
    db
      .select({ id: gradeWeight.id, name: gradeWeight.name, subjectId: gradeWeight.subjectId })
      .from(gradeWeight)
      .where(and(eq(gradeWeight.id, gradeWeightId), eq(gradeWeight.userId, session.userId)))
      .limit(1),
  ])

  if (!selectedSubject) return errorState("Mata pelajaran tidak ditemukan")
  if (!selectedClassroom) return errorState("Kelas tidak ditemukan")
  if (!selectedWeight) return errorState("Komponen penilaian tidak ditemukan")
  if (selectedWeight.subjectId !== selectedSubject.id) {
    return errorState("Komponen penilaian tidak sesuai mata pelajaran")
  }

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

  let currentAssessmentId = assessmentId

  if (currentAssessmentId) {
    const updated = await db
      .update(assessment)
      .set({
        title,
        description: description || null,
        date: date || null,
        gradeWeightId,
        gradeWeightName: selectedWeight.name,
        updatedAt: new Date(),
      })
      .where(and(eq(assessment.id, currentAssessmentId), eq(assessment.userId, session.userId)))
      .returning({ id: assessment.id })

    if (!updated.length) return errorState("Penilaian tidak ditemukan")
  } else {
    const [created] = await db
      .insert(assessment)
      .values({
        title,
        description: description || null,
        date: date || null,
        gradeWeightId,
        gradeWeightName: selectedWeight.name,
        subjectId: selectedSubject.id,
        subjectName: selectedSubject.name,
        subjectKode: selectedSubject.kode,
        classroomId: selectedClassroom.id,
        classroomName: selectedClassroom.name,
        userId: session.userId,
      })
      .returning({ id: assessment.id })

    currentAssessmentId = created.id
  }

  await db
    .delete(grade)
    .where(and(eq(grade.assessmentId, currentAssessmentId), eq(grade.userId, session.userId)))

  if (students.length) {
    await db.insert(grade).values(
      students.map((student) => ({
        assessmentId: currentAssessmentId,
        siswaId: student.id,
        score: parseScore(formData.get(`score-${student.id}`)),
        userId: session.userId,
      })),
    )
  }

  revalidatePath("/dashboard/jurnal")

  return successState(
    assessmentId ? "Penilaian berhasil diperbarui" : "Penilaian berhasil disimpan",
  )
}

export async function deleteAssessment(
  _prevState: GradeActionState,
  formData: FormData,
): Promise<GradeActionState> {
  const session = await verifySession()
  const id = String(formData.get("id") ?? "")

  if (!id) return errorState("ID penilaian tidak valid")

  const deleted = await db
    .delete(assessment)
    .where(and(eq(assessment.id, id), eq(assessment.userId, session.userId)))
    .returning({ id: assessment.id })

  if (!deleted.length) return errorState("Penilaian tidak ditemukan")

  revalidatePath("/dashboard/jurnal")

  return successState("Penilaian berhasil dihapus")
}

// Tidak dipakai langsung tetapi disediakan untuk kebutuhan mendatang.
export async function getGradesByAssessmentIds(assessmentIds: string[], userId: string) {
  if (!assessmentIds.length) return []
  return db
    .select()
    .from(grade)
    .where(and(inArray(grade.assessmentId, assessmentIds), eq(grade.userId, userId)))
}
