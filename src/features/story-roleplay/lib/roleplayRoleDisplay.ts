import type { RoleplayRole } from '../types'

export function getRoleplayRoleLabel(role: RoleplayRole): string {
  switch (role) {
    case 'nina':
      return 'Nina'
    case 'nino':
      return 'Nino'
    case 'teacher':
      return 'Teacher'
    case 'friend':
      return 'Friend'
    case 'narrator':
      return 'Narrator'
  }
}

export function getRoleplayRoleToneClasses(role: RoleplayRole): string {
  switch (role) {
    case 'nina':
      return 'bg-indigo-50 text-indigo-900 ring-indigo-200'
    case 'nino':
      return 'bg-emerald-50 text-emerald-900 ring-emerald-200'
    case 'teacher':
      return 'bg-amber-50 text-amber-900 ring-amber-200'
    case 'friend':
      return 'bg-sky-50 text-sky-900 ring-sky-200'
    case 'narrator':
      return 'bg-stone-100 text-stone-700 ring-stone-200'
  }
}

export const ROLEPLAY_CAST_HINTS: Record<RoleplayRole, string> = {
  nina: 'Older sibling — confident, caring lines.',
  nino: 'Younger sibling — curious, playful lines.',
  teacher: 'Classroom leader — directions and praise.',
  friend: 'Guest or classmate — community helpers and peers.',
  narrator: 'Sets the scene and shares story narration.',
}
