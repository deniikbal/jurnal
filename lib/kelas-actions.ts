"use server"

import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"
import * as XLSX from "xlsx"

import { db } from "@/lib/db"
import { classroom } from "@/lib/db/schema"
import { verifySession } from "@/lib/dal"

export type KelasActionState = {
  success: boolean
  message: string
}

const errorState = (message: string): KelasActionState => ({
  success: false,
  message,
})

const successState = (message: string): KelasActionState => ({
  success: true,
  message,
})

export async function createKelas(
  _prevState: KelasActionState,
  formData: FormData,
): Promise<KelasActionState> {
  const session = await verifySession()
  const name = String(formData.get("name") ?? "").trim()
  const waliKelas = String(formData.get("waliKelas") ?? "").trim()

  if (!name) {
    return errorState("Nama kelas wajib diisi")
  }

  await db.insert(classroom).values({
    name,
    waliKelas: waliKelas || null,
    userId: session.userId,
  })

  revalidatePath("/dashboard/kelas")

  return successState("Kelas berhasil ditambahkan")
}

export async function updateKelas(
  _prevState: KelasActionState,
  formData: FormData,
): Promise<KelasActionState> {
  const session = await verifySession()
  const id = String(formData.get("id") ?? "")
  const name = String(formData.get("name") ?? "").trim()
  const waliKelas = String(formData.get("waliKelas") ?? "").trim()

  if (!id) {
    return errorState("ID kelas tidak valid")
  }

  if (!name) {
    return errorState("Nama kelas wajib diisi")
  }

  const updatedRows = await db
    .update(classroom)
    .set({
      name,
      waliKelas: waliKelas || null,
      updatedAt: new Date(),
    })
    .where(and(eq(classroom.id, id), eq(classroom.userId, session.userId)))
    .returning({ id: classroom.id })

  if (!updatedRows.length) {
    return errorState("Kelas tidak ditemukan")
  }

  revalidatePath("/dashboard/kelas")

  return successState("Kelas berhasil diperbarui")
}

export async function deleteKelas(
  _prevState: KelasActionState,
  formData: FormData,
): Promise<KelasActionState> {
  const session = await verifySession()
  const id = String(formData.get("id") ?? "")

  if (!id) {
    return errorState("ID kelas tidak valid")
  }

  const deletedRows = await db
    .delete(classroom)
    .where(and(eq(classroom.id, id), eq(classroom.userId, session.userId)))
    .returning({ id: classroom.id })

  if (!deletedRows.length) {
    return errorState("Kelas tidak ditemukan")
  }

  revalidatePath("/dashboard/kelas")

  return successState("Kelas berhasil dihapus")
}

export type KelasImportState = {
  success: boolean
  message: string
  imported?: number
  skipped?: number
  errors?: string[]
}

const importError = (message: string): KelasImportState => ({ success: false, message })

function normalizeHeader(value: string) {
  return value.toString().trim().toLowerCase().replace(/\s+/g, "")
}

function pickField(row: Record<string, unknown>, keys: string[]) {
  for (const key of Object.keys(row)) {
    if (keys.includes(normalizeHeader(key))) {
      const value = row[key]
      if (value === null || value === undefined) return ""
      return String(value).trim()
    }
  }
  return ""
}

export async function importKelas(
  _prevState: KelasImportState,
  formData: FormData,
): Promise<KelasImportState> {
  const session = await verifySession()
  const file = formData.get("file")

  if (!(file instanceof File) || file.size === 0) {
    return importError("File belum dipilih")
  }

  const fileName = file.name.toLowerCase()
  if (!fileName.endsWith(".xls") && !fileName.endsWith(".xlsx")) {
    return importError("Format file harus .xls atau .xlsx")
  }

  let rows: Record<string, unknown>[]
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    if (!sheet) return importError("File Excel tidak memiliki sheet")
    rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" })
  } catch {
    return importError("Gagal membaca file Excel")
  }

  if (!rows.length) return importError("File Excel tidak berisi data")

  const errors: string[] = []
  const values: (typeof classroom.$inferInsert)[] = []

  rows.forEach((row, index) => {
    const rowNumber = index + 2
    const name = pickField(row, ["namakelas", "nama kelas", "name"])
    const waliKelas = pickField(row, ["walikelas", "wali kelas", "walikelas"])

    if (!name) {
      errors.push(`Baris ${rowNumber}: nama kelas kosong`)
      return
    }

    values.push({
      name,
      waliKelas: waliKelas || null,
      userId: session.userId,
    })
  })

  if (!values.length) {
    return {
      success: false,
      message: "Tidak ada data valid untuk diimpor",
      imported: 0,
      skipped: errors.length,
      errors,
    }
  }

  await db.insert(classroom).values(values)

  revalidatePath("/dashboard/kelas")

  return {
    success: true,
    message: `${values.length} kelas berhasil diimpor${errors.length ? `, ${errors.length} baris dilewati` : ""}`,
    imported: values.length,
    skipped: errors.length,
    errors,
  }
}
