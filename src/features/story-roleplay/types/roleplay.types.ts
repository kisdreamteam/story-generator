/** Supported classroom roleplay roles. */
export type RoleplayRole = 'nina' | 'nino' | 'teacher' | 'friend' | 'narrator'

export const ROLEPLAY_ROLES: readonly RoleplayRole[] = [
  'nina',
  'nino',
  'teacher',
  'friend',
  'narrator',
]

export const ROLEPLAY_ROLE_LABELS: Record<RoleplayRole, string> = {
  nina: 'Nina',
  nino: 'Nino',
  teacher: 'Teacher',
  friend: 'Friend',
  narrator: 'Narrator',
}

export interface RoleplayLine {
  id: string
  role: RoleplayRole
  text: string
  pageNumber: number
}

export interface RoleplaySection {
  pageNumber: number
  label: string
  lines: RoleplayLine[]
}

export interface RoleplayScript {
  title: string
  summary: string
  cast: RoleplayRole[]
  lines: RoleplayLine[]
  sections: RoleplaySection[]
}

export interface BuildRoleplayScriptOptions {
  characters?: string
}
