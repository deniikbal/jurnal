import type { Metadata } from "next"

import { JurnalPageClient } from "@/components/jurnal-page-client"
import {
  getAssessmentsForCurrentUser,
  getAttendancesForCurrentUser,
  getGradesForCurrentUser,
  getGradeWeightsForCurrentUser,
  getJournalsForCurrentUser,
  getKelasForCurrentUser,
  getSchedulesForCurrentUser,
  getSiswaForCurrentUser,
  getSubjectsForCurrentUser,
} from "@/lib/dal"

export const metadata: Metadata = {
  title: "Jurnal",
}

export default async function JurnalPage() {
  const [
    schedules,
    subjects,
    classrooms,
    journals,
    students,
    attendances,
    grades,
    gradeWeights,
    assessments,
  ] = await Promise.all([
    getSchedulesForCurrentUser(),
    getSubjectsForCurrentUser(),
    getKelasForCurrentUser(),
    getJournalsForCurrentUser(),
    getSiswaForCurrentUser(),
    getAttendancesForCurrentUser(),
    getGradesForCurrentUser(),
    getGradeWeightsForCurrentUser(),
    getAssessmentsForCurrentUser(),
  ])

  return (
    <JurnalPageClient
      schedules={schedules}
      subjects={subjects}
      classrooms={classrooms}
      journals={journals}
      students={students}
      attendances={attendances}
      grades={grades}
      gradeWeights={gradeWeights}
      assessments={assessments}
    />
  )
}
