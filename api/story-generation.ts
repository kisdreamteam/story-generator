import { handleStoryGenerationRequest } from '../server/api/story-generation/handleStoryGenerationRequest'

interface ApiRequest {
  method?: string
  body?: unknown
}

interface ApiResponse {
  status(statusCode: number): ApiResponse
  json(payload: unknown): void
}

/**
 * Vercel serverless route: POST /api/story-generation
 *
 * Delegates to handleStoryGenerationRequest — OPENAI_API_KEY stays server-side only.
 */
export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, errorMessage: 'Method not allowed.' })
    return
  }

  try {
    const result = await handleStoryGenerationRequest(req.body ?? null)
    res.status(result.ok ? 200 : 503).json(result)
  } catch {
    res.status(500).json({
      ok: false,
      errorMessage: 'Story generation API request failed.',
    })
  }
}
