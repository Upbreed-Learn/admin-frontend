import { Outlet, useParams } from 'react-router';
import Sidebar from './sidebar';
import { cn } from '@/lib/utils';

const RootLayout = () => {
  const { id } = useParams();

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-[15.58625rem] flex w-full justify-center">
        <div className="flex w-full max-w-[60rem] flex-col">
          <div className="fixed z-20 flex w-[60rem] justify-end bg-white pt-14">
            <p
              className={cn(
                'text-xs/[100%] font-bold text-[#737373]',
                id && 'hidden',
              )}
            >
              Hi, Super Admin
            </p>
          </div>
          <div className="mt-[7.225625rem]">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default RootLayout;
