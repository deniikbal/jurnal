"use server"

import { revalidatePath } from "next/cache"
import { and, eq, inArray } from "drizzle-orm"
import * as XLSX from "xlsx"

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
  try {
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

    await db.batch([
      db
        .delete(grade)
        .where(and(eq(grade.assessmentId, currentAssessmentId), eq(grade.userId, session.userId))),
      db.insert(grade).values(
        students.map((student) => ({
          assessmentId: currentAssessmentId,
          siswaId: student.id,
          score: parseScore(formData.get(`score-${student.id}`)),
          userId: session.userId,
        })),
      ),
    ])

    // ponytail: applyAll — salin assessment ke semua kelas dengan mapel yang sama
    if (!assessmentId && formData.get("applyAll") === "1") {
      const otherSchedules = await db
        .select({ classroomId: schedule.classroomId })
        .from(schedule)
        .where(
          and(
            eq(schedule.subjectId, selectedSubject.id),
            eq(schedule.userId, session.userId),
          ),
        )

      const otherClassroomIds = [
        ...new Set(otherSchedules.map((s) => s.classroomId)),
      ].filter((id) => id !== selectedClassroom.id)

      for (const classroomId of otherClassroomIds) {
        const [cls] = await db
          .select({ id: classroom.id, name: classroom.name })
          .from(classroom)
          .where(
            and(eq(classroom.id, classroomId), eq(classroom.userId, session.userId)),
          )
          .limit(1)
        if (!cls) continue

        await db.insert(assessment).values({
          title,
          description: description || null,
          date: date || null,
          gradeWeightId,
          gradeWeightName: selectedWeight.name,
          subjectId: selectedSubject.id,
          subjectName: selectedSubject.name,
          subjectKode: selectedSubject.kode,
          classroomId: cls.id,
          classroomName: cls.name,
          userId: session.userId,
        })
      }
    }

    revalidatePath("/dashboard/jurnal")

    return successState(
      assessmentId ? "Penilaian berhasil diperbarui" : "Penilaian berhasil disimpan",
    )
  } catch (error) {
    console.error("saveAssessment error:", error)
    return errorState("Gagal menyimpan penilaian. Coba lagi.")
  }
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

export type GradeImportRow = {
  name: string
  nis: string | null
  score: number
  matched: boolean
  reason?: string
}

export type GradeImportState = {
  success: boolean
  message: string
  imported: number
  skipped: number
  rows?: GradeImportRow[]
  errors?: string[]
}

const importError = (message: string): GradeImportState => ({
  success: false, message, imported: 0, skipped: 0,
})

export async function importGrades(
  _prevState: GradeImportState,
  formData: FormData,
): Promise<GradeImportState> {
  const session = await verifySession()
  const assessmentId = String(formData.get("assessmentId") ?? "").trim()
  const file = formData.get("file")

  if (!assessmentId) return importError("Penilaian harus dipilih")

  if (!(file instanceof File) || file.size === 0) {
    return importError("File belum dipilih")
  }

  const fileName = file.name.toLowerCase()
  if (!fileName.endsWith(".xls") && !fileName.endsWith(".xlsx")) {
    return importError("Format file harus .xls atau .xlsx")
  }

  let rawRows: unknown[][]
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    if (!sheet) return importError("File Excel tidak memiliki sheet")
    rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" })
  } catch {
    return importError("Gagal membaca file Excel")
  }

  const dataRows = rawRows.slice(1).filter((r) => r.some((cell) => cell !== ""))
  if (!dataRows.length) return importError("File Excel tidak berisi data")

  const [assessmentRecord] = await db
    .select({ classroomId: assessment.classroomId })
    .from(assessment)
    .where(and(eq(assessment.id, assessmentId), eq(assessment.userId, session.userId)))
    .limit(1)

  if (!assessmentRecord) return importError("Penilaian tidak ditemukan")

  const students = await db
    .select({ id: siswa.id, name: siswa.name, nis: siswa.nis })
    .from(siswa)
    .where(
      and(
        eq(siswa.classroomId, assessmentRecord.classroomId),
        eq(siswa.userId, session.userId),
        eq(siswa.status, "aktif"),
      ),
    )

  const siswaByNis = new Map(
    students.filter((s) => s.nis).map((s) => [s.nis!.toLowerCase(), s]),
  )
  const siswaByName = new Map(
    students.map((s) => [s.name.toLowerCase(), s]),
  )

  const rows: GradeImportRow[] = []
  const errors: string[] = []
  const toInsert: { siswaId: string; score: number }[] = []

  for (const [index, row] of dataRows.entries()) {
    const rowNumber = index + 2
    const nis = String(row[0] ?? "").trim()
    const nama = String(row[1] ?? "").trim()
    const nilaiRaw = String(row[2] ?? "").trim()

    let matchedStudent: (typeof students)[number] | undefined
    let reason: string | undefined

    if (nis) {
      matchedStudent = siswaByNis.get(nis.toLowerCase())
      if (!matchedStudent) {
        reason = `NIS "${nis}" tidak ditemukan`
        errors.push(`Baris ${rowNumber}: ${reason}`)
      }
    } else if (nama) {
      matchedStudent = siswaByName.get(nama.toLowerCase())
      if (!matchedStudent) {
        reason = `nama "${nama}" tidak ditemukan`
        errors.push(`Baris ${rowNumber}: ${reason}`)
      }
    } else {
      reason = "NIS dan Nama kosong"
      errors.push(`Baris ${rowNumber}: ${reason}`)
    }

    if (!matchedStudent || reason) {
      rows.push({
        name: nama || "(kosong)",
        nis: nis || null,
        score: 0,
        matched: false,
        reason,
      })
      continue
    }

    const score = Math.min(Math.max(Math.round(Number(nilaiRaw)) || 0, 0), 100)
    rows.push({
      name: matchedStudent.name,
      nis: matchedStudent.nis,
      score,
      matched: true,
    })
    toInsert.push({ siswaId: matchedStudent.id, score })
  }

  if (!toInsert.length) {
    return {
      success: false,
      message: "Tidak ada data nilai valid. Periksa kembali file atau data siswa.",
      imported: 0,
      skipped: errors.length,
      rows,
      errors,
    }
  }

  await db.batch([
    db
      .delete(grade)
      .where(and(eq(grade.assessmentId, assessmentId), eq(grade.userId, session.userId))),
    db.insert(grade).values(
      toInsert.map((s) => ({
        assessmentId,
        siswaId: s.siswaId,
        score: s.score,
        userId: session.userId,
      })),
    ),
  ])

  revalidatePath("/dashboard/jurnal")

  return {
    success: true,
    message: `${toInsert.length} nilai berhasil diimport`,
    imported: toInsert.length,
    skipped: errors.length,
    rows,
    errors,
  }
}
