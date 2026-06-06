/**
 * Feature-layer bridge to the shared image generation boundary.
 * Story text generation continues to use the legacy image-generation service.
 */
export {
  buildImageGenerationJob,
  cancelActiveImageGenerationJob,
  enqueueImageGenerationJob,
  getActiveImageGenerationJob,
  getImageGenerationJobStatus,
  getLastImageGenerationJob,
  imagePromptRecordFromAIOutput,
  imagePromptRecordFromStoryPrompt,
  ImageAssetStatus,
  ImageGenerationMode,
  loadPersistedStoryImagePrompts,
  loadStoryImageGenerationRecord,
  persistImagePromptsForStory,
  retryActiveImageGenerationJob,
  storyImagePromptsFromRecords,
  type ImageAssetRecord,
  type ImageGenerationJob,
  type ImageGenerationJobInput,
  type ImageGenerationJobOutput,
  type ImagePromptRecord,
  type StoryImageGenerationRecord,
} from '@/shared/ai/images'
