import { createBrowserRouter } from 'react-router-dom'
import { PublicLayout, DashboardLayout } from './layouts'
import { LandingPage } from './pages/LandingPage'
import { DashboardHomePage } from './pages/DashboardHomePage'
import {
  loadCreateProjectRoute,
  loadCreateStoryRoute,
  loadSettingsRoute,
  loadStoriesRoute,
  loadStoryDetailRoute,
  loadStoryEditRoute,
  loadStoryOutputRoute,
  loadStorySetupRoute,
} from './routeLoaders'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [{ index: true, element: <LandingPage /> }],
  },
  {
    element: <DashboardLayout />,
    children: [
      { path: 'dashboard', element: <DashboardHomePage /> },
      { path: 'dashboard/create', lazy: loadCreateStoryRoute },
      { path: 'dashboard/stories', lazy: loadStoriesRoute },
      { path: 'dashboard/stories/:storyId', lazy: loadStoryDetailRoute },
      { path: 'dashboard/stories/:storyId/edit', lazy: loadStoryEditRoute },
      { path: 'dashboard/settings', lazy: loadSettingsRoute },
      { path: 'projects/new', lazy: loadCreateProjectRoute },
      { path: 'projects/:projectId/setup', lazy: loadStorySetupRoute },
      { path: 'projects/:projectId/output', lazy: loadStoryOutputRoute },
    ],
  },
])
