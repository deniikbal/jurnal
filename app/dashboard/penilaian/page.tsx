import type { Metadata } from "next"

import { PenilaianPageClient } from "@/components/penilaian-page-client"
import {
  getAssessmentsForCurrentUser,
  getGradeWeightsForCurrentUser,
  getGradesForCurrentUser,
  getKelasForCurrentUser,
  getSiswaForCurrentUser,
  getSubjectsForCurrentUser,
} from "@/lib/dal"

export const metadata: Metadata = {
  title: "Penilaian",
}

export default async function PenilaianPage() {
  const [subjects, classrooms, students, gradeWeights, assessments, grades] =
    await Promise.all([
      getSubjectsForCurrentUser(),
      getKelasForCurrentUser(),
      getSiswaForCurrentUser(),
      getGradeWeightsForCurrentUser(),
      getAssessmentsForCurrentUser(),
      getGradesForCurrentUser(),
    ])

  return (
    <PenilaianPageClient
      subjects={subjects}
      classrooms={classrooms}
      students={students}
      gradeWeights={gradeWeights}
      assessments={assessments}
      grades={grades}
    />
  )
}
