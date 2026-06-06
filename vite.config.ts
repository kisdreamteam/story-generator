import path from 'node:path'
import type { IncomingMessage } from 'node:http'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []

    req.on('data', (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

/** Dev-only POST /api/story-generation — forwards to the server placeholder handler. */
function storyGenerationApiPlaceholderPlugin(): Plugin {
  return {
    name: 'story-generation-api-placeholder',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0]

        if (url !== '/api/story-generation') {
          next()
          return
        }

        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: false, errorMessage: 'Method not allowed.' }))
          return
        }

        try {
          const body = await readRequestBody(req)
          const parsed = body ? JSON.parse(body) : null
          const { handleStoryGenerationRequest } = await import(
            './server/api/story-generation/handleStoryGenerationRequest.ts'
          )
          const result = await handleStoryGenerationRequest(parsed)

          res.statusCode = result.ok ? 200 : 503
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(result))
        } catch {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            ok: false,
            errorMessage: 'Story generation API request failed.',
          }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), storyGenerationApiPlaceholderPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
