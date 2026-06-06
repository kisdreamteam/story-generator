import { Link } from 'react-router-dom'
import {
  AppButton,
  ErrorState,
  PageHeader,
} from '../../../shared/components'
import { OutputActionsBar } from '../components/OutputActionsBar'
import { OutputTabBar } from '../components/OutputTabBar'
import { WordCountSummary } from '../components/WordCountSummary'
import { StoryPageList } from '../components/StoryPageList'
import { FlashcardGrid } from '../components/FlashcardGrid'
import { ImagePromptList } from '../components/ImagePromptList'
import { TeacherNotesPanel } from '../components/TeacherNotesPanel'
import { OutputDebugPanel } from '../components/OutputDebugPanel'
import { ProjectSummaryPanel } from '../components/ProjectSummaryPanel'
import { GenerationModeBadge } from '../components/GenerationModeBadge'
import { FallbackStoryNotice } from '../components/FallbackStoryNotice'
import { StoryGenerationLoadingState } from '../components/StoryGenerationLoadingState'
import { FALLBACK_STORY_NOTICE_MESSAGE } from '../config/fallbackStoryNotice'
import { useStoryOutput } from '../hooks/useStoryOutput'
import { useOutputReviewTabs } from '../hooks/useOutputReviewTabs'
import { useClipboardActions } from '../hooks/useClipboardActions'
import { useProjectSummary } from '../hooks/useProjectSummary'
import type { AiGenerationDebugStatus } from '../types/ai.types'
import type { StoryPromptOutput } from '../prompt.types'
import type { StoryGenerationInput, StoryGenerationOutput } from '../types'
import type { GenerationMode } from '../types/ai.types'
import type { ValidationResult } from '../validation.types'
import type { OutputReviewTab } from '../config/outputReviewTabs'

export function StoryOutputPage() {
  const {
    projectId,
    story,
    generationInput,
    prompt,
    validation,
    generationMode,
    aiStatus,
    showFallbackNotice,
    isLoading,
    outputError,
    isOutputReady,
    targetWordCount,
    wordCountPercent,
  } = useStoryOutput()
  const { activeTab, setActiveTab } = useOutputReviewTabs()

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Generating Story"
          description="Your Nina & Nino story is being created from your setup."
        />
        <div className="mt-6">
          <StoryGenerationLoadingState />
        </div>
      </>
    )
  }

  if (!isOutputReady || !story) {
    return (
      <>
        <PageHeader
          title="Story Output Unavailable"
          description="We could not display a valid story for this project."
        />
        <div className="mt-6">
          <ErrorState
            title="Unable to load story output"
            description={outputError ?? 'Something went wrong while loading this story.'}
          >
            <Link to="/dashboard">
              <AppButton variant="secondary">Back to Dashboard</AppButton>
            </Link>
            <Link to="/projects/new">
              <AppButton>Create Another Story</AppButton>
            </Link>
          </ErrorState>
        </div>
      </>
    )
  }

  return (
    <StoryOutputContent
      projectId={projectId ?? ''}
      story={story}
      generationInput={generationInput}
      prompt={prompt}
      validation={validation}
      generationMode={generationMode}
      aiStatus={aiStatus}
      showFallbackNotice={showFallbackNotice}
      targetWordCount={targetWordCount}
      wordCountPercent={wordCountPercent}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  )
}

interface StoryOutputContentProps {
  projectId: string
  story: StoryGenerationOutput
  generationInput: StoryGenerationInput
  prompt: StoryPromptOutput
  validation: ValidationResult
  generationMode: GenerationMode
  aiStatus: AiGenerationDebugStatus
  showFallbackNotice: boolean
  targetWordCount: number
  wordCountPercent: number
  activeTab: OutputReviewTab
  onTabChange: (tab: OutputReviewTab) => void
}

function StoryOutputContent({
  projectId,
  story,
  generationInput,
  prompt,
  validation,
  generationMode,
  aiStatus,
  showFallbackNotice,
  targetWordCount,
  wordCountPercent,
  activeTab,
  onTabChange,
}: StoryOutputContentProps) {
  const { fields } = useProjectSummary(story, generationInput)
  const { feedback, copyStory, copyFlashcards, copyImagePrompts } = useClipboardActions(story)

  return (
    <>
      <PageHeader
        title={story.title}
        description={story.summary}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <GenerationModeBadge mode={generationMode} />
            <Link to={`/projects/${projectId}/setup`}>
              <AppButton variant="secondary" size="sm">
                Edit Setup
              </AppButton>
            </Link>
            <Link to="/dashboard">
              <AppButton variant="ghost" size="sm">
                Dashboard
              </AppButton>
            </Link>
          </div>
        }
      />

      {showFallbackNotice && (
        <div className="mt-4">
          <FallbackStoryNotice message={FALLBACK_STORY_NOTICE_MESSAGE} />
        </div>
      )}

      <div className="mt-6 space-y-6">
        <ProjectSummaryPanel projectId={projectId} fields={fields} />

        <OutputActionsBar
          onCopyStory={copyStory}
          onCopyFlashcards={copyFlashcards}
          onCopyImagePrompts={copyImagePrompts}
          feedback={feedback}
        />

        <OutputTabBar activeTab={activeTab} onTabChange={onTabChange} />

        {activeTab === 'story' && (
          <>
            <WordCountSummary
              totalWordCount={story.totalWordCount}
              targetWordCount={targetWordCount}
              wordCountPercent={wordCountPercent}
            />
            <StoryPageList pages={story.pages} />
          </>
        )}

        {activeTab === 'flashcards' && (
          <FlashcardGrid flashcards={story.flashcards} />
        )}

        {activeTab === 'image-prompts' && (
          <ImagePromptList imagePrompts={story.imagePrompts} />
        )}

        {activeTab === 'teacher-notes' && (
          <TeacherNotesPanel
            storyPurpose={generationInput.storyPurpose}
            storyTone={generationInput.storyTone}
            learningGoal={generationInput.learningGoal}
            vocabularyFocus={generationInput.vocabularyFocus}
            pages={story.pages}
          />
        )}

        {activeTab === 'debug' && (
          <OutputDebugPanel validation={validation} prompt={prompt} aiStatus={aiStatus} />
        )}
      </div>
    </>
  )
}
