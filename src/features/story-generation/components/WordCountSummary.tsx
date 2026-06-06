import { SectionCard } from '../../../shared/components'

interface WordCountSummaryProps {
  totalWordCount: number
  targetWordCount: number
  wordCountPercent: number
}

export function WordCountSummary({
  totalWordCount,
  targetWordCount,
  wordCountPercent,
}: WordCountSummaryProps) {
  return (
    <SectionCard title="Word Count" description="Total words across all pages">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-3xl font-bold text-stone-900">
            {totalWordCount}
            <span className="text-lg font-normal text-stone-500">
              {' '}
              / ~{targetWordCount} words
            </span>
          </p>
          <p className="mt-1 text-sm text-stone-600">{wordCountPercent}% of estimated target</p>
        </div>
        <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-stone-100 sm:w-48">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${Math.min(wordCountPercent, 100)}%` }}
          />
        </div>
      </div>
    </SectionCard>
  )
}
