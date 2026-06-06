export type CopyActionId = 'story' | 'flashcards' | 'imagePrompts'

export type CopyFeedback = Partial<Record<CopyActionId, string>>
