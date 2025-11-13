import { Button } from '@/components/ui/button';
import FinanceTabs from './tabs';
import { useQueryState } from 'nuqs';
import { ArrowLeftRight } from 'lucide-react';
import MoreTransactionHistoryModal from './more-transaction-history-modal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERIES } from '@/queries';
import type { FinanceDataType } from '@/lib/constants';
import { formatNumber, formatToYearMonth } from '@/lib/utils';
import TotalRevenueChart from '@/dashboard/total-revenue';
import { TotalRevenueError, TotalRevenueSkeleton } from '@/dashboard';

const useGetFinanceData = (period?: '24h' | '7d' | '30d' | '12m') => {
  return useQuery({
    queryKey: ['financeData', { period }],
    queryFn: () => QUERIES.getFinanceData(period),
  });
};

type DataPoint = { month: string; usd: number; naira: number };

const Finance = () => {
  const [duration, _] = useQueryState('duration', {
    defaultValue: '12m',
  });
  const [currency, setCurrency] = useQueryState('currency', {
    defaultValue: 'NGN',
  });
  const queryClient = useQueryClient();

  const { data, isPending, isError } = useGetFinanceData(
    duration as '12m' | '30d' | '7d' | '24h',
  );
  const financeData: FinanceDataType = data?.data;

  const revenueData: DataPoint[] = financeData?.revenueHistory.map(data => ({
    month: formatToYearMonth(data.timestamp),
    usd: data.usd,
    naira: data.naira,
  }));

  return (
    <div className="flex flex-col gap-3">
      <FinanceTabs />
      <div className="flex flex-col gap-2 self-end">
        <Button
          onClick={() =>
            setCurrency(value => (value === 'NGN' ? 'USD' : 'NGN'))
          }
          className="h-8 rounded-xl font-bold"
        >
          {currency === 'NGN' ? '₦' : '$'}
          <ArrowLeftRight />
        </Button>
      </div>
      {isError ? (
        <FinanceStatsError
          message="Failed to load finance summary."
          onRetry={() =>
            queryClient.invalidateQueries({ queryKey: ['financeData'] })
          }
        />
      ) : isPending ? (
        <FinanceStatsSkeleton />
      ) : (
        <div className="flex items-center gap-7 rounded-lg pt-[1.625rem] pb-9 shadow-[0px_2.03px_2.03px_0px_#0000000A]">
          <div className="flex basis-full flex-col gap-0.5">
            <p className="text-5xl/[100%] font-bold">
              {currency === 'NGN'
                ? `₦${formatNumber(financeData.currentMonthRevenue.naira)}`
                : `$${formatNumber(financeData.currentMonthRevenue.usd)}`}
            </p>
            <p className="text-xs/[100%] font-semibold">Monthly Revenue</p>
          </div>
          <div className="flex basis-full flex-col gap-0.5 border-x border-[#9B9B9B] py-6 pr-8 pl-14">
            <p className="text-5xl/[100%] font-bold">
              {currency === 'NGN'
                ? `₦${formatNumber(financeData.currentYearRevenue.naira)}`
                : `$${formatNumber(financeData.currentYearRevenue.usd)}`}
            </p>
            <p className="text-xs/[100%] font-semibold">Yearly Revenue</p>
          </div>
          <div className="flex basis-full flex-col gap-0.5">
            <p className="text-5xl/[100%] font-bold">
              {currency === 'NGN'
                ? `₦${formatNumber(financeData.totalRevenue.naira)}`
                : `$${formatNumber(financeData.totalRevenue.usd)}`}
            </p>
            <p className="text-xs/[100%] font-semibold">Total Revenue</p>
          </div>
        </div>
      )}
      <div className="flex items-start gap-6">
        {isError ? (
          <TotalRevenueError />
        ) : isPending ? (
          <TotalRevenueSkeleton />
        ) : (
          <TotalRevenueChart
            height={180}
            className="flex-2/3"
            revenueData={revenueData}
          />
        )}
        <TransactionHistory />
      </div>
    </div>
  );
};

export default Finance;

const TransactionHistory = () => {
  const [_, setViewMore] = useQueryState('viewMore');

  return (
    <>
      <MoreTransactionHistoryModal />
      <div className="flex flex-1/3 flex-col gap-7 rounded bg-[#E3E3E333] p-3.5">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Transaction History</p>
          {/* <div className={cn('relative w-full max-w-20')}>
            <Input
              type="search"
              placeholder="Search"
              className="rounded-[1.25rem] pl-4 text-xs/[100%] placeholder:text-[5px]/[100%]"
            />
            <Search
              className="absolute top-3.5 left-1.5 -translate-y-1/2"
              size={6}
            />
          </div> */}
        </div>
        <div className="flex flex-col gap-3">
          {Array(7)
            .fill(null)
            .map((_, i) => (
              <HistoryCard key={i} />
            ))}

          <Button
            onClick={() => setViewMore('true')}
            className="cursor-pointer self-end bg-transparent text-[8px]/[100%] font-semibold text-[#949494] underline hover:bg-transparent"
          >
            View more...
          </Button>
        </div>
      </div>
    </>
  );
};

const HistoryCard = () => {
  return (
    <div className="flex justify-between border-b border-[#00000026] pb-0.5">
      <div>
        <p className="text-sm/[100%] font-medium">Chinedu Asake</p>
        <p className="text-xs/[100%] font-medium text-[#9B9B9B]">
          16 - Nov - 2024
        </p>
      </div>
      <p className="text-xs/[100%] font-medium">Bank Transfer</p>
      <p className="text-sm/[100%] font-medium">$120</p>
    </div>
  );
};

const FinanceStatsSkeleton = () => (
  <div
    className={
      'flex animate-pulse items-center gap-7 rounded-lg pt-[1.625rem] pb-9 shadow-[0px_2.03px_2.03px_0px_#0000000A]'
    }
    role="status"
    aria-label="loading finance stats"
  >
    <div className="flex basis-full flex-col gap-0.5">
      <div className="h-12 w-40 rounded bg-[#E6EFE6]" />
      <div className="mt-2 h-3 w-28 rounded bg-[#E6EFE6]" />
    </div>

    <div className="flex basis-full flex-col gap-0.5 border-x border-[#9B9B9B] py-6 pr-8 pl-14">
      <div className="h-12 w-40 rounded bg-[#E6EFE6]" />
      <div className="mt-2 h-3 w-28 rounded bg-[#E6EFE6]" />
    </div>

    <div className="flex basis-full flex-col gap-0.5">
      <div className="h-12 w-40 rounded bg-[#E6EFE6]" />
      <div className="mt-2 h-3 w-28 rounded bg-[#E6EFE6]" />
    </div>
  </div>
);

const FinanceStatsError = ({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) => {
  return (
    <div
      role="alert"
      aria-label="finance stats error"
      className={
        'flex items-center gap-7 rounded-lg bg-[#FFF5F5] pt-[1.625rem] pb-9 shadow-[0px_2.03px_2.03px_0px_#0000000A]'
      }
    >
      <div className="flex basis-full flex-col gap-0.5">
        <p className="text-5xl/[100%] font-bold text-[#D14343]">—</p>
        <p className="text-xs/[100%] font-semibold text-[#D14343]">
          Monthly Revenue
        </p>
      </div>

      <div className="flex basis-full flex-col gap-0.5 border-x border-[#9B9B9B] py-6 pr-8 pl-14">
        <p className="text-5xl/[100%] font-bold text-[#D14343]">—</p>
        <p className="text-xs/[100%] font-semibold text-[#D14343]">
          Yearly Revenue
        </p>
      </div>

      <div className="flex basis-full flex-col gap-0.5">
        <p className="text-5xl/[100%] font-bold text-[#D14343]">—</p>
        <p className="text-xs/[100%] font-semibold text-[#D14343]">
          Total Revenue
        </p>
      </div>

      <div className="ml-auto flex flex-col items-end gap-2">
        <p className="text-xs text-[#6B6B6B]">
          {message ?? 'Failed to load finance data.'}
        </p>
        <div className="flex gap-2">
          <button
            onClick={onRetry ?? (() => window.location.reload())}
            className="rounded bg-[#D14343] px-3 py-1 text-sm font-semibold text-white"
          >
            Retry
          </button>
          <button
            onClick={() => window.location.reload()}
            className="rounded border border-[#E6E6E6] bg-transparent px-3 py-1 font-semibold text-[#305B43]"
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  );
};
