import { getAiConfig } from './aiConfig.service'

export type GenerationSubmitMode = 'mock' | 'fixture' | 'ai'

export interface GenerationSubmitUi {
  mode: GenerationSubmitMode
  buttonLabel: string
  helperText: string
}

export function getGenerationSubmitUi(): GenerationSubmitUi {
  const config = getAiConfig()

  if (!config.enabled) {
    return {
      mode: 'mock',
      buttonLabel: 'Generate Mock Story',
      helperText: 'This uses safe mock data for now.',
    }
  }

  if (config.fixtureMode) {
    return {
      mode: 'fixture',
      buttonLabel: 'Generate Story',
      helperText: 'This tests the AI response pipeline with fixture data.',
    }
  }

  return {
    mode: 'ai',
    buttonLabel: 'Generate Story',
    helperText: 'Real AI generation will run through the backend API.',
  }
}
