import { useMemo } from 'react'
import type { GeneratedStory } from '@/features/stories/types'
import { buildRoleplayScriptFromStory } from '../lib/buildRoleplayScriptFromStory'
import type { BuildRoleplayScriptOptions, RoleplayScript } from '../types'

export function useRoleplayScript(
  story: GeneratedStory | null,
  options?: BuildRoleplayScriptOptions,
): RoleplayScript | null {
  return useMemo(() => {
    if (!story) return null
    return buildRoleplayScriptFromStory(story, options)
  }, [options, story])
}
