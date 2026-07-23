import "server-only"

import { cache } from "react"
import { redirect } from "next/navigation"
import { eq, inArray } from "drizzle-orm"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { assessment, attendance, biodataSiswa, classroom, grade, gradeWeight, journal, schedule, siswa, subject, users } from "@/lib/db/schema"

export const verifySession = cache(async () => {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  return {
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  }
})

export const getCurrentUser = cache(async () => {
  const session = await verifySession()

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1)

  return user
})

export async function getKelasForCurrentUser() {
  const session = await verifySession()

  return db.select().from(classroom).where(eq(classroom.userId, session.userId))
}

export async function getSiswaForCurrentUser() {
  const session = await verifySession()

  return db.select().from(siswa).where(eq(siswa.userId, session.userId))
}

export async function getSubjectsForCurrentUser() {
  const session = await verifySession()

  return db.select().from(subject).where(eq(subject.userId, session.userId))
}

export async function getGradeWeightsForCurrentUser() {
  const session = await verifySession()

  return db.select().from(gradeWeight).where(eq(gradeWeight.userId, session.userId))
}

export async function getSchedulesForCurrentUser() {
  const session = await verifySession()

  return db.select().from(schedule).where(eq(schedule.userId, session.userId))
}

export async function getAttendancesForCurrentUser() {
  const session = await verifySession()

  return db.select().from(attendance).where(eq(attendance.userId, session.userId))
}

export async function getJournalsForCurrentUser() {
  const session = await verifySession()

  return db.select().from(journal).where(eq(journal.userId, session.userId))
}

export async function getGradesForCurrentUser() {
  const session = await verifySession()

  return db.select().from(grade).where(eq(grade.userId, session.userId))
}

export async function getAssessmentsForCurrentUser() {
  const session = await verifySession()

  return db.select().from(assessment).where(eq(assessment.userId, session.userId))
}

export async function getBiodataSiswaForCurrentUser() {
  await verifySession()

  try {
    return await db.select().from(biodataSiswa)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.warn("Warning: Could not fetch biodata_siswa:", msg)
    return []
  }
}
