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

/** Dev-only POST /api/* generation routes — forward to server handlers. */
function createApiRoutePlugin(routePath: string, handlerModulePath: string, errorLabel: string): Plugin {
  return {
    name: `api-route-${routePath.replace(/\//g, '-')}`,
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0]

        if (url !== routePath) {
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
          const handlerModule = await import(handlerModulePath)
          const handleRequest =
            routePath === '/api/story-generation'
              ? handlerModule.handleStoryGenerationRequest
              : handlerModule.handleImageGenerationRequest
          const result = await handleRequest(parsed)

          res.statusCode = result.ok ? 200 : 503
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(result))
        } catch {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            ok: false,
            errorMessage: `${errorLabel} request failed.`,
          }))
        }
      })
    },
  }
}

/** Dev-only POST /api/story-generation — forwards to the server handler. */
function storyGenerationApiPlaceholderPlugin(): Plugin {
  return createApiRoutePlugin(
    '/api/story-generation',
    './server/api/story-generation/handleStoryGenerationRequest.ts',
    'Story generation API',
  )
}

/** Dev-only POST /api/image-generation — forwards to the server handler. */
function imageGenerationApiPlugin(): Plugin {
  return createApiRoutePlugin(
    '/api/image-generation',
    './server/api/image-generation/handleImageGenerationRequest.ts',
    'Image generation API',
  )
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    storyGenerationApiPlaceholderPlugin(),
    imageGenerationApiPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
