import type { FormEvent } from 'react'
import {
  AppButton,
  AppCard,
  AppInput,
  AppSelect,
  ComingSoonBadge,
  SectionCard,
} from '../../../shared/components'
import { ninaNinoSeries } from '../../series/services/series.service'
import { ageGroupOptions, languageOptions } from '../config/formOptions'
import type { Series } from '../../series/types'

interface CreateProjectFormProps {
  title: string
  onTitleChange: (value: string) => void
  seriesId: string
  onSeriesIdChange: (value: string) => void
  targetLanguage: string
  onTargetLanguageChange: (value: string) => void
  ageGroup: string
  onAgeGroupChange: (value: string) => void
  selectedSeries: Series | undefined
  seriesOptions: Series[]
  canSubmit: boolean
  onSubmit: (e: FormEvent) => void
  onCancel: () => void
}

export function CreateProjectForm({
  title,
  onTitleChange,
  seriesId,
  onSeriesIdChange,
  targetLanguage,
  onTargetLanguageChange,
  ageGroup,
  onAgeGroupChange,
  selectedSeries,
  seriesOptions,
  canSubmit,
  onSubmit,
  onCancel,
}: CreateProjectFormProps) {
  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-6">
      <SectionCard title="Project Details" description="Name your project and choose language settings">
        <div className="space-y-4">
          <AppInput
            label="Project Title"
            placeholder="e.g. The Market Adventure"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            required
          />

          <AppSelect
            label="Story Language"
            value={targetLanguage}
            onChange={(e) => onTargetLanguageChange(e.target.value)}
            options={languageOptions}
            hint="Stories are generated in English. Korean and Vietnamese translations are coming soon."
          />

          <AppSelect
            label="Age Group"
            value={ageGroup}
            onChange={(e) => onAgeGroupChange(e.target.value)}
            options={ageGroupOptions}
            hint={`Nina & Nino stories are designed for ages ${ninaNinoSeries.ageRange}`}
          />
        </div>
      </SectionCard>

      <SectionCard title="Series" description="Choose the story world for this project">
        <div className="space-y-4">
          <AppSelect
            label="Active Series"
            value={seriesId}
            onChange={(e) => onSeriesIdChange(e.target.value)}
            options={seriesOptions.map((s) => ({
              value: s.id,
              label: s.available ? s.name : `${s.name} (Coming soon)`,
              disabled: !s.available,
            }))}
          />

          {selectedSeries?.available && (
            <div className="rounded-lg bg-brand-50 p-3 text-sm text-stone-700">
              <p>{selectedSeries.description}</p>
              <p className="mt-2 text-xs text-stone-600">
                Characters: {selectedSeries.characters.map((c) => c.name).join(', ')}
              </p>
            </div>
          )}
        </div>
      </SectionCard>

      <AppCard className="border-dashed bg-stone-50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-stone-700">New Series</p>
              <ComingSoonBadge />
            </div>
            <p className="mt-1 text-xs text-stone-500">
              Custom series with your own characters and visual style will be available in a
              later release. V1 supports Nina & Nino only.
            </p>
          </div>
          <AppButton variant="secondary" size="sm" disabled className="shrink-0">
            Add Series
          </AppButton>
        </div>
      </AppCard>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <AppButton type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </AppButton>
        <AppButton type="submit" disabled={!canSubmit}>
          Create &amp; Continue to Setup
        </AppButton>
      </div>
    </form>
  )
}
