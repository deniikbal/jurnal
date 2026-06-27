"use server"

import { revalidatePath } from "next/cache"
import { and, eq, ne } from "drizzle-orm"

import { db } from "@/lib/db"
import { gradeWeight, subject } from "@/lib/db/schema"
import { verifySession } from "@/lib/dal"

export type GradeWeightActionState = {
  success: boolean
  message: string
}

const errorState = (message: string): GradeWeightActionState => ({ success: false, message })
const successState = (message: string): GradeWeightActionState => ({ success: true, message })

function parseStatus(value: FormDataEntryValue | null) {
  return value === "nonaktif" ? "nonaktif" : "aktif"
}

function parseWeight(value: FormDataEntryValue | null) {
  const weight = Number(String(value ?? ""))
  return Number.isFinite(weight) ? Math.round(weight) : 0
}

async function ensureSubjectExists(subjectId: string, userId: string) {
  const [data] = await db
    .select({ id: subject.id })
    .from(subject)
    .where(and(eq(subject.id, subjectId), eq(subject.userId, userId)))
    .limit(1)

  return Boolean(data)
}

async function getCurrentTotalWeight(subjectId: string, userId: string, exceptId?: string) {
  const rows = await db
    .select({ id: gradeWeight.id, weight: gradeWeight.weight })
    .from(gradeWeight)
    .where(
      exceptId
        ? and(
            eq(gradeWeight.subjectId, subjectId),
            eq(gradeWeight.userId, userId),
            eq(gradeWeight.status, "aktif"),
            ne(gradeWeight.id, exceptId),
          )
        : and(
            eq(gradeWeight.subjectId, subjectId),
            eq(gradeWeight.userId, userId),
            eq(gradeWeight.status, "aktif"),
          ),
    )

  return rows.reduce((total, item) => total + item.weight, 0)
}

export async function createGradeWeight(
  _prevState: GradeWeightActionState,
  formData: FormData,
): Promise<GradeWeightActionState> {
  const session = await verifySession()
  const name = String(formData.get("name") ?? "").trim()
  const weight = parseWeight(formData.get("weight"))
  const subjectId = String(formData.get("subjectId") ?? "")
  const status = parseStatus(formData.get("status"))

  if (!name) return errorState("Nama bobot wajib diisi")
  if (!subjectId) return errorState("Mata pelajaran wajib dipilih")
  if (weight < 1 || weight > 100) return errorState("Bobot harus 1 sampai 100")
  if (!(await ensureSubjectExists(subjectId, session.userId))) return errorState("Mata pelajaran tidak ditemukan")

  if (status === "aktif") {
    const totalWeight = await getCurrentTotalWeight(subjectId, session.userId)
    if (totalWeight + weight > 100) {
      return errorState(`Total bobot aktif mapel ini melebihi 100% (${totalWeight + weight}%)`)
    }
  }

  await db.insert(gradeWeight).values({ name, weight, subjectId, status, userId: session.userId })

  revalidatePath("/dashboard/bobot-nilai")

  return successState("Bobot nilai berhasil ditambahkan")
}

export async function updateGradeWeight(
  _prevState: GradeWeightActionState,
  formData: FormData,
): Promise<GradeWeightActionState> {
  const session = await verifySession()
  const id = String(formData.get("id") ?? "")
  const name = String(formData.get("name") ?? "").trim()
  const weight = parseWeight(formData.get("weight"))
  const subjectId = String(formData.get("subjectId") ?? "")
  const status = parseStatus(formData.get("status"))

  if (!id) return errorState("ID bobot tidak valid")
  if (!name) return errorState("Nama bobot wajib diisi")
  if (!subjectId) return errorState("Mata pelajaran wajib dipilih")
  if (weight < 1 || weight > 100) return errorState("Bobot harus 1 sampai 100")
  if (!(await ensureSubjectExists(subjectId, session.userId))) return errorState("Mata pelajaran tidak ditemukan")

  if (status === "aktif") {
    const totalWeight = await getCurrentTotalWeight(subjectId, session.userId, id)
    if (totalWeight + weight > 100) {
      return errorState(`Total bobot aktif mapel ini melebihi 100% (${totalWeight + weight}%)`)
    }
  }

  const updatedRows = await db
    .update(gradeWeight)
    .set({ name, weight, subjectId, status, updatedAt: new Date() })
    .where(and(eq(gradeWeight.id, id), eq(gradeWeight.userId, session.userId)))
    .returning({ id: gradeWeight.id })

  if (!updatedRows.length) return errorState("Bobot nilai tidak ditemukan")

  revalidatePath("/dashboard/bobot-nilai")

  return successState("Bobot nilai berhasil diperbarui")
}

export async function deleteGradeWeight(
  _prevState: GradeWeightActionState,
  formData: FormData,
): Promise<GradeWeightActionState> {
  const session = await verifySession()
  const id = String(formData.get("id") ?? "")

  if (!id) return errorState("ID bobot tidak valid")

  const deletedRows = await db
    .delete(gradeWeight)
    .where(and(eq(gradeWeight.id, id), eq(gradeWeight.userId, session.userId)))
    .returning({ id: gradeWeight.id })

  if (!deletedRows.length) return errorState("Bobot nilai tidak ditemukan")

  revalidatePath("/dashboard/bobot-nilai")

  return successState("Bobot nilai berhasil dihapus")
}
