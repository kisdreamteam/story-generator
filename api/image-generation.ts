import { handleImageGenerationRequest } from '../server/api/image-generation/handleImageGenerationRequest'

interface ApiRequest {
  method?: string
  body?: unknown
}

interface ApiResponse {
  status(statusCode: number): ApiResponse
  json(payload: unknown): void
}

/**
 * Vercel serverless route: POST /api/image-generation
 *
 * Single-page illustration only. Provider secrets stay server-side.
 */
export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, errorMessage: 'Method not allowed.' })
    return
  }

  try {
    const result = await handleImageGenerationRequest(req.body ?? null)
    res.status(result.ok ? 200 : 503).json(result)
  } catch {
    res.status(500).json({
      ok: false,
      errorMessage: 'Image generation API request failed.',
    })
  }
}
