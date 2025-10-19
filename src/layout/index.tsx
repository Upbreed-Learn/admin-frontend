import { Outlet, useLocation, useParams } from 'react-router';
import Sidebar from './sidebar';
import { cn } from '@/lib/utils';
import 'prosemirror-view/style/prosemirror.css';
import { Toaster } from '@/components/ui/sonner';

const RootLayout = () => {
  const { id } = useParams();
  const { pathname } = useLocation();

  return (
    <div className="flex">
      <Toaster />
      <Sidebar />
      <main className="ml-[15.58625rem] flex w-full justify-center">
        <div className="flex w-full max-w-[60rem] flex-col">
          <div
            className={cn(
              'fixed z-20 flex w-[60rem] justify-end bg-white pt-14',
              pathname.includes('blog/create') && 'hidden',
            )}
          >
            <p
              className={cn(
                'text-xs/[100%] font-bold text-[#737373]',
                id && 'hidden',
              )}
            >
              Hi, Super Admin
            </p>
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
