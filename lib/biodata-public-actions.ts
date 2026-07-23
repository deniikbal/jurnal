"use server"

import { revalidatePath } from "next/cache"
import { eq, ilike, or } from "drizzle-orm"

import { db } from "@/lib/db"
import { biodataSiswa, siswa } from "@/lib/db/schema"
import { uploadToGoogleDrive } from "@/lib/google-drive"

export type BiodataPublicState = {
  success: boolean
  message: string
  student?: {
    id: string
    name: string
    nis: string
  }
  biodata?: {
    id: string
    nama: string
    alamat: string | null
    nohpOrtu: string | null
    namaAyah: string | null
    namaIbu: string | null
    statusPernikahan: string | null
    kondisiKeluarga: string | null
    fotoRumah: string | null
  } | null
}

export async function lookupSiswaByNis(
  _prevState: BiodataPublicState,
  formData: FormData,
): Promise<BiodataPublicState> {
  const nis = String(formData.get("nis") ?? "").trim()

  if (!nis) {
    return { success: false, message: "Masukkan NIS" }
  }

  const [found] = await db
    .select({
      id: siswa.id,
      name: siswa.name,
      nis: siswa.nis,
    })
    .from(siswa)
    .where(eq(siswa.nis, nis))
    .limit(1)

  if (!found) {
    return { success: false, message: "NIS tidak ditemukan" }
  }

  const [existingBiodata] = await db
    .select({
      id: biodataSiswa.id,
      nama: biodataSiswa.nama,
      alamat: biodataSiswa.alamat,
      nohpOrtu: biodataSiswa.nohpOrtu,
      namaAyah: biodataSiswa.namaAyah,
      namaIbu: biodataSiswa.namaIbu,
      statusPernikahan: biodataSiswa.statusPernikahan,
      kondisiKeluarga: biodataSiswa.kondisiKeluarga,
      fotoRumah: biodataSiswa.fotoRumah,
    })
    .from(biodataSiswa)
    .where(
      or(
        eq(biodataSiswa.siswaId, found.id),
        ilike(biodataSiswa.nama, found.name)
      )
    )
    .limit(1)

  return {
    success: true,
    message: "",
    student: { id: found.id, name: found.name, nis: found.nis ?? "" },
    biodata: existingBiodata ?? null,
  }
}

export async function saveBiodataPublic(
  _prevState: BiodataPublicState,
  formData: FormData,
): Promise<BiodataPublicState> {
  const nis = String(formData.get("nis") ?? "").trim()
  const alamat = String(formData.get("alamat") ?? "").trim()
  const nohpOrtu = String(formData.get("nohp_ortu") ?? "").trim()
  const namaAyah = String(formData.get("nama_ayah") ?? "").trim()
  const namaIbu = String(formData.get("nama_ibu") ?? "").trim()
  const statusPernikahan = String(formData.get("status_pernikahan") ?? "").trim()
  const kondisiKeluarga = String(formData.get("kondisi_keluarga") ?? "").trim()
  const existingFoto = String(formData.get("existing_foto") ?? "").trim()

  if (!nis) {
    return { success: false, message: "NIS tidak valid" }
  }

  const [found] = await db
    .select({ id: siswa.id, name: siswa.name, nis: siswa.nis })
    .from(siswa)
    .where(eq(siswa.nis, nis))
    .limit(1)

  if (!found) {
    return { success: false, message: "Siswa tidak ditemukan" }
  }

  let fotoRumah: string | null = existingFoto || null
  const fotoFile = formData.get("foto_rumah") as File | null
  if (fotoFile && fotoFile.size > 0) {
    const ext = fotoFile.name.split(".").pop() ?? "jpg"
    const fileName = `biodata_${Date.now()}_${found.name.replace(/\s+/g, "_")}.${ext}`
    fotoRumah = await uploadToGoogleDrive(fotoFile, fileName)
  }

  const [existing] = await db
    .select({ id: biodataSiswa.id })
    .from(biodataSiswa)
    .where(
      or(
        eq(biodataSiswa.siswaId, found.id),
        ilike(biodataSiswa.nama, found.name)
      )
    )
    .limit(1)

  if (existing) {
    await db
      .update(biodataSiswa)
      .set({
        nama: found.name,
        siswaId: found.id,
        alamat: alamat || null,
        nohpOrtu: nohpOrtu || null,
        namaAyah: namaAyah || null,
        namaIbu: namaIbu || null,
        statusPernikahan: (statusPernikahan as typeof biodataSiswa.$inferSelect["statusPernikahan"]) || null,
        kondisiKeluarga: (kondisiKeluarga as typeof biodataSiswa.$inferSelect["kondisiKeluarga"]) || null,
        fotoRumah,
        updatedAt: new Date(),
      })
      .where(eq(biodataSiswa.id, existing.id))
  } else {
    await db.insert(biodataSiswa).values({
      nama: found.name,
      siswaId: found.id,
      alamat: alamat || null,
      nohpOrtu: nohpOrtu || null,
      namaAyah: namaAyah || null,
      namaIbu: namaIbu || null,
      statusPernikahan: (statusPernikahan as typeof biodataSiswa.$inferSelect["statusPernikahan"]) || null,
      kondisiKeluarga: (kondisiKeluarga as typeof biodataSiswa.$inferSelect["kondisiKeluarga"]) || null,
      fotoRumah,
    })
  }

  revalidatePath("/dashboard/walikelas/biodata-siswa")

  return {
    success: true,
    message: "Biodata berhasil disimpan",
    student: { id: found.id, name: found.name, nis: found.nis ?? "" },
  }
}
