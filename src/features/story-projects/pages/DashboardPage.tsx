import { Link } from 'react-router-dom'
import { AppButton, EmptyState, PageHeader } from '../../../shared/components'
import { useProjects } from '../hooks/useProjects'
import { ProjectCard } from '../components/ProjectCard'

export function DashboardPage() {
  const projects = useProjects()

  return (
    <>
      <PageHeader
        title="Your Projects"
        description="Manage Nina & Nino story projects. Continue setup, view output, or start something new."
        actions={
          projects.length > 0 ? (
            <Link to="/projects/new">
              <AppButton>New Project</AppButton>
            </Link>
          ) : undefined
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          title="No story projects yet"
          description="Create your first Nina & Nino story project to get started."
        >
          <Link to="/projects/new">
            <AppButton>Create New Story</AppButton>
          </Link>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </>
  )
}
