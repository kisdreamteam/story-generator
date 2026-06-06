import { useLocation } from 'react-router-dom'
import type { ProjectLocationState } from '../types'

export function useProjectRouteState() {
  const location = useLocation()
  return (location.state as ProjectLocationState) ?? {}
}
