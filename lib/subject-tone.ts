const TONE_COUNT = 6

/**
 * Tone index (1..6) yang stabil untuk sebuah mapel.
 *
 * Diturunkan dari id, bukan dari urutan array, supaya warna satu mapel tidak
 * berpindah saat daftar diurutkan ulang atau difilter. Warna jadi identitas,
 * bukan posisi.
 */
export function subjectTone(subjectId: string) {
  let hash = 0
  for (let i = 0; i < subjectId.length; i++) {
    hash = (hash * 31 + subjectId.charCodeAt(i)) >>> 0
  }
  return (hash % TONE_COUNT) + 1
}

/** Nama kelas tone untuk dipasang di elemen: `tone-3`. */
export function subjectToneClass(subjectId: string) {
  return `tone-${subjectTone(subjectId)}`
}
