import { createBrowserRouter } from 'react-router-dom'
import { PublicLayout, DashboardLayout, StudentStoryLayout } from './layouts'
import { LandingPage } from './pages/LandingPage'
import { DashboardHomePage } from './pages/DashboardHomePage'
import {
  loadClassroomDetailRoute,
  loadClassroomsRoute,
  loadCreateProjectRoute,
  loadCreateStoryRoute,
  loadSettingsRoute,
  loadStoriesRoute,
  loadStoryDetailRoute,
  loadStoryEditRoute,
  loadStoryOutputRoute,
  loadStoryReaderRoute,
  loadStoryRoleplayRoute,
  loadStoryPrintRoute,
  loadStorySetupRoute,
  loadStudentStoryRoute,
  loadQaChecklistRoute,
} from './routeLoaders'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [{ index: true, element: <LandingPage /> }],
  },
  {
    element: <StudentStoryLayout />,
    children: [{ path: 'student/story/:storyId', lazy: loadStudentStoryRoute }],
  },
  {
    element: <DashboardLayout />,
    children: [
      { path: 'dashboard', element: <DashboardHomePage /> },
      { path: 'dashboard/create', lazy: loadCreateStoryRoute },
      { path: 'dashboard/stories', lazy: loadStoriesRoute },
      { path: 'dashboard/stories/:storyId', lazy: loadStoryDetailRoute },
      { path: 'dashboard/stories/:storyId/read', lazy: loadStoryReaderRoute },
      { path: 'dashboard/stories/:storyId/roleplay', lazy: loadStoryRoleplayRoute },
      { path: 'dashboard/stories/:storyId/print', lazy: loadStoryPrintRoute },
      { path: 'dashboard/stories/:storyId/edit', lazy: loadStoryEditRoute },
      { path: 'dashboard/classrooms', lazy: loadClassroomsRoute },
      { path: 'dashboard/classrooms/:classroomId', lazy: loadClassroomDetailRoute },
      { path: 'dashboard/settings', lazy: loadSettingsRoute },
      { path: 'dashboard/dev/qa', lazy: loadQaChecklistRoute },
      { path: 'projects/new', lazy: loadCreateProjectRoute },
      { path: 'projects/:projectId/setup', lazy: loadStorySetupRoute },
      { path: 'projects/:projectId/output', lazy: loadStoryOutputRoute },
    ],
  },
])
