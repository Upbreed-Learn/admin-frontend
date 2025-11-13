import FileIcon from '@/assets/jsx-icons/file-icon';
import MoneyIcon from '@/assets/jsx-icons/money-icon';
import PeopleAlt from '@/assets/jsx-icons/people-alt';
import UsersMore from '@/assets/jsx-icons/users-more';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';
import Subscriber from './subscriber';
import SubscriberGrowth from './subscriber-growth';
import TotalRevenueChart from './total-revenue';
import { Link } from 'react-router';
import Instructors from './instructors';
import { cn, formatNumber } from '@/lib/utils';
import { ArrowLeftRight, MoreVertical } from 'lucide-react';
import { useQueryState } from 'nuqs';
import ExportDropdown from '@/components/ui/custom/dropdown-menu';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERIES } from '@/queries';
import type { DashboardDataType } from '@/lib/constants';

export const useGetDashboardData = () => {
  return useQuery({
    queryKey: ['dashboardData'],
    queryFn: () => QUERIES.getDashboardData(),
  });
};

const Dashboard = () => {
  const [currency, setCurrency] = useQueryState('currency', {
    defaultValue: 'NGN',
  });

  const queryClient = useQueryClient();

  const { data, isPending, isError } = useGetDashboardData();

  const dashboardData: DashboardDataType = data?.data;

  return (
    <div className="flex flex-col gap-1.5 pb-6">
      <ExportDropdown className="self-end">
        <MoreVertical />
      </ExportDropdown>
      <div className="flex flex-col gap-3.5">
        {isError ? (
          <SummaryCardError
            onRetry={() =>
              queryClient.invalidateQueries({ queryKey: ['dashboardData'] })
            }
          />
        ) : (
          <div className="flex items-center gap-10">
            {isPending ? (
              Array(4)
                .fill(0)
                .map((_, i) => <SummaryCardSkeleton key={i} />)
            ) : (
              <>
                <SummaryCard title="Total Reports" value={'0'}>
                  <FileIcon />
                </SummaryCard>
                <SummaryCard
                  title="Instructors"
                  value={formatNumber(dashboardData.totalInstructors)}
                >
                  <UsersMore size={'10'} stroke="white" />
                </SummaryCard>
                <SummaryCard
                  title="Subscribers"
                  value={formatNumber(dashboardData.totalSubscribers)}
                >
                  <PeopleAlt />
                </SummaryCard>
                <SummaryCard
                  title="Total Revenue"
                  value={
                    currency === 'NGN'
                      ? `₦${formatNumber(dashboardData.totalRevenue.naira)}`
                      : `$${formatNumber(dashboardData.totalRevenue.usd)}`
                  }
                  className="relative"
                >
                  <MoneyIcon />
                  <Button
                    onClick={() =>
                      setCurrency(value => (value === 'NGN' ? 'USD' : 'NGN'))
                    }
                    className="absolute top-1.5 right-2 h-8 rounded-xl font-bold"
                  >
                    {currency === 'NGN' ? '₦' : '$'}
                    <ArrowLeftRight />
                  </Button>
                </SummaryCard>
              </>
            )}
          </div>
        )}
        <div className="flex gap-5">
          <Subscriber />
          <SubscriberGrowth />
        </div>
        <div className="flex gap-5">
          <div className="flex basis-full flex-col gap-2">
            {isError ? (
              <TotalRevenueError
                message="Network error"
                onRetry={() =>
                  queryClient.invalidateQueries({ queryKey: ['dashboardData'] })
                }
              />
            ) : isPending ? (
              <TotalRevenueSkeleton />
            ) : (
              <TotalRevenueChart revenueData={dashboardData.revenueHistory} />
            )}
            <Link
              to={'/finance'}
              className="self-end text-[8px]/[100%] font-semibold text-[#949494] underline"
            >
              Read more...
            </Link>
          </div>
          <Instructors />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

const SummaryCard = (props: {
  title: string;
  value: string;
  children: ReactNode;
  className?: string;
}) => {
  const { title, value, children, className } = props;
  return (
    <div
      className={cn(
        'flex basis-full items-end gap-3 rounded-xl bg-[#305B43] py-4 pr-3 pl-5',
        className,
      )}
    >
      <div className="w-full">
        <p className="text-4xl/[100%] font-semibold text-white">{value}</p>
        <p className="text-right text-[8px]/[100%] text-[#D0EA50]">{title}</p>
      </div>
      <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#FFFFFF66]">
        {children}
      </div>
    </div>
  );
};

const SummaryCardSkeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        'flex basis-full animate-pulse items-end gap-3 rounded-xl bg-[#305B43] py-4 pr-3 pl-5',
        className,
      )}
      role="status"
      aria-label="loading summary card"
    >
      <div className="w-full">
        <div className="h-10 w-40 rounded bg-[#DFF6E6] opacity-95" />
        <div className="mt-2 ml-auto h-3 w-24 rounded bg-[#E6F8E6] opacity-95" />
      </div>
      <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#FFFFFF66]">
        <div className="h-4 w-4 rounded-full bg-white/70" />
      </div>
    </div>
  );
};

const SummaryCardError = ({
  title,
  message,
  onRetry,
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'flex basis-full items-end gap-3 rounded-xl bg-[#FFF5F5] py-4 pr-3 pl-5',
        className,
      )}
      role="alert"
      aria-label="summary card error"
    >
      <div className="w-full">
        <p className="text-2xl font-semibold text-[#D14343]">
          {title ?? 'Unable to load'}
        </p>
        <p className="text-right text-[8px] text-[#9C9C9C]">
          {message ?? 'Something went wrong'}
        </p>
      </div>
      <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#FFFFFF66]">
        <button
          onClick={onRetry}
          className="rounded bg-[#D14343] px-2 py-1 text-xs font-semibold text-white"
        >
          Retry
        </button>
      </div>
    </div>
  );
};

const TotalRevenueSkeleton = ({ className }: { className?: string }) => {
  return (
    <div
      role="status"
      aria-label="loading total revenue"
      className={cn(
        'w-full animate-pulse rounded-[5.5px] bg-white p-8 shadow-[0px_1.57px_1.57px_0px_#0000000A]',
        className,
      )}
    >
      <div className="mb-8 flex items-center justify-between">
        <div className="h-5 w-40 rounded bg-[#E6EFE6]" />
        <div className="flex gap-1.5">
          <div className="flex items-center gap-1">
            <div className="h-[7px] w-[7px] rounded-full bg-[#DDEDE0]" />
            <div className="h-3 w-10 rounded bg-[#E6EFE6]" />
          </div>
          <div className="flex items-center gap-1">
            <div className="h-[7px] w-[7px] rounded-full bg-[#DDEDE0]" />
            <div className="h-3 w-12 rounded bg-[#E6EFE6]" />
          </div>
        </div>
      </div>

      <div className="h-[140px] w-full rounded bg-[#E6EFE6]" />
    </div>
  );
};

const TotalRevenueError = ({
  message,
  onRetry,
  className,
}: {
  message?: string;
  onRetry?: () => void;
  className?: string;
}) => {
  return (
    <div
      role="alert"
      aria-label="total revenue error"
      className={cn(
        'w-full rounded-[5.5px] bg-[#FFF5F5] p-8 shadow-[0px_1.57px_1.57px_0px_#0000000A]',
        className,
      )}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#D14343]">Total Revenue</h3>
          <p className="mt-1 text-xs text-[#6B6B6B]">
            {message ?? 'Failed to load revenue data.'}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onRetry}
            className="rounded bg-[#D14343] px-3 py-1 text-sm font-semibold text-white"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded border border-[#E6E6E6] bg-transparent px-3 py-1 font-semibold text-[#305B43]"
          >
            Reload
          </button>
        </div>
      </div>

      <div className="flex h-[140px] w-full items-center justify-center rounded bg-[#FFEAEA] text-sm text-[#6B6B6B]">
        Unable to display chart
      </div>
    </div>
  );
};
