import type { AiGenerationDebugStatus } from '../types/ai.types'

interface AiGenerationStatusProps {
  status: AiGenerationDebugStatus
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-xs font-medium text-stone-500">{label}</dt>
      <dd className="font-mono text-xs text-stone-700">{value}</dd>
    </div>
  )
}

export function AiGenerationStatus({ status }: AiGenerationStatusProps) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-stone-100/80">
      <div className="border-b border-stone-200 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          Developer
        </p>
        <h2 className="text-sm font-medium text-stone-700">AI Generation Status</h2>
      </div>

      <dl className="space-y-3 p-4">
        <StatusRow label="AI enabled" value={status.enabled ? 'true' : 'false'} />
        <StatusRow label="Fixture mode" value={status.fixtureMode ? 'true' : 'false'} />
        <StatusRow label="Provider" value={status.provider} />
        <StatusRow label="Model" value={status.model} />
        <StatusRow label="Generation mode" value={status.generationMode} />
        {status.fallbackReason && (
          <StatusRow label="Fallback reason" value={status.fallbackReason} />
        )}
        {status.lastAiError && (
          <div>
            <dt className="text-xs font-medium text-red-600">Last AI error</dt>
            <dd className="mt-1 font-mono text-xs text-red-700">{status.lastAiError}</dd>
          </div>
        )}
      </dl>

      <p className="border-t border-stone-200 px-4 py-3 text-xs text-stone-500">
        Story generation must go through a server/API boundary — never call AI providers
        directly from the browser.
      </p>
    </div>
  )
}
