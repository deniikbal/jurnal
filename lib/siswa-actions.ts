"use server"

import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"
import * as XLSX from "xlsx"

import { db } from "@/lib/db"
import { classroom, siswa } from "@/lib/db/schema"
import { verifySession } from "@/lib/dal"

export type SiswaActionState = {
  success: boolean
  message: string
}

const errorState = (message: string): SiswaActionState => ({ success: false, message })
const successState = (message: string): SiswaActionState => ({ success: true, message })

function parseJenisKelamin(value: FormDataEntryValue | null) {
  return value === "perempuan" ? "perempuan" : "laki-laki"
}

function parseStatus(value: FormDataEntryValue | null) {
  return value === "keluar" ? "keluar" : "aktif"
}

async function ensureClassroomExists(classroomId: string, userId: string) {
  const [data] = await db
    .select({ id: classroom.id })
    .from(classroom)
    .where(and(eq(classroom.id, classroomId), eq(classroom.userId, userId)))
    .limit(1)

  return Boolean(data)
}

export async function createSiswa(
  _prevState: SiswaActionState,
  formData: FormData,
): Promise<SiswaActionState> {
  const session = await verifySession()
  const name = String(formData.get("name") ?? "").trim()
  const nis = String(formData.get("nis") ?? "").trim()
  const classroomId = String(formData.get("classroomId") ?? "")
  const jenisKelamin = parseJenisKelamin(formData.get("jenisKelamin"))
  const status = parseStatus(formData.get("status"))

  if (!name) return errorState("Nama siswa wajib diisi")
  if (!classroomId) return errorState("Kelas wajib dipilih")

  if (!(await ensureClassroomExists(classroomId, session.userId))) {
    return errorState("Kelas tidak ditemukan")
  }

  await db.insert(siswa).values({
    name,
    nis: nis || null,
    classroomId,
    jenisKelamin,
    status,
    userId: session.userId,
  })

  revalidatePath("/dashboard/siswa")
  revalidatePath("/dashboard/kelas")

  return successState("Siswa berhasil ditambahkan")
}

export type SiswaImportState = {
  success: boolean
  message: string
  imported?: number
  skipped?: number
  errors?: string[]
}

const importError = (message: string): SiswaImportState => ({ success: false, message })

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

export async function importSiswa(
  _prevState: SiswaImportState,
  formData: FormData,
): Promise<SiswaImportState> {
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

  const daftarKelas = await db
    .select({ id: classroom.id, name: classroom.name })
    .from(classroom)
    .where(eq(classroom.userId, session.userId))

  const kelasByName = new Map(
    daftarKelas.map((item) => [item.name.trim().toLowerCase(), item.id]),
  )

  const errors: string[] = []
  const values: (typeof siswa.$inferInsert)[] = []

  rows.forEach((row, index) => {
    const rowNumber = index + 2
    const name = pickField(row, ["nama", "namasiswa", "name"])
    const nis = pickField(row, ["nis", "nomorinduk"])
    const kelasName = pickField(row, ["kelas", "classroom", "class"])
    const jenisKelaminRaw = pickField(row, ["jeniskelamin", "jk", "gender"]).toLowerCase()
    const statusRaw = pickField(row, ["status"]).toLowerCase()

    if (!name) {
      errors.push(`Baris ${rowNumber}: nama kosong`)
      return
    }
    if (!kelasName) {
      errors.push(`Baris ${rowNumber}: kelas kosong`)
      return
    }

    const classroomId = kelasByName.get(kelasName.toLowerCase())
    if (!classroomId) {
      errors.push(`Baris ${rowNumber}: kelas "${kelasName}" tidak ditemukan`)
      return
    }

    const jenisKelamin =
      jenisKelaminRaw.startsWith("p") || jenisKelaminRaw.includes("perempuan")
        ? "perempuan"
        : "laki-laki"
    const status = statusRaw.startsWith("k") ? "keluar" : "aktif"

    values.push({
      name,
      nis: nis || null,
      classroomId,
      jenisKelamin,
      status,
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

  await db.insert(siswa).values(values)

  revalidatePath("/dashboard/siswa")
  revalidatePath("/dashboard/kelas")

  return {
    success: true,
    message: `${values.length} siswa berhasil diimpor${errors.length ? `, ${errors.length} baris dilewati` : ""}`,
    imported: values.length,
    skipped: errors.length,
    errors,
  }
}

export async function updateSiswa(
  _prevState: SiswaActionState,
  formData: FormData,
): Promise<SiswaActionState> {
  const session = await verifySession()
  const id = String(formData.get("id") ?? "")
  const name = String(formData.get("name") ?? "").trim()
  const nis = String(formData.get("nis") ?? "").trim()
  const classroomId = String(formData.get("classroomId") ?? "")
  const jenisKelamin = parseJenisKelamin(formData.get("jenisKelamin"))
  const status = parseStatus(formData.get("status"))

  if (!id) return errorState("ID siswa tidak valid")
  if (!name) return errorState("Nama siswa wajib diisi")
  if (!classroomId) return errorState("Kelas wajib dipilih")

  if (!(await ensureClassroomExists(classroomId, session.userId))) {
    return errorState("Kelas tidak ditemukan")
  }

  const updatedRows = await db
    .update(siswa)
    .set({
      name,
      nis: nis || null,
      classroomId,
      jenisKelamin,
      status,
      updatedAt: new Date(),
    })
    .where(and(eq(siswa.id, id), eq(siswa.userId, session.userId)))
    .returning({ id: siswa.id })

  if (!updatedRows.length) return errorState("Siswa tidak ditemukan")

  revalidatePath("/dashboard/siswa")
  revalidatePath("/dashboard/kelas")

  return successState("Siswa berhasil diperbarui")
}

export async function deleteSiswa(
  _prevState: SiswaActionState,
  formData: FormData,
): Promise<SiswaActionState> {
  const session = await verifySession()
  const id = String(formData.get("id") ?? "")

  if (!id) return errorState("ID siswa tidak valid")

  const deletedRows = await db
    .delete(siswa)
    .where(and(eq(siswa.id, id), eq(siswa.userId, session.userId)))
    .returning({ id: siswa.id })

  if (!deletedRows.length) return errorState("Siswa tidak ditemukan")

  revalidatePath("/dashboard/siswa")
  revalidatePath("/dashboard/kelas")

  return successState("Siswa berhasil dihapus")
}
