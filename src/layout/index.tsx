import { Link, Outlet, useLocation, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { https } from '@/lib/https';
import Notifications from './notifications';
import Sidebar from './sidebar';
import { cn } from '@/lib/utils';
import 'prosemirror-view/style/prosemirror.css';
import { Toaster } from '@/components/ui/sonner';

const RootLayout = () => {
  const { id } = useParams();
  const { pathname } = useLocation();
  const me = useQuery({ queryKey: ['me'], queryFn: () => https.get('/user/profile').then(r => r.data.data as { fname: string }) });

  return (
    <div className="flex">
      <Toaster />
      <Sidebar />
      <main className="ml-[15.58625rem] flex w-full justify-center">
        <div className="flex w-full max-w-[60rem] flex-col">
          <div
            className={cn(
              'fixed z-20 flex w-[60rem] justify-end bg-white pt-10 pb-2',
              pathname.includes('blog/create') && 'hidden',
            )}
          >
            <div className={cn('flex items-center gap-4', id && 'hidden')}>
              <Notifications />
              <Link to="/settings" className="text-xs/[100%] font-bold text-[#737373] hover:text-[#305B43]">
                Hi, {me.data?.fname || 'Admin'}
              </Link>
            </div>
          </div>
          <div
            className={cn(
              !pathname.includes('blog/create') ? 'mt-[7.225625rem]' : 'pt-7',
            )}
          >
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default RootLayout;
