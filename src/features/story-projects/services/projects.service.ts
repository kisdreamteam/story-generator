import type { StoryProject } from '../types'

// TODO: Replace in-memory list with Supabase persistence.

const mockProjects: StoryProject[] = [
  {
    id: 'proj-001',
    title: 'The Market Adventure',
    seriesId: 'nina-nino',
    targetLanguage: 'English',
    ageGroup: '4-6',
    status: 'generated',
    updatedAt: '2026-06-01',
  },
  {
    id: 'proj-002',
    title: 'Rainy Day at Abuela\'s',
    seriesId: 'nina-nino',
    targetLanguage: 'English',
    ageGroup: '4-6',
    status: 'setup',
    updatedAt: '2026-06-03',
  },
  {
    id: 'proj-003',
    title: 'Beach Treasure Hunt',
    seriesId: 'nina-nino',
    targetLanguage: 'English',
    ageGroup: '6-8',
    status: 'draft',
    updatedAt: '2026-06-05',
  },
]

export function listProjects(): StoryProject[] {
  return mockProjects
}

export function getProjectById(id: string): StoryProject | undefined {
  return mockProjects.find((p) => p.id === id)
}

export function generateProjectId(): string {
  return `proj-${Date.now().toString(36)}`
}
