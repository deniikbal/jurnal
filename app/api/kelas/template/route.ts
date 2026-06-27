import * as XLSX from "xlsx"

export async function GET() {
  const wb = XLSX.utils.book_new()

  const data = [
    { "Nama Kelas": "X IPA 1", "Wali Kelas": "Drs. Bambang" },
  ]

  const ws = XLSX.utils.json_to_sheet(data)
  XLSX.utils.book_append_sheet(wb, ws, "Kelas")

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=template-import-kelas.xlsx",
    },
  })
}
