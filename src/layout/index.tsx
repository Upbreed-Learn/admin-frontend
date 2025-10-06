import { Outlet } from 'react-router';
import Sidebar from './sidebar';

const RootLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-[15.58625rem] flex w-full justify-center">
        <div className="flex w-full max-w-[54.6875rem] flex-col">
          <div className="fixed self-end pt-14">
            <p className="">Hi, Super Admin</p>
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
