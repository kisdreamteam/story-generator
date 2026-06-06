import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { PublicLayout, DashboardLayout } from './layouts'
import { LandingPage } from './pages/LandingPage'
import { DashboardHomePage } from './pages/DashboardHomePage'
import { CreateStoryPage } from './pages/CreateStoryPage'
import { StoriesPage } from './pages/StoriesPage'
import { StoryDetailPage } from './pages/StoryDetailPage'
import { StoryEditPage } from './pages/StoryEditPage'
import { SettingsPage } from './pages/SettingsPage'
import { CreateProjectPage } from '../features/story-projects/pages/CreateProjectPage'
import { StorySetupPage } from '../features/story-projects/pages/StorySetupPage'
import { StoryOutputPage } from '../features/story-generation/pages/StoryOutputPage'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [{ index: true, element: <LandingPage /> }],
  },
  {
    element: <DashboardLayout />,
    children: [
      { path: 'dashboard', element: <DashboardHomePage /> },
      { path: 'dashboard/create', element: <CreateStoryPage /> },
      { path: 'dashboard/stories', element: <StoriesPage /> },
      { path: 'dashboard/stories/:storyId', element: <StoryDetailPage /> },
      { path: 'dashboard/stories/:storyId/edit', element: <StoryEditPage /> },
      { path: 'dashboard/settings', element: <SettingsPage /> },
      { path: 'projects/new', element: <CreateProjectPage /> },
      { path: 'projects/:projectId/setup', element: <StorySetupPage /> },
      { path: 'projects/:projectId/output', element: <StoryOutputPage /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
