import type { GeneratedStory } from '@/features/stories/types'
import type { BuildRoleplayScriptOptions, RoleplayRole, RoleplayScript, RoleplaySection } from '../types'
import { ROLEPLAY_ROLES } from '../types'
import { parseStoryPageTextToRoleplayLines } from './parseStoryPageTextToRoleplayLines'

function buildSections(lines: RoleplayScript['lines']): RoleplaySection[] {
  const sections = new Map<number, RoleplaySection>()

  for (const line of lines) {
    const existing = sections.get(line.pageNumber)

    if (existing) {
      existing.lines.push(line)
      continue
    }

    sections.set(line.pageNumber, {
      pageNumber: line.pageNumber,
      label: `Scene ${line.pageNumber}`,
      lines: [line],
    })
  }

  return [...sections.values()].sort((left, right) => left.pageNumber - right.pageNumber)
}

function resolveCast(lines: RoleplayScript['lines']): RoleplayRole[] {
  const used = new Set(lines.map((line) => line.role))
  return ROLEPLAY_ROLES.filter((role) => used.has(role))
}

/** Convert an existing generated story into a simple classroom roleplay script. */
export function buildRoleplayScriptFromStory(
  story: GeneratedStory,
  _options: BuildRoleplayScriptOptions = {},
): RoleplayScript {
  const lineSeed = { value: 0 }
  const lines = story.storyPages.flatMap((page) =>
    parseStoryPageTextToRoleplayLines(page.text, page.pageNumber, lineSeed),
  )

  return {
    title: story.title,
    summary: story.summary,
    cast: resolveCast(lines),
    lines,
    sections: buildSections(lines),
  }
}
