import { and, eq } from "drizzle-orm"
import * as XLSX from "xlsx"

import { verifySession } from "@/lib/dal"
import { db } from "@/lib/db"
import { classroom, siswa } from "@/lib/db/schema"

// Template import nilai: kolom A (NIS), B (Nama), C (Nilai) sesuai aturan
// importGrades di lib/grade-actions.ts. Baris 1 = header, dilewati saat import.
export async function GET(request: Request) {
  const session = await verifySession()
  const classroomId = new URL(request.url).searchParams.get("classroomId")?.trim()

  if (!classroomId) return new Response("classroomId wajib diisi", { status: 400 })

  const [cls] = await db
    .select({ name: classroom.name })
    .from(classroom)
    .where(and(eq(classroom.id, classroomId), eq(classroom.userId, session.userId)))
    .limit(1)

  if (!cls) return new Response("Kelas tidak ditemukan", { status: 404 })

  const students = await db
    .select({ nis: siswa.nis, name: siswa.name })
    .from(siswa)
    .where(
      and(
        eq(siswa.classroomId, classroomId),
        eq(siswa.userId, session.userId),
        eq(siswa.status, "aktif"),
      ),
    )

  if (!students.length) return new Response("Tidak ada siswa aktif di kelas ini", { status: 404 })

  const rows = students
    .toSorted((a, b) => a.name.localeCompare(b.name, "id"))
    .map((s) => ({ NIS: s.nis ?? "", Nama: s.name, Nilai: "" }))

  const ws = XLSX.utils.json_to_sheet(rows)
  ws["!cols"] = [{ wch: 14 }, { wch: 28 }, { wch: 10 }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Nilai")

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer
  const slug = cls.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=template-nilai-${slug || "kelas"}.xlsx`,
    },
  })
}
