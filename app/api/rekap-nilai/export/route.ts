import { eq } from "drizzle-orm"
import ExcelJS from "exceljs"

import { verifySession } from "@/lib/dal"
import { db } from "@/lib/db"
import {
  assessment,
  classroom,
  grade,
  gradeWeight,
  siswa,
  subject,
} from "@/lib/db/schema"

function average(values: (number | null)[]): number | null {
  const filled = values.filter((v): v is number => v !== null)
  return filled.length ? filled.reduce((s, v) => s + v, 0) / filled.length : null
}

function round1(n: number) {
  return Math.round(n * 10) / 10
}

function roundOrDash(value: number | null | undefined) {
  return value === null || value === undefined ? "—" : round1(value)
}

const collator = new Intl.Collator("id-ID", { numeric: true, sensitivity: "base" })

const HEADER_FILL = "FF305496"
const FOOTER_FILL = "FFD9E2F3"

function borderAll() {
  return {
    top: { style: "thin" as const },
    bottom: { style: "thin" as const },
    left: { style: "thin" as const },
    right: { style: "thin" as const },
  }
}

export async function GET() {
  const session = await verifySession()

  const [classrooms, subjects, students, assessments, grades, weights] =
    await Promise.all([
      db.select().from(classroom).where(eq(classroom.userId, session.userId)),
      db.select().from(subject).where(eq(subject.userId, session.userId)),
      db
        .select()
        .from(siswa)
        .where(eq(siswa.userId, session.userId))
        .then((rows) => rows.filter((s) => s.status === "aktif")),
      db.select().from(assessment).where(eq(assessment.userId, session.userId)),
      db.select().from(grade).where(eq(grade.userId, session.userId)),
      db
        .select()
        .from(gradeWeight)
        .where(eq(gradeWeight.userId, session.userId))
        .then((rows) => rows.filter((w) => w.status === "aktif")),
    ])

  const gradesByAssessment = new Map<string, Map<string, number>>()
  for (const g of grades) {
    const map = gradesByAssessment.get(g.assessmentId) ?? new Map()
    map.set(g.siswaId, g.score)
    gradesByAssessment.set(g.assessmentId, map)
  }

  const sortedClassrooms = classrooms.toSorted((a, b) => collator.compare(a.name, b.name))
  const sortedSubjects = subjects.toSorted((a, b) => collator.compare(a.name, b.name))

  const wb = new ExcelJS.Workbook()
  const usedSheetNames = new Map<string, number>()

  function uniqueSheetName(base: string): string {
    const clean = base.slice(0, 31)
    const count = usedSheetNames.get(clean) ?? 0
    usedSheetNames.set(clean, count + 1)
    if (count === 0) return clean
    const suffix = ` (${count + 1})`
    return `${clean.slice(0, 31 - suffix.length)}${suffix}`
  }

  for (const cls of sortedClassrooms) {
    const classAssessments = assessments.filter((a) => a.classroomId === cls.id)
    const classStudents = students
      .filter((s) => s.classroomId === cls.id)
      .toSorted((a, b) => collator.compare(a.name, b.name))

    for (const sub of sortedSubjects) {
      const subjectAssessments = classAssessments.filter((a) => a.subjectId === sub.id)
      if (!subjectAssessments.length) continue

      const subjectWeights = weights
        .filter((w) => w.subjectId === sub.id)
        .toSorted((a, b) => collator.compare(a.name, b.name))

      const columns = subjectWeights.map((weight) => ({
        weight,
        assessments: subjectAssessments
          .filter((a) => a.gradeWeightId === weight.id)
          .toSorted(
            (a, b) =>
              (a.date ?? "").localeCompare(b.date ?? "") || collator.compare(a.title, b.title),
          ),
      }))

      const sheetName = uniqueSheetName(cls.name)
      const ws = wb.addWorksheet(sheetName)

      const headerRow1 = ["No", "NIS", "Nama"]
      const headerRow2 = ["", "", ""]
      const widths = [4, 12, 24]

      for (const col of columns) {
        headerRow1.push(`${col.weight.name} (${col.weight.weight}%)`)
        for (let i = 0; i < col.assessments.length; i++) headerRow1.push("")

        for (const a of col.assessments) {
          headerRow2.push(a.title)
          widths.push(Math.max(10, Math.min(a.title.length + 4, 24)))
        }
        headerRow2.push("Rata²")
        widths.push(10)
      }
      headerRow1.push("Nilai Akhir")
      headerRow2.push("Nilai Akhir")
      widths.push(12)

      // Baris data: tiap siswa -> { values (per penilaian), colAvg (per komponen), final }
      const rows: {
        no: number
        nis: string
        name: string
        values: (number | null)[][]
        colAvgs: (number | null)[]
        final: number | null
      }[] = []

      for (const student of classStudents) {
        const values = columns.map((col) =>
          col.assessments.map((a) => {
            const score = gradesByAssessment.get(a.id)?.get(student.id) ?? 0
            return score > 0 ? score : null
          }),
        )
        const colAvgs = values.map((v) => average(v))
        const filledPairs = columns
          .map((col, i) => [col.weight.weight, colAvgs[i]] as const)
          .filter(([, avg]) => avg !== null) as [number, number][]
        const final = filledPairs.length
          ? filledPairs.reduce((s, [w, avg]) => s + w * avg, 0) /
            filledPairs.reduce((s, [w]) => s + w, 0)
          : null

        rows.push({
          no: rows.length + 1,
          nis: student.nis ?? "—",
          name: student.name,
          values,
          colAvgs,
          final,
        })
      }

      const dataRows: (string | number)[][] = rows.map((r) => {
        const row: (string | number)[] = [r.no, r.nis, r.name]
        for (let i = 0; i < columns.length; i++) {
          for (const v of r.values[i]) row.push(v === null ? "—" : v)
          row.push(roundOrDash(r.colAvgs[i]))
        }
        row.push(roundOrDash(r.final))
        return row
      })

      // Footer rata-rata kelas per kolom
      const classColAvgs = columns.map((_, ci) => average(rows.map((r) => r.colAvgs[ci])))
      const classPerAssessmentAvgs = columns.map((col, ci) =>
        col.assessments.map((_, ai) => average(rows.map((r) => r.values[ci][ai]))),
      )
      const classFinal = average(rows.map((r) => r.final))

      if (rows.length) {
        const footer: (string | number)[] = ["", "", "Rata-rata kelas"]
        for (let i = 0; i < columns.length; i++) {
          for (const avg of classPerAssessmentAvgs[i]) footer.push(roundOrDash(avg))
          footer.push(roundOrDash(classColAvgs[i]))
        }
        footer.push(roundOrDash(classFinal))
        dataRows.push(footer)
      }

      // Tulis header 2 baris
      ws.addRow(headerRow1)
      ws.addRow(headerRow2)

      // Tulis data + footer
      for (const dataRow of dataRows) {
        const excelRow = ws.addRow(dataRow)
        excelRow.eachCell((cell) => {
          if (typeof cell.value === "number" && Number(cell.col) >= 4) cell.numFmt = "0.0"
        })
      }

      // Lebar kolom
      ws.columns = widths.map((width) => ({ width }))

      // Merge header baris 1 (grup bobot) sesuai jumlah kolom komponen + Rata²
      let startCol = 4 // 1-based: No=1, NIS=2, Nama=3, komponen mulai 4
      for (const col of columns) {
        const span = col.assessments.length + 1
        if (span > 1) {
          ws.mergeCells(1, startCol, 1, startCol + span - 1)
        }
        startCol += span
      }

      // Merge vertikal header kolom tetap: No, NIS, Nama, Nilai Akhir (2 baris)
      ws.mergeCells(1, 1, 2, 1)
      ws.mergeCells(1, 2, 2, 2)
      ws.mergeCells(1, 3, 2, 3)
      const finalCol = 3 + columns.reduce((sum, col) => sum + col.assessments.length + 1, 0) + 1
      ws.mergeCells(1, finalCol, 2, finalCol)

      // Style header (2 baris): tebal, putih, latar biru, border
      for (const rowNumber of [1, 2]) {
        ws.getRow(rowNumber).eachCell((cell) => {
          cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } }
          cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true }
          cell.border = borderAll()
        })
      }

      // Border semua sel data + footer
      const lastRowNumber = ws.rowCount
      for (let r = 3; r <= lastRowNumber; r++) {
        ws.getRow(r).eachCell((cell) => {
          cell.border = borderAll()
        })
      }

      // Style footer rata-rata: tebal + latar biru muda
      if (rows.length) {
        ws.getRow(lastRowNumber).eachCell((cell) => {
          cell.font = { bold: true }
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: FOOTER_FILL } }
          cell.alignment = { vertical: "middle" }
        })
      }
    }
  }

  const buf = await wb.xlsx.writeBuffer()

  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=rekap-nilai-${new Date().toISOString().slice(0, 10)}.xlsx`,
    },
  })
}
