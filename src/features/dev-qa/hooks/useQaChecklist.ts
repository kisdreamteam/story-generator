import { useCallback, useEffect, useMemo, useState } from 'react'
import { QA_CHECKLIST_ITEMS } from '../config/qaChecklist'

export const QA_CHECKLIST_STORAGE_KEY = 'story-generator:qa-checklist'

function readCheckedIds(): Set<string> {
  try {
    if (typeof localStorage === 'undefined') {
      return new Set()
    }

    const raw = localStorage.getItem(QA_CHECKLIST_STORAGE_KEY)
    if (!raw) {
      return new Set()
    }

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return new Set()
    }

    const validIds = new Set(QA_CHECKLIST_ITEMS.map((item) => item.id))
    return new Set(parsed.filter((value): value is string => typeof value === 'string' && validIds.has(value)))
  } catch {
    return new Set()
  }
}

function writeCheckedIds(checkedIds: Set<string>): void {
  try {
    if (typeof localStorage === 'undefined') {
      return
    }

    localStorage.setItem(QA_CHECKLIST_STORAGE_KEY, JSON.stringify([...checkedIds]))
  } catch {
    // Ignore write failures.
  }
}

export interface UseQaChecklistResult {
  checkedIds: Set<string>
  completedCount: number
  totalCount: number
  isChecked: (id: string) => boolean
  toggleItem: (id: string) => void
  resetChecklist: () => void
}

export function useQaChecklist(): UseQaChecklistResult {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => readCheckedIds())

  useEffect(() => {
    writeCheckedIds(checkedIds)
  }, [checkedIds])

  const totalCount = QA_CHECKLIST_ITEMS.length
  const completedCount = useMemo(
    () => QA_CHECKLIST_ITEMS.filter((item) => checkedIds.has(item.id)).length,
    [checkedIds],
  )

  const isChecked = useCallback((id: string) => checkedIds.has(id), [checkedIds])

  const toggleItem = useCallback((id: string) => {
    setCheckedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const resetChecklist = useCallback(() => {
    setCheckedIds(new Set())
  }, [])

  return {
    checkedIds,
    completedCount,
    totalCount,
    isChecked,
    toggleItem,
    resetChecklist,
  }
}
