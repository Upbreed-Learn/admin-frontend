import { Button } from '@/components/ui/button';
import FinanceTabs from './tabs';
import { useQueryState } from 'nuqs';
import { ArrowLeftRight } from 'lucide-react';
import MoreTransactionHistoryModal from './more-transaction-history-modal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERIES } from '@/queries';
import type { FinanceDataType, TransactionHistoryType } from '@/lib/constants';
import { formatNumber, formatToYearMonth, formatTrxnDate } from '@/lib/utils';
import TotalRevenueChart from '@/dashboard/total-revenue';
import { TotalRevenueError, TotalRevenueSkeleton } from '@/dashboard';

const useGetFinanceData = (period?: '24h' | '7d' | '30d' | '12m') => {
  return useQuery({
    queryKey: ['financeData', { period }],
    queryFn: () => QUERIES.getFinanceData(period),
  });
};

const useGetTransactionHistory = () => {
  return useQuery({
    queryKey: ['transactionHistory'],
    queryFn: () => QUERIES.getTransactionHistory(),
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
  const { data, isPending, isError } = useGetTransactionHistory();

  const transactionHistory: TransactionHistoryType[] = data?.data;

  return (
    <>
      <MoreTransactionHistoryModal history={transactionHistory} />
      <div className="flex flex-1/3 flex-col gap-7 rounded bg-[#E3E3E333] p-3.5">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Transaction History</p>
        </div>
        <div className="flex flex-col gap-3">
          {isError ? (
            <HistoryListError />
          ) : isPending ? (
            Array(7)
              .fill(null)
              .map((_, i) => <HistoryCardSkeleton key={i} />)
          ) : (
            transactionHistory
              .slice(0, 7)
              .map(history => <HistoryCard key={history.id} {...history} />)
          )}
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

const HistoryCard = (props: TransactionHistoryType) => {
  const [currency, _] = useQueryState('currency', {
    defaultValue: 'NGN',
  });

  return (
    <div className="flex justify-between border-b border-[#00000026] pb-0.5">
      <div>
        <p className="text-sm/[100%] font-medium">Chinedu Asake</p>
        <p className="text-xs/[100%] font-medium text-[#9B9B9B]">
          {formatTrxnDate(props.createdAt)}
        </p>
      </div>
      <p className="text-xs/[100%] font-medium">{props.provider}</p>
      <p className="text-sm/[100%] font-medium">
        {currency === 'NGN' ? `₦${props.amountNaira}` : `$${props.amountUsd}`}
      </p>
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

const HistoryCardSkeleton = () => (
  <div
    className="flex animate-pulse justify-between border-b border-[#00000026] pb-0.5"
    role="status"
    aria-label="loading transaction"
  >
    <div>
      <div className="h-3 w-28 rounded bg-[#E6EFE6]" />
      <div className="mt-1 h-3 w-20 rounded bg-[#E6EFE6]" />
    </div>
    <div className="h-3 w-24 rounded bg-[#E6EFE6]" />
    <div className="h-3 w-12 rounded bg-[#E6EFE6]" />
  </div>
);

const HistoryListError = ({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) => (
  <div
    className="flex flex-col gap-3 rounded bg-[#FFF5F5] px-3 py-4 text-sm"
    role="alert"
    aria-label="transaction history error"
  >
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFEAEA]">
        <svg
          className="h-4 w-4 text-[#D14343]"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <path
            d="M12 9v4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 17h.01"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-[#D14343]">
          Unable to load transactions
        </p>
        <p className="text-xs text-[#6B6B6B]">
          {message ??
            'Something went wrong while fetching transaction history.'}
        </p>
      </div>
    </div>

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
);
