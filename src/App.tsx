import { createBrowserRouter, RouterProvider } from 'react-router';
import QueryProvider from './lib/query-provider';
import RootLayout from './layout';
import Dashboard from './dashboard';
import Projects from './projects';
import Finance from './finance';
import Instructors from './instructors';
import Blogs from './blogs';
import OneOneSessions from './1-1-sessions';
import { NuqsAdapter } from 'nuqs/adapters/react';
import UpdateProject from './projects/details';
import Courses from './courses';
import CreateBlog from './blogs/create';
import Login from './auth';
import { checkAuthLoader } from './lib/utils';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    loader: checkAuthLoader,
    children: [
      {
        path: '/',
        element: <Dashboard />,
      },
      {
        path: '/projects',
        children: [
          {
            index: true,
            element: <Projects />,
          },
          {
            path: '/projects/:id',
            element: <UpdateProject />,
          },
        ],
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
        children: [
          {
            index: true,
            element: <Blogs />,
          },
          {
            path: '/blog/create',
            element: <CreateBlog />,
          },
        ],
      },
      {
        path: '/1-1-sessions',
        element: <OneOneSessions />,
      },
    ],
  },
  {
    path: '/auth/login',
    element: <Login />,
  },
]);

function App() {
  return (
    <div className="App">
      <NuqsAdapter>
        <QueryProvider>
          <RouterProvider router={router} />
        </QueryProvider>
      </NuqsAdapter>
    </div>
  );
}

export default App;
