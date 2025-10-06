import { createBrowserRouter, RouterProvider } from 'react-router';
import QueryProvider from './lib/query-provider';
import RootLayout from './layout';
import Dashboard from './dashboard';
import Projects from './projects';
import Courses from './courses';
import Finance from './finance';
import Instructors from './instructors';
import Blogs from './blogs';
import OneOneSessions from './1-1-sessions';
import Settings from './settings';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <Dashboard />,
      },
      {
        path: '/projects',
        element: <Projects />,
      },
      {
        path: '/courses',
        element: <Courses />,
      },
      {
        path: '/finance',
        element: <Finance />,
      },
      {
        path: '/instructors',
        element: <Instructors />,
      },
      {
        path: '/blog',
        element: <Blogs />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
      {
        path: '/1-1-sessions',
        element: <OneOneSessions />,
      },
    ],
  },
]);

function App() {
  return (
    <div className="App">
      <QueryProvider>
        <RouterProvider router={router} />
      </QueryProvider>
    </div>
  );
}

export default App;
