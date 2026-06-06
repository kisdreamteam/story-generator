import { listProjects } from '../services/projects.service'

export function useProjects() {
  return listProjects()
}
