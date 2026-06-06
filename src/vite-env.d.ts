/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_PROVIDER: string
  readonly VITE_AI_MODEL: string
  readonly VITE_AI_GENERATION_ENABLED: string
  readonly VITE_AI_FIXTURE_MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
