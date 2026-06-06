import { useCallback, useEffect, useMemo, useState } from 'react'
import type { EditablePageCommit, EditablePageDraft } from '../types/editablePage.types'
import {
  createEditablePageDraft,
  editablePageDraftEqual,
  validateEditablePageDraft,
} from '../utils/validateEditablePageCard'
import type { EditablePageCardViewModel } from '../types/editablePage.types'

interface UseEditablePageCardStateOptions {
  model: EditablePageCardViewModel
  isEditing: boolean
  includesFlashcards?: boolean
}

export function useEditablePageCardState({
  model,
  isEditing,
  includesFlashcards = false,
}: UseEditablePageCardStateOptions) {
  const { page, imagePrompt, flashcards = [] } = model

  const [draft, setDraft] = useState<EditablePageDraft>(() =>
    createEditablePageDraft(page, imagePrompt, flashcards),
  )
  const [editBaseline, setEditBaseline] = useState<EditablePageDraft>(() =>
    createEditablePageDraft(page, imagePrompt, flashcards),
  )
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isEditing) {
      const next = createEditablePageDraft(page, imagePrompt, flashcards)
      setDraft(next)
      setEditBaseline(next)
      setFieldErrors({})
    }
  }, [isEditing, page, imagePrompt, flashcards])

  useEffect(() => {
    if (isEditing) {
      const baseline = createEditablePageDraft(page, imagePrompt, flashcards)
      setEditBaseline(baseline)
      setDraft(baseline)
      setFieldErrors({})
    }
  }, [isEditing, page.pageNumber])

  const isDirty = useMemo(
    () => isEditing && !editablePageDraftEqual(draft, editBaseline),
    [isEditing, draft, editBaseline],
  )

  const wordCount = useMemo(() => {
    const words = draft.text.trim().split(/\s+/).filter(Boolean)
    return words.length
  }, [draft.text])

  const updateTeachingFocus = useCallback((teachingFocus: string) => {
    setDraft((current) => ({ ...current, teachingFocus }))
    setFieldErrors((current) => {
      const next = { ...current }
      delete next.teachingFocus
      return next
    })
  }, [])

  const updateText = useCallback((text: string) => {
    setDraft((current) => ({ ...current, text }))
    setFieldErrors((current) => {
      const next = { ...current }
      delete next.text
      return next
    })
  }, [])

  const updateImagePromptField = useCallback(
    (field: 'prompt' | 'continuityReminder', value: string) => {
      setDraft((current) => ({
        ...current,
        imagePrompt: current.imagePrompt
          ? { ...current.imagePrompt, [field]: value }
          : {
              pageNumber: current.pageNumber,
              prompt: field === 'prompt' ? value : '',
              continuityReminder: field === 'continuityReminder' ? value : '',
            },
      }))
      setFieldErrors((current) => {
        const next = { ...current }
        delete next.imagePrompt
        delete next.continuityReminder
        return next
      })
    },
    [],
  )

  const updateFlashcard = useCallback(
    (index: number, field: keyof EditablePageDraft['flashcards'][number], value: string) => {
      setDraft((current) => ({
        ...current,
        flashcards: current.flashcards.map((card, cardIndex) =>
          cardIndex === index ? { ...card, [field]: value } : card,
        ),
      }))
      setFieldErrors((current) => {
        const next = { ...current }
        delete next[`flashcard-${index}-word`]
        delete next[`flashcard-${index}-definition`]
        return next
      })
    },
    [],
  )

  const cancelEdits = useCallback(() => {
    setDraft(editBaseline)
    setFieldErrors({})
  }, [editBaseline])

  const buildCommit = useCallback((): EditablePageCommit | null => {
    const validation = validateEditablePageDraft(draft, { includesFlashcards })
    if (!validation.isValid) {
      setFieldErrors(validation.fieldErrors)
      return null
    }

    setFieldErrors({})
    return {
      pageNumber: draft.pageNumber,
      teachingFocus: draft.teachingFocus.trim(),
      text: draft.text.trim(),
      imagePrompt: draft.imagePrompt,
      flashcards: includesFlashcards ? draft.flashcards : undefined,
    }
  }, [draft, includesFlashcards])

  return {
    draft,
    fieldErrors,
    isDirty,
    wordCount,
    updateTeachingFocus,
    updateText,
    updateImagePromptField,
    updateFlashcard,
    cancelEdits,
    buildCommit,
  }
}
