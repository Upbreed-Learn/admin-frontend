import type { DashboardDataType } from '@/lib/constants';
import { useGetDashboardData } from '.';
import { formatNumber } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

const Subscriber = () => {
  const { data, isPending, isError } = useGetDashboardData();
  const queryClient = useQueryClient();

  const dashboardData: DashboardDataType = data?.data;

  if (isError)
    return (
      <SubscriberError
        onRetry={() =>
          queryClient.invalidateQueries({ queryKey: ['dashboardData'] })
        }
      />
    );
  if (isPending) return <SubscriberSkeleton />;

  return (
    <div className="flex basis-full flex-col gap-2.5 rounded-lg px-5 py-11 shadow-[0px_2.03px_2.03px_0px_#0000000A]">
      <div className="flex items-center gap-8">
        <SubscriberChart
          totalSubscribers={dashboardData.totalSubscribers}
          totalUsers={dashboardData.totalUsers}
        />
        <div className="flex flex-col gap-3">
          <div className="flex items-end gap-4">
            <p className="w-full max-w-[3.4375rem] text-right text-[9.14px]/[100%] font-semibold text-[#305B43]">
              Total Subscribers
            </p>
            <p className="text-[2rem]/[100%] font-bold text-[#00230F]">
              {formatNumber(dashboardData.totalSubscribers)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <p className="w-full max-w-[3.4375rem] text-right text-[9.14px]/[100%] font-semibold text-[#305B43]">
              Total Users
            </p>
            <p className="text-[2rem]/[100%] font-bold text-[#00230F]">
              {formatNumber(dashboardData.totalUsers)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscriber;

function SubscriberChart(props: {
  totalSubscribers: number;
  totalUsers: number;
}) {
  const { totalSubscribers, totalUsers } = props;
  const subscriberPercentage = (totalSubscribers / totalUsers) * 100;
  const nonSubscriberPercentage = 100 - subscriberPercentage;

  return (
    <div className="relative size-[7.125rem]">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90 transform">
        {/* Non-subscriber segment (light blue) */}
        <circle
          cx="100"
          cy="100"
          r="70"
          fill="none"
          stroke="#2D9CDB26"
          strokeWidth="40"
          strokeDasharray={`${nonSubscriberPercentage * 4.398} 439.8`}
        />

        {/* Subscriber segment (dark green) */}
        <circle
          cx="100"
          cy="100"
          r="70"
          fill="none"
          stroke="#305B43"
          strokeWidth="40"
          strokeDasharray={`${subscriberPercentage * 4.398} 439.8`}
          strokeDashoffset={`-${nonSubscriberPercentage * 4.398}`}
        />
      </svg>
    </div>
  );
}

const SubscriberSkeleton = () => {
  return (
    <div
      role="status"
      aria-label="loading subscriber"
      className="flex basis-full animate-pulse flex-col gap-2.5 rounded-lg bg-white/5 px-5 py-11 shadow-[0px_2.03px_2.03px_0px_#0000000A]"
    >
      <div className="flex items-center gap-8">
        {/* chart placeholder */}
        <div className="relative flex size-[7.125rem] items-center justify-center">
          <div className="h-[7.125rem] w-[7.125rem] rounded-full bg-[#E6EFE6]" />
        </div>

        <div className="flex w-full flex-col gap-3">
          <div className="flex items-end gap-4">
            <div className="w-full max-w-[3.4375rem] text-right">
              <div className="h-3 w-28 rounded bg-[#E6EFE6]" />
            </div>
            <div className="h-10 w-28 rounded bg-[#DFF6E6]" />
          </div>

          <div className="flex items-center gap-4">
            <div className="w-full max-w-[3.4375rem] text-right">
              <div className="h-3 w-28 rounded bg-[#E6EFE6]" />
            </div>
            <div className="h-10 w-28 rounded bg-[#DFF6E6]" />
          </div>
        </div>
      </div>
    </div>
  );
};

const SubscriberError = ({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) => {
  return (
    <div
      role="alert"
      className="flex basis-full flex-col gap-2.5 rounded-lg bg-[#FFF5F5] px-5 py-11 shadow-[0px_2.03px_2.03px_0px_#0000000A]"
    >
      <div className="flex items-center gap-8">
        <div className="relative flex size-[7.125rem] items-center justify-center">
          <div className="flex h-[7.125rem] w-[7.125rem] items-center justify-center rounded-full bg-[#FFEAEA]">
            <svg
              className="h-6 w-6 text-[#D14343]"
              viewBox="0 0 24 24"
              fill="none"
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
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeOpacity="0.12"
              />
            </svg>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3">
          <div className="flex items-end gap-4">
            <p className="w-full max-w-[3.4375rem] text-right text-[9.14px]/[100%] font-semibold text-[#D14343]">
              Total Subscribers
            </p>
            <p className="text-[2rem]/[100%] font-bold text-[#D14343]">—</p>
          </div>

          <div className="flex items-center gap-4">
            <p className="w-full max-w-[3.4375rem] text-right text-[9.14px]/[100%] font-semibold text-[#D14343]">
              Total Users
            </p>
            <p className="text-[2rem]/[100%] font-bold text-[#D14343]">—</p>
          </div>

          <p className="mt-3 text-sm text-[#6B6B6B]">
            {message ?? 'Failed to load subscriber data.'}
          </p>

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={onRetry}
              className="rounded bg-[#D14343] px-3 py-2 text-sm font-semibold text-white"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded border border-[#E6E6E6] bg-transparent px-3 py-2 font-semibold text-[#305B43]"
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
