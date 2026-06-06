import { PageHeader } from '../../../shared/components'
import { CreateProjectForm } from '../components/CreateProjectForm'
import { useCreateProjectForm } from '../hooks/useCreateProjectForm'

export function CreateProjectPage() {
  const form = useCreateProjectForm()

  return (
    <>
      <PageHeader
        title="Create Project"
        description="Start a new Nina & Nino story project. Choose your series and basic settings."
      />

      <CreateProjectForm
        title={form.title}
        onTitleChange={form.setTitle}
        seriesId={form.seriesId}
        onSeriesIdChange={form.setSeriesId}
        targetLanguage={form.targetLanguage}
        onTargetLanguageChange={form.setTargetLanguage}
        ageGroup={form.ageGroup}
        onAgeGroupChange={form.setAgeGroup}
        selectedSeries={form.selectedSeries}
        seriesOptions={form.seriesList}
        canSubmit={form.canSubmit}
        onSubmit={form.handleSubmit}
        onCancel={form.handleCancel}
      />
    </>
  )
}
