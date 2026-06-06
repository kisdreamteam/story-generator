import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { PublicLayout, DashboardLayout } from './layouts'
import { LandingPage } from './pages/LandingPage'
import { DashboardPage } from '../features/story-projects/pages/DashboardPage'
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
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'projects/new', element: <CreateProjectPage /> },
      { path: 'projects/:projectId/setup', element: <StorySetupPage /> },
      { path: 'projects/:projectId/output', element: <StoryOutputPage /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
