import { Link, NavLink, useLocation } from 'react-router';
import logo from '../assets/upbreed-logo.svg';
import DashboardIcon from '@/assets/jsx-icons/dashboard-icon';
import { cn } from '@/lib/utils';
import CalendarCheck from '@/assets/jsx-icons/calendar-check';
import Edit4 from '@/assets/jsx-icons/edit-4';
import Coin from '@/assets/jsx-icons/coin';
import UsersMore from '@/assets/jsx-icons/users-more';
import BlogIcon from '@/assets/jsx-icons/blog-icon';
import Logout from '@/assets/jsx-icons/logout';
import Settings from '@/assets/jsx-icons/settings';

const ROUTES = [
  {
    path: '/',
    label: 'Dashboard',
  },
  {
    path: '/projects',
    label: 'Projects',
  },
  {
    path: '/courses',
    label: 'Courses',
  },
  {
    path: '/finance',
    label: 'Finance',
  },
  {
    path: '/instructors',
    label: 'Instructors',
  },
  {
    path: '/blog',
    label: 'Blog',
  },
  {
    path: '/1-1-sessions',
    label: '1-1 Sessions',
  },
];

const Sidebar = () => {
  const { pathname } = useLocation();
  return (
    <aside className="hide-scrollbar fixed flex h-screen w-max flex-col gap-16 overflow-auto bg-[#305B43] px-11 pt-16">
      <Link to={'/'}>
        <img src={logo} alt="upbreed logo" />
      </Link>
      <div className="flex flex-col gap-[7.5rem]">
        <div className="flex flex-col gap-4">
          {ROUTES.map(route => (
            <NavLink
              to={route.path}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-4 rounded-lg px-6 py-2 text-xs/[100%] font-semibold transition-colors hover:bg-white hover:text-[#737373]',
                  isActive ? 'bg-white text-[#737373]' : 'bg-none text-white',
                )
              }
            >
              {route.path === '/' && (
                <div className="grid-stack grid">
                  <DashboardIcon
                    className={cn(
                      'grid-area-stack transition-opacity',
                      pathname === '/' && 'opacity-100',
                      pathname !== '/' && 'group-hover:!opacity-100',
                    )}
                  />
                  <DashboardIcon
                    stroke={'white'}
                    className={cn(
                      'grid-area-stack transition-opacity',
                      pathname === '/' && 'opacity-0',
                      pathname !== '/' && 'group-hover:!opacity-0',
                    )}
                  />
                </div>
              )}
              {route.path === '/projects' && (
                <div className="grid-stack grid">
                  <CalendarCheck
                    stroke={'#9B9B9B'}
                    className={cn(
                      'grid-area-stack transition-opacity',
                      pathname === '/projects' && 'opacity-100',
                      pathname !== '/projects' && 'group-hover:!opacity-100',
                    )}
                  />
                  <CalendarCheck
                    className={cn(
                      'grid-area-stack transition-opacity',
                      pathname === '/projects' && 'opacity-0',
                      pathname !== '/projects' && 'group-hover:!opacity-0',
                    )}
                  />
                </div>
              )}
              {route.path === '/courses' && (
                <div className="grid-stack grid">
                  <Edit4
                    stroke={'#737373'}
                    className={cn(
                      'grid-area-stack transition-opacity',
                      pathname === '/courses' && 'opacity-100',
                      pathname !== '/courses' && 'group-hover:!opacity-100',
                    )}
                  />
                  <Edit4
                    className={cn(
                      'grid-area-stack transition-opacity',
                      pathname === '/courses' && 'opacity-0',
                      pathname !== '/courses' && 'group-hover:!opacity-0',
                    )}
                  />
                </div>
              )}
              {route.path === '/finance' && (
                <div className="grid-stack grid">
                  <Coin
                    stroke={'#737373'}
                    className={cn(
                      'grid-area-stack transition-opacity',
                      pathname === '/finance' && 'opacity-100',
                      pathname !== '/finance' && 'group-hover:!opacity-100',
                    )}
                  />
                  <Coin
                    className={cn(
                      'grid-area-stack transition-opacity',
                      pathname === '/finance' && 'opacity-0',
                      pathname !== '/finance' && 'group-hover:!opacity-0',
                    )}
                  />
                </div>
              )}
              {route.path === '/instructors' && (
                <div className="grid-stack grid">
                  <UsersMore
                    stroke={'#737373'}
                    className={cn(
                      'grid-area-stack transition-opacity',
                      pathname === '/instructors' && 'opacity-100',
                      pathname !== '/instructors' && 'group-hover:!opacity-100',
                    )}
                  />
                  <UsersMore
                    className={cn(
                      'grid-area-stack transition-opacity',
                      pathname === '/instructors' && 'opacity-0',
                      pathname !== '/instructors' && 'group-hover:!opacity-0',
                    )}
                  />
                </div>
              )}
              {route.path === '/blog' && (
                <div className="grid-stack grid">
                  <BlogIcon
                    stroke={'#737373'}
                    className={cn(
                      'grid-area-stack transition-opacity',
                      pathname === '/blog' && 'opacity-100',
                      pathname !== '/blog' && 'group-hover:!opacity-100',
                    )}
                  />
                  <BlogIcon
                    className={cn(
                      'grid-area-stack transition-opacity',
                      pathname === '/blog' && 'opacity-0',
                      pathname !== '/blog' && 'group-hover:!opacity-0',
                    )}
                  />
                </div>
              )}
              {route.path === '/1-1-sessions' && (
                <div className="grid-stack grid">
                  <UsersMore
                    stroke={'#737373'}
                    className={cn(
                      'grid-area-stack transition-opacity',
                      pathname === '/1-1-sessions' && 'opacity-100',
                      pathname !== '/1-1-sessions' &&
                        'group-hover:!opacity-100',
                    )}
                  />
                  <UsersMore
                    className={cn(
                      'grid-area-stack transition-opacity',
                      pathname === '/1-1-sessions' && 'opacity-0',
                      pathname !== '/1-1-sessions' && 'group-hover:!opacity-0',
                    )}
                  />
                </div>
              )}
              {route.label}
            </NavLink>
          ))}
        </div>
        <div className="flex flex-col gap-4 px-6">
          <Link
            to="/settings"
            className="flex items-center gap-4 text-xs/[100%] font-semibold text-white"
          >
            <Settings />
            Settings
          </Link>
          <button className="flex cursor-pointer items-center gap-4 text-xs/[100%] font-semibold text-white">
            <Logout />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
