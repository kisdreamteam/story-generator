import { throwIfAborted } from '../generation/runtime/generationAbort'
import type { ImageGenerationProvider } from './imageGenerationProvider'
import type {
  GeneratedImageOutput,
  GeneratedImagePromptOutput,
  ImageGenerationInput,
  ImageGenerationProviderOptions,
} from './types'

const CONTINUITY = 'Nina (older) in indigo, Nino (younger) in emerald green; warm watercolor style'

const MOCK_IMAGE_PROMPTS: GeneratedImagePromptOutput[] = [
  {
    pageNumber: 1,
    prompt: 'Excited classmates in a sunny classroom, Nina and Nino listening to teacher announce fire station trip',
    continuityReminder: CONTINUITY,
  },
  {
    pageNumber: 2,
    prompt: 'Children walking in a line toward a red fire station building, Nina holding Nino\'s hand',
    continuityReminder: CONTINUITY,
  },
  {
    pageNumber: 3,
    prompt: 'Friendly firefighter greeting children at fire station entrance, warm welcoming scene',
    continuityReminder: CONTINUITY,
  },
  {
    pageNumber: 4,
    prompt: 'Large red fire truck inside station bay, Nina and Nino looking up at ladder',
    continuityReminder: CONTINUITY,
  },
  {
    pageNumber: 5,
    prompt: 'Younger child trying on firefighter helmet with help from older sibling and firefighter',
    continuityReminder: CONTINUITY,
  },
  {
    pageNumber: 6,
    prompt: 'Children practicing stop-drop-and-roll on mats inside fire station',
    continuityReminder: CONTINUITY,
  },
  {
    pageNumber: 7,
    prompt: 'Firefighter demonstrating water hose outdoors, children watching behind safety line',
    continuityReminder: CONTINUITY,
  },
  {
    pageNumber: 8,
    prompt: 'Firefighter pointing to smoke alarm in demo kitchen, attentive children nearby',
    continuityReminder: CONTINUITY,
  },
  {
    pageNumber: 9,
    prompt: 'Children with junior firefighter sticker badges, smiling in fire station',
    continuityReminder: CONTINUITY,
  },
  {
    pageNumber: 10,
    prompt: 'Teacher and firefighter teaching emergency number practice, calm classroom-style grouping',
    continuityReminder: CONTINUITY,
  },
  {
    pageNumber: 11,
    prompt: 'Children waving goodbye to firefighter at station, walking back toward school',
    continuityReminder: CONTINUITY,
  },
  {
    pageNumber: 12,
    prompt: 'Nina and Nino sharing field trip story in classroom circle time, proud and happy',
    continuityReminder: CONTINUITY,
  },
]

/** Static mock prompts used by the dashboard flow today. */
export function getMockImagePrompts(): GeneratedImagePromptOutput[] {
  return MOCK_IMAGE_PROMPTS
}

export const mockImageGenerationProvider: ImageGenerationProvider = {
  async generateImagePrompts(
    _input: ImageGenerationInput,
    options?: ImageGenerationProviderOptions,
  ): Promise<GeneratedImagePromptOutput[]> {
    throwIfAborted(options?.signal)
    return MOCK_IMAGE_PROMPTS
  },

  async generateImages(
    _input: ImageGenerationInput,
    prompts: GeneratedImagePromptOutput[],
    options?: ImageGenerationProviderOptions,
  ): Promise<GeneratedImageOutput[]> {
    throwIfAborted(options?.signal)

    return prompts.map((prompt) => ({
      pageNumber: prompt.pageNumber,
      imageUrl: null,
      status: 'prompt_only',
    }))
  },
}
