import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** URL-friendly slug from a display name, e.g. "XII IPA 1" -> "xii-ipa-1" */
export function toSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
}

type NamedItem = { id: string; name: string }

/**
 * Build stable slug maps for classrooms.
 * Colliding names get a short id suffix: "xii-ipa-1-a1b2c3"
 */
export function buildKelasSlugMaps(items: NamedItem[]) {
  const used = new Set<string>()
  const slugById = new Map<string, string>()
  const idBySlug = new Map<string, string>()

  for (const item of items) {
    const base = toSlug(item.name) || "kelas"
    let slug = base
    if (used.has(slug)) {
      slug = `${base}-${item.id.slice(0, 6)}`
    }
    used.add(slug)
    slugById.set(item.id, slug)
    idBySlug.set(slug, item.id)
  }

  return { slugById, idBySlug }
}
