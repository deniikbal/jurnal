import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { assessment, attendance, classroom, grade, gradeWeight, journal, schedule, siswa, subject } from "@/lib/db/schema"

const uid = "f0b57097-beed-442a-9b6f-f5eac1d22a0e"
const tables = { grade, assessment, attendance, classroom, gradeWeight, journal, schedule, siswa, subject }

export async function GET() {
  const fails: string[] = []
  const t0 = Date.now()
  for (let round = 0; round < 6; round++) {
    await Promise.all(
      Object.entries(tables).map(async ([name, t]) => {
        try {
          await db.select().from(t).where(eq((t as any).userId, uid))
        } catch (e) {
          fails.push(`${round}:${name}:${(e as { cause?: Error }).cause?.message ?? (e as Error).message}`.slice(0, 80))
        }
      }),
    )
  }
  return NextResponse.json({ fails, ms: Date.now() - t0 })
}
