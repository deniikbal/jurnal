"use server"

import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { subject } from "@/lib/db/schema"
import { verifySession } from "@/lib/dal"

export type SubjectActionState = {
  success: boolean
  message: string
}

const errorState = (message: string): SubjectActionState => ({ success: false, message })
const successState = (message: string): SubjectActionState => ({ success: true, message })

function parseStatus(value: FormDataEntryValue | null) {
  return value === "nonaktif" ? "nonaktif" : "aktif"
}

export async function createSubject(
  _prevState: SubjectActionState,
  formData: FormData,
): Promise<SubjectActionState> {
  const session = await verifySession()
  const name = String(formData.get("name") ?? "").trim()
  const kode = String(formData.get("kode") ?? "").trim().toUpperCase()
  const status = parseStatus(formData.get("status"))

  if (!name) return errorState("Nama mata pelajaran wajib diisi")
  if (!kode) return errorState("Kode mata pelajaran wajib diisi")

  await db.insert(subject).values({
    name,
    kode,
    status,
    userId: session.userId,
  })

  revalidatePath("/dashboard/subject")

  return successState("Mata pelajaran berhasil ditambahkan")
}

export async function updateSubject(
  _prevState: SubjectActionState,
  formData: FormData,
): Promise<SubjectActionState> {
  const session = await verifySession()
  const id = String(formData.get("id") ?? "")
  const name = String(formData.get("name") ?? "").trim()
  const kode = String(formData.get("kode") ?? "").trim().toUpperCase()
  const status = parseStatus(formData.get("status"))

  if (!id) return errorState("ID mata pelajaran tidak valid")
  if (!name) return errorState("Nama mata pelajaran wajib diisi")
  if (!kode) return errorState("Kode mata pelajaran wajib diisi")

  const updatedRows = await db
    .update(subject)
    .set({
      name,
      kode,
      status,
      updatedAt: new Date(),
    })
    .where(and(eq(subject.id, id), eq(subject.userId, session.userId)))
    .returning({ id: subject.id })

  if (!updatedRows.length) return errorState("Mata pelajaran tidak ditemukan")

  revalidatePath("/dashboard/subject")

  return successState("Mata pelajaran berhasil diperbarui")
}

export async function deleteSubject(
  _prevState: SubjectActionState,
  formData: FormData,
): Promise<SubjectActionState> {
  const session = await verifySession()
  const id = String(formData.get("id") ?? "")

  if (!id) return errorState("ID mata pelajaran tidak valid")

  const deletedRows = await db
    .delete(subject)
    .where(and(eq(subject.id, id), eq(subject.userId, session.userId)))
    .returning({ id: subject.id })

  if (!deletedRows.length) return errorState("Mata pelajaran tidak ditemukan")

  revalidatePath("/dashboard/subject")

  return successState("Mata pelajaran berhasil dihapus")
}
