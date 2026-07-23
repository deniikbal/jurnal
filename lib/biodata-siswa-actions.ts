"use server"

import { revalidatePath } from "next/cache"
import { and, eq, ilike, inArray } from "drizzle-orm"

import { db } from "@/lib/db"
import { biodataSiswa, siswa } from "@/lib/db/schema"
import { verifySession } from "@/lib/dal"
import { uploadToGoogleDrive } from "@/lib/google-drive"

export type BiodataSiswaActionState = {
  success: boolean
  message: string
}

const errorState = (message: string): BiodataSiswaActionState => ({ success: false, message })
const successState = (message: string): BiodataSiswaActionState => ({ success: true, message })

export async function createBiodataSiswa(
  _prevState: BiodataSiswaActionState,
  formData: FormData,
): Promise<BiodataSiswaActionState> {
  await verifySession()
  const nama = String(formData.get("nama") ?? "").trim()
  const alamat = String(formData.get("alamat") ?? "").trim()
  const nohpOrtu = String(formData.get("nohp_ortu") ?? "").trim()
  const namaAyah = String(formData.get("nama_ayah") ?? "").trim()
  const namaIbu = String(formData.get("nama_ibu") ?? "").trim()
  const statusPernikahan = String(formData.get("status_pernikahan") ?? "").trim()
  const kondisiKeluarga = String(formData.get("kondisi_keluarga") ?? "").trim()

  if (!nama) return errorState("Nama siswa wajib diisi")

  let fotoRumah: string | null = null
  const fotoFile = formData.get("foto_rumah") as File | null
  if (fotoFile && fotoFile.size > 0) {
    const ext = fotoFile.name.split(".").pop() ?? "jpg"
    const fileName = `biodata_${Date.now()}_${nama.replace(/\s+/g, "_")}.${ext}`
    fotoRumah = await uploadToGoogleDrive(fotoFile, fileName)
  }

  const [matchingSiswa] = await db
    .select({ id: siswa.id })
    .from(siswa)
    .where(ilike(siswa.name, nama))
    .limit(1)

  await db.insert(biodataSiswa).values({
    nama,
    alamat: alamat || null,
    nohpOrtu: nohpOrtu || null,
    namaAyah: namaAyah || null,
    namaIbu: namaIbu || null,
    statusPernikahan: (statusPernikahan as typeof biodataSiswa.$inferSelect["statusPernikahan"]) || null,
    kondisiKeluarga: (kondisiKeluarga as typeof biodataSiswa.$inferSelect["kondisiKeluarga"]) || null,
    fotoRumah,
    siswaId: matchingSiswa?.id ?? null,
  })

  revalidatePath("/dashboard/walikelas/biodata-siswa")

  return successState("Biodata siswa berhasil ditambahkan")
}

export async function updateBiodataSiswa(
  _prevState: BiodataSiswaActionState,
  formData: FormData,
): Promise<BiodataSiswaActionState> {
  await verifySession()
  const id = String(formData.get("id") ?? "")
  const nama = String(formData.get("nama") ?? "").trim()
  const alamat = String(formData.get("alamat") ?? "").trim()
  const nohpOrtu = String(formData.get("nohp_ortu") ?? "").trim()
  const namaAyah = String(formData.get("nama_ayah") ?? "").trim()
  const namaIbu = String(formData.get("nama_ibu") ?? "").trim()
  const statusPernikahan = String(formData.get("status_pernikahan") ?? "").trim()
  const kondisiKeluarga = String(formData.get("kondisi_keluarga") ?? "").trim()
  const existingFoto = String(formData.get("existing_foto") ?? "").trim()

  if (!id) return errorState("ID biodata tidak valid")
  if (!nama) return errorState("Nama siswa wajib diisi")

  let fotoRumah: string | null = existingFoto || null
  const fotoFile = formData.get("foto_rumah") as File | null
  if (fotoFile && fotoFile.size > 0) {
    const ext = fotoFile.name.split(".").pop() ?? "jpg"
    const fileName = `biodata_${Date.now()}_${nama.replace(/\s+/g, "_")}.${ext}`
    fotoRumah = await uploadToGoogleDrive(fotoFile, fileName)
  }

  const updatedRows = await db
    .update(biodataSiswa)
    .set({
      nama,
      alamat: alamat || null,
      nohpOrtu: nohpOrtu || null,
      namaAyah: namaAyah || null,
      namaIbu: namaIbu || null,
      statusPernikahan: (statusPernikahan as typeof biodataSiswa.$inferSelect["statusPernikahan"]) || null,
      kondisiKeluarga: (kondisiKeluarga as typeof biodataSiswa.$inferSelect["kondisiKeluarga"]) || null,
      fotoRumah,
      updatedAt: new Date(),
    })
    .where(eq(biodataSiswa.id, id))
    .returning({ id: biodataSiswa.id })

  if (!updatedRows.length) return errorState("Biodata siswa tidak ditemukan")

  revalidatePath("/dashboard/walikelas/biodata-siswa")

  return successState("Biodata siswa berhasil diperbarui")
}

export async function deleteBiodataSiswa(
  _prevState: BiodataSiswaActionState,
  formData: FormData,
): Promise<BiodataSiswaActionState> {
  await verifySession()
  const id = String(formData.get("id") ?? "")

  if (!id) return errorState("ID biodata tidak valid")

  const deletedRows = await db
    .delete(biodataSiswa)
    .where(eq(biodataSiswa.id, id))
    .returning({ id: biodataSiswa.id })

  if (!deletedRows.length) return errorState("Biodata siswa tidak ditemukan")

  revalidatePath("/dashboard/walikelas/biodata-siswa")

  return successState("Biodata siswa berhasil dihapus")
}

export async function importBiodataSiswaByClass(
  _prevState: BiodataSiswaActionState,
  formData: FormData,
): Promise<BiodataSiswaActionState> {
  const session = await verifySession()
  const classroomId = String(formData.get("classroom_id") ?? "").trim()

  if (!classroomId) return errorState("Pilih kelas terlebih dahulu")

  try {
    const siswaList = await db
      .select({ id: siswa.id, name: siswa.name })
      .from(siswa)
      .where(and(eq(siswa.classroomId, classroomId), eq(siswa.userId, session.userId)))

    if (!siswaList.length) return errorState("Tidak ada siswa di kelas ini")

    const existingNames = await db
      .select({ nama: biodataSiswa.nama })
      .from(biodataSiswa)

    const existingNameSet = new Set(existingNames.map((b) => b.nama.toLowerCase().trim()))

    const toInsert = siswaList.filter(
      (s) => !existingNameSet.has(s.name.toLowerCase().trim()),
    )

    if (!toInsert.length) return errorState("Semua siswa sudah memiliki biodata")

    await db.insert(biodataSiswa).values(
      toInsert.map((s) => ({
        nama: s.name,
        siswaId: s.id,
      })),
    )

    revalidatePath("/dashboard/walikelas/biodata-siswa")

    return successState(
      `Berhasil mengimpor ${toInsert.length} dari ${siswaList.length} siswa`,
    )
  } catch (error) {
    console.error("Error in importBiodataSiswaByClass:", error)
    return errorState("Gagal mengimpor biodata.")
  }
}
