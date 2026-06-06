/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_ENABLE_SUPABASE_STORIES: string
  /** Dashboard story generation mode: mock | fixture | ai (Phase 5.2) */
  readonly VITE_GENERATION_MODE: string
  /** Backend route for AI story generation (no secrets) */
  readonly VITE_STORY_GENERATION_API_URL: string
  /** @deprecated Use server-side OPENAI_API_KEY — never expose provider secrets in VITE_* */
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_OPENAI_MODEL: string
  /** Story prompt template version for dashboard AI generation (Phase 5.9) */
  readonly VITE_STORY_PROMPT_VERSION: string
  readonly VITE_AI_PROVIDER: string
  readonly VITE_AI_MODEL: string
  readonly VITE_AI_GENERATION_ENABLED: string
  readonly VITE_AI_FIXTURE_MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
