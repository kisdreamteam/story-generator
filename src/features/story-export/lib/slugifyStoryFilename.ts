/** Safe filename slug from a story title. */
export function slugifyStoryFilename(title: string, fallback = 'story'): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || fallback
}
