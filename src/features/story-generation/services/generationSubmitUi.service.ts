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
      helperText: 'You will preview a sample story — safe for trying the workflow.',
    }
  }

  if (config.fixtureMode) {
    return {
      mode: 'fixture',
      buttonLabel: 'Generate Story',
      helperText: 'You will preview a sample story built from test data.',
    }
  }

  return {
    mode: 'ai',
    buttonLabel: 'Generate Story',
    helperText: 'Your story will be created through our server when connected.',
  }
}
