import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { grade } from "@/lib/db/schema"
try {
  const r = await db.select().from(grade).where(eq(grade.userId, "f0b57097-beed-442a-9b6f-f5eac1d22a0e"))
  console.log("ok", r.length)
} catch (e) {
  console.log("ERR:", (e as Error).message)
  console.log("CAUSE:", (e as { cause?: Error }).cause?.message, (e as { cause?: Error }).cause?.stack)
}
