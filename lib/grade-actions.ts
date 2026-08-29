"use server"

import { revalidatePath } from "next/cache"
import { and, eq, inArray, ne, sql } from "drizzle-orm"
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
//
// Driver neon-http: tiap await db.xxx = 1 HTTP round-trip. Optimasi:
//   1. Edit mode: pakai snapshot subjectName/classroomName dari row
//      assessment (sudah di-cache), skip lookup subject+classroom.
//   2. applyAll: gabungkan query schedules+classrooms jadi 1 query
//      dengan JOIN, hemat 1 RT.
//   3. addAllStudentsList paralel dengan applyAll query.
//
// Driver neon-http tidak mendukung db.transaction(); sequence statement
// atomic per-row. Trade-off: kalau grade UPSERT gagal setelah assessment
// ter-insert, user bisa retry. Untuk strict atomicity, swap driver ke
// neon-serverless (lihat catatan di akhir file).
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
    const isEdit = Boolean(assessmentId)

    if (!scheduleId) return errorState("Jadwal wajib dipilih")
    if (!gradeWeightId) return errorState("Komponen penilaian wajib dipilih")
    if (!title) return errorState("Nama penilaian wajib diisi")

    // Lookup paralel: schedule (wajib) + gradeWeight (untuk validasi
    // subjectId match). Edit mode bisa skip subject+classroom karena
    // snapshot di row assessment.
    const [selectedScheduleRows, selectedWeightRows, existingAssessmentRows] =
      await Promise.all([
        db
          .select()
          .from(schedule)
          .where(
            and(eq(schedule.id, scheduleId), eq(schedule.userId, session.userId)),
          )
          .limit(1),
        db
          .select({
            id: gradeWeight.id,
            name: gradeWeight.name,
            subjectId: gradeWeight.subjectId,
          })
          .from(gradeWeight)
          .where(
            and(
              eq(gradeWeight.id, gradeWeightId),
              eq(gradeWeight.userId, session.userId),
            ),
          )
          .limit(1),
        isEdit
          ? db
              .select({
                id: assessment.id,
                subjectId: assessment.subjectId,
                subjectName: assessment.subjectName,
                subjectKode: assessment.subjectKode,
                classroomId: assessment.classroomId,
                classroomName: assessment.classroomName,
              })
              .from(assessment)
              .where(
                and(
                  eq(assessment.id, assessmentId),
                  eq(assessment.userId, session.userId),
                ),
              )
              .limit(1)
          : Promise.resolve([] as Array<{
              id: string
              subjectId: string
              subjectName: string
              subjectKode: string | null
              classroomId: string
              classroomName: string
            }>),
      ])

    const [selectedSchedule] = selectedScheduleRows
    const [selectedWeight] = selectedWeightRows

    if (!selectedSchedule) return errorState("Jadwal tidak ditemukan")
    if (!selectedWeight) return errorState("Komponen penilaian tidak ditemukan")

    // Resolve subject+classroom: pakai snapshot jika edit, lookup jika add.
    let subjectId: string
    let subjectName: string
    let subjectKode: string | null
    let classroomId: string
    let classroomName: string

    if (isEdit) {
      const [existing] = existingAssessmentRows
      if (!existing) return errorState("Penilaian tidak ditemukan")
      subjectId = existing.subjectId
      subjectName = existing.subjectName
      subjectKode = existing.subjectKode
      classroomId = existing.classroomId
      classroomName = existing.classroomName
    } else {
      // Add: lookup subject+classroom paralel. 2 RT paralel (bukan 3).
      const [subjectRows, classroomRows] = await Promise.all([
        db
          .select({ id: subject.id, name: subject.name, kode: subject.kode })
          .from(subject)
          .where(
            and(
              eq(subject.id, selectedSchedule.subjectId),
              eq(subject.userId, session.userId),
            ),
          )
          .limit(1),
        db
          .select({ id: classroom.id, name: classroom.name })
          .from(classroom)
          .where(
            and(
              eq(classroom.id, selectedSchedule.classroomId),
              eq(classroom.userId, session.userId),
            ),
          )
          .limit(1),
      ])
      const [selectedSubject] = subjectRows
      const [selectedClassroom] = classroomRows
      if (!selectedSubject) return errorState("Mata pelajaran tidak ditemukan")
      if (!selectedClassroom) return errorState("Kelas tidak ditemukan")
      subjectId = selectedSubject.id
      subjectName = selectedSubject.name
      subjectKode = selectedSubject.kode
      classroomId = selectedClassroom.id
      classroomName = selectedClassroom.name
    }

    if (selectedWeight.subjectId !== subjectId) {
      return errorState("Komponen penilaian tidak sesuai mata pelajaran")
    }

    const students = await db
      .select({ id: siswa.id })
      .from(siswa)
      .where(
        and(
          eq(siswa.classroomId, classroomId),
          eq(siswa.userId, session.userId),
          eq(siswa.status, "aktif"),
        ),
      )

    const rows = students
      .map((student) => {
        const raw = formData.get(`score-${student.id}`)
        if (raw === null) {
          if (isEdit) return null
          return {
            siswaId: student.id,
            score: 0,
            userId: session.userId,
          }
        }
        const value = String(raw).trim()
        if (value === "" && isEdit) return null
        return {
          siswaId: student.id,
          score: value === "" ? 0 : parseScore(value),
          userId: session.userId,
        }
      })
      .filter((row): row is NonNullable<typeof row> => row !== null)

    // Step 1: update atau insert assessment.
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
        .where(
          and(
            eq(assessment.id, currentAssessmentId),
            eq(assessment.userId, session.userId),
          ),
        )
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
          subjectId,
          subjectName,
          subjectKode,
          classroomId,
          classroomName,
          userId: session.userId,
        })
        .returning({ id: assessment.id })

      currentAssessmentId = created.id
    }

    // Step 2: bulk UPSERT grade (1 RT, atomic per-row).
    const gradeRows = rows.map((r) => ({
      ...r,
      assessmentId: currentAssessmentId,
    }))

    if (gradeRows.length > 0) {
      await db
        .insert(grade)
        .values(gradeRows)
        .onConflictDoUpdate({
          target: [grade.assessmentId, grade.siswaId],
          set: {
            score: sql`excluded.score`,
            updatedAt: new Date(),
          },
        })
    }

    // Step 3: applyAll — gabungkan schedules+classrooms jadi 1 query JOIN.
    // Hemat 1 RT dibanding sequential select.
    let otherClassroomCount = 0
    if (!isEdit && formData.get("applyAll") === "1") {
      const otherClassrooms = await db
        .selectDistinct({
          id: classroom.id,
          name: classroom.name,
        })
        .from(schedule)
        .innerJoin(classroom, eq(schedule.classroomId, classroom.id))
        .where(
          and(
            eq(schedule.subjectId, subjectId),
            eq(schedule.userId, session.userId),
            eq(classroom.userId, session.userId),
            ne(schedule.classroomId, classroomId),
          ),
        )

      if (otherClassrooms.length > 0) {
        await db.insert(assessment).values(
          otherClassrooms.map((cls) => ({
            title,
            description: description || null,
            date: date || null,
            gradeWeightId,
            gradeWeightName: selectedWeight.name,
            subjectId,
            subjectName,
            subjectKode,
            classroomId: cls.id,
            classroomName: cls.name,
            userId: session.userId,
          })),
        )
        otherClassroomCount = otherClassrooms.length
      }
    }

    revalidatePath("/dashboard/jurnal")

    const parts: string[] = []
    if (!isEdit) {
      parts.push(
        `Penilaian "${title}" disimpan: ${gradeRows.length}/${students.length} nilai siswa.`,
      )
    } else {
      parts.push(
        `Penilaian diperbarui: ${gradeRows.length} nilai siswa.`,
      )
    }
    if (otherClassroomCount > 0) {
      parts.push(
        `Disalin ke ${otherClassroomCount} kelas lain (nilai diisi per kelas).`,
      )
    }
    return successState(parts.join(" "))
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

// Versi untuk menu Penilaian standalone: tidak butuh scheduleId, ambil
// subject+classroom langsung dari field. Dipakai saat guru input nilai
// dari halaman /dashboard/penilaian (bukan dari dialog jurnal harian).
//
// Driver neon-http: tiap await db.xxx = 1 HTTP round-trip. Optimasi:
// edit mode skip subject+classroom (pakai snapshot dari assessment row),
// lookup paralel untuk add mode. Trade-off driver: lihat catatan akhir
// file untuk opsi swap ke neon-serverless.
export async function saveAssessmentStandalone(
  _prevState: GradeActionState,
  formData: FormData,
): Promise<GradeActionState> {
  try {
    const session = await verifySession()
    const assessmentId = String(formData.get("assessmentId") ?? "").trim()
    const subjectId = String(formData.get("subjectId") ?? "").trim()
    const classroomId = String(formData.get("classroomId") ?? "").trim()
    const gradeWeightId = String(formData.get("gradeWeightId") ?? "").trim()
    const title = String(formData.get("title") ?? "").trim()
    const description = String(formData.get("description") ?? "").trim()
    const date = String(formData.get("date") ?? "").trim()
    const isEdit = Boolean(assessmentId)

    if (!subjectId) return errorState("Mata pelajaran wajib dipilih")
    if (!classroomId) return errorState("Kelas wajib dipilih")
    if (!gradeWeightId) return errorState("Komponen penilaian wajib dipilih")
    if (!title) return errorState("Nama penilaian wajib diisi")

    // Lookup paralel: gradeWeight (untuk validasi subjectId match) +
    // existing assessment (untuk snapshot subject+classroom saat edit) +
    // students list. Hemat dibanding sequential.
    const [selectedWeightRows, existingAssessmentRows, students] =
      await Promise.all([
        db
          .select({
            id: gradeWeight.id,
            name: gradeWeight.name,
            subjectId: gradeWeight.subjectId,
          })
          .from(gradeWeight)
          .where(
            and(
              eq(gradeWeight.id, gradeWeightId),
              eq(gradeWeight.userId, session.userId),
            ),
          )
          .limit(1),
        isEdit
          ? db
              .select({
                id: assessment.id,
                subjectId: assessment.subjectId,
                subjectName: assessment.subjectName,
                subjectKode: assessment.subjectKode,
                classroomId: assessment.classroomId,
                classroomName: assessment.classroomName,
              })
              .from(assessment)
              .where(
                and(
                  eq(assessment.id, assessmentId),
                  eq(assessment.userId, session.userId),
                ),
              )
              .limit(1)
          : Promise.resolve([] as Array<{
              id: string
              subjectId: string
              subjectName: string
              subjectKode: string | null
              classroomId: string
              classroomName: string
            }>),
        db
          .select({ id: siswa.id })
          .from(siswa)
          .where(
            and(
              eq(siswa.classroomId, classroomId),
              eq(siswa.userId, session.userId),
              eq(siswa.status, "aktif"),
            ),
          ),
      ])

    const [selectedWeight] = selectedWeightRows
    if (!selectedWeight) return errorState("Komponen penilaian tidak ditemukan")

    // Resolve subject+classroom snapshot.
    let resolvedSubjectId: string
    let subjectName: string
    let subjectKode: string | null
    let resolvedClassroomId: string
    let classroomName: string

    if (isEdit) {
      const [existing] = existingAssessmentRows
      if (!existing) return errorState("Penilaian tidak ditemukan")
      resolvedSubjectId = existing.subjectId
      subjectName = existing.subjectName
      subjectKode = existing.subjectKode
      resolvedClassroomId = existing.classroomId
      classroomName = existing.classroomName
    } else {
      // Add: lookup subject+classroom paralel. 2 RT paralel.
      const [subjectRows, classroomRows] = await Promise.all([
        db
          .select({ id: subject.id, name: subject.name, kode: subject.kode })
          .from(subject)
          .where(
            and(eq(subject.id, subjectId), eq(subject.userId, session.userId)),
          )
          .limit(1),
        db
          .select({ id: classroom.id, name: classroom.name })
          .from(classroom)
          .where(
            and(
              eq(classroom.id, classroomId),
              eq(classroom.userId, session.userId),
            ),
          )
          .limit(1),
      ])
      const [selectedSubject] = subjectRows
      const [selectedClassroom] = classroomRows
      if (!selectedSubject) return errorState("Mata pelajaran tidak ditemukan")
      if (!selectedClassroom) return errorState("Kelas tidak ditemukan")
      resolvedSubjectId = selectedSubject.id
      subjectName = selectedSubject.name
      subjectKode = selectedSubject.kode
      resolvedClassroomId = selectedClassroom.id
      classroomName = selectedClassroom.name
    }

    if (selectedWeight.subjectId !== resolvedSubjectId) {
      return errorState("Komponen penilaian tidak sesuai mata pelajaran")
    }

    if (students.length === 0) {
      return errorState("Tidak ada siswa aktif di kelas ini")
    }

    const rows = students
      .map((student) => {
        const raw = formData.get(`score-${student.id}`)
        if (raw === null) {
          if (isEdit) return null
          return {
            siswaId: student.id,
            score: 0,
            userId: session.userId,
          }
        }
        const value = String(raw).trim()
        if (value === "" && isEdit) return null
        return {
          siswaId: student.id,
          score: value === "" ? 0 : parseScore(value),
          userId: session.userId,
        }
      })
      .filter((row): row is NonNullable<typeof row> => row !== null)

    // Step 1: update atau insert assessment.
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
        .where(
          and(
            eq(assessment.id, currentAssessmentId),
            eq(assessment.userId, session.userId),
          ),
        )
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
          subjectId: resolvedSubjectId,
          subjectName,
          subjectKode,
          classroomId: resolvedClassroomId,
          classroomName,
          userId: session.userId,
        })
        .returning({ id: assessment.id })
      currentAssessmentId = created.id
    }

    // Step 2: bulk UPSERT grade (1 RT, atomic per-row).
    const gradeRows = rows.map((r) => ({
      ...r,
      assessmentId: currentAssessmentId,
    }))

    if (gradeRows.length > 0) {
      await db
        .insert(grade)
        .values(gradeRows)
        .onConflictDoUpdate({
          target: [grade.assessmentId, grade.siswaId],
          set: {
            score: sql`excluded.score`,
            updatedAt: new Date(),
          },
        })
    }

    revalidatePath("/dashboard/jurnal")
    revalidatePath("/dashboard/penilaian")

    if (!isEdit) {
      return successState(
        `Penilaian "${title}" disimpan: ${gradeRows.length}/${students.length} nilai siswa.`,
      )
    }
    return successState(
      `Penilaian diperbarui: ${gradeRows.length} nilai siswa.`,
    )
  } catch (error) {
    console.error("saveAssessmentStandalone error:", error)
    return errorState("Gagal menyimpan penilaian. Coba lagi.")
  }
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

  await db
    .insert(grade)
    .values(
      toInsert.map((s) => ({
        assessmentId,
        siswaId: s.siswaId,
        score: s.score,
        userId: session.userId,
      })),
    )
    .onConflictDoUpdate({
      target: [grade.assessmentId, grade.siswaId],
      set: {
        score: sql`excluded.score`,
        updatedAt: new Date(),
      },
    })

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

// CATATAN DRIVER (informasional, bukan code path):
// Saat ini pakai drizzle-orm/neon-http (lihat lib/db/index.ts). Driver ini
// pakai HTTP fetch per query, jadi tiap `await db.xxx` adalah 1 round-trip
// (RT) ke Neon. Tiap RT ~50-200ms tergantung region + cold start.
//
// Trade-off:
//   neon-http (sekarang): 1 RT per query, tidak ada connection pool, paling
//     cocok untuk workload single-tenant dengan traffic rendah-menengah.
//   neon-serverless (opsional, perlu migrasi): WebSocket + connection
//     pooling, RT bisa 10-30ms setelah warmup, dukung `db.transaction()`.
//     Cocok untuk traffic tinggi atau multi-statement atomicity.
//
// Migrasi ke neon-serverless: ganti import di lib/db/index.ts dari
// `drizzle-orm/neon-http` ke `drizzle-orm/neon-serverless`, dan ganti
// `neon()` dengan `Pool` dari `@neondatabase/serverless`. Tidak perlu
// ubah schema atau query. Estimasi effort: 1-2 jam + test.
