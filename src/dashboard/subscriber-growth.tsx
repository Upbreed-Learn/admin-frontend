import { useRef, useState } from 'react';
import { useGetDashboardData } from '.';
import { useQueryClient } from '@tanstack/react-query';

type MonthData = { month: string; count: number };

const SubscriberGrowth = () => {
  const { data, isPending, isError } = useGetDashboardData();
  const queryClient = useQueryClient();
  const subscriberGrowthData: MonthData[] = data?.data?.subscribersHistory;
  return (
    <div className="basis-full rounded-lg px-4 py-3 shadow-[0px_2.04px_2.04px_0px_#0000000A]">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs/[100%] font-bold text-[#464255]">Chart Order</p>
        <p className="text-[8.17px]/[100%] text-[#B9BBBD]">Subscribers</p>
      </div>
      {isError ? (
        <SubscriberGrowthError
          onRetry={() =>
            queryClient.invalidateQueries({ queryKey: ['dashboardData'] })
          }
        />
      ) : isPending ? (
        <SubscriberGrowthSkeleton />
      ) : (
        <SubscriberGrowthChart data={subscriberGrowthData} />
      )}
    </div>
  );
};

export default SubscriberGrowth;

type DataPoint = {
  month: string;
  year: number;
  value: number;
  x: number;
  y: number;
};

function SubscriberGrowthChart(props: { data: MonthData[] }) {
  const { data } = props;
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltipPosition, _] = useState({ x: 0, y: 0 });
  const dataPoints = generateDataPoints(data);

  const createSmoothPath = (): string => {
    let path = `M ${dataPoints[0].x} ${dataPoints[0].y}`;

    for (let i = 0; i < dataPoints.length - 1; i++) {
      const current = dataPoints[i];
      const next = dataPoints[i + 1];
      const controlX = (current.x + next.x) / 2;

      path += ` Q ${controlX} ${current.y}, ${next.x} ${next.y}`;
    }

    return path;
  };

  const createGradientPath = (): string => {
    const linePath = createSmoothPath();
    return `${linePath} L ${dataPoints[dataPoints.length - 1].x} 150 L ${dataPoints[0].x} 150 Z`;
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <div className="mx-auto w-full max-w-3xl p-4">
      <div className="w-full bg-white">
        <div className="relative">
          <svg
            ref={svgRef}
            viewBox="-20 0 520 180"
            className="h-auto w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient
                id="areaGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#7BA89A" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#7BA89A" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Gradient area under the curve */}
            <path d={createGradientPath()} fill="url(#areaGradient)" />

            {/* Main line */}
            <path
              d={createSmoothPath()}
              fill="none"
              stroke="#4A7C6B"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {dataPoints.map((point, index) => (
              <g key={index}>
                {hoveredPoint === index && (
                  <>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={8}
                      fill="#FFFFFF"
                      stroke="#4A7C6B"
                      strokeWidth="3"
                    />
                    <circle cx={point.x} cy={point.y} r="4" fill="#10B981" />
                  </>
                )}
                {/* Invisible hover area */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={15}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            ))}

            {/* Month labels */}
            {dataPoints.map((point, index) => (
              <text
                key={`label-${index}`}
                x={point.x}
                y="170"
                textAnchor="middle"
                className="fill-gray-600 text-xs select-none"
                style={{ fontSize: '12px', fontWeight: '500' }}
              >
                {point.month}
              </text>
            ))}
          </svg>

          {/* Hover tooltip */}
          {hoveredPoint !== null && (
            <div
              className="pointer-events-none absolute z-10"
              style={{
                left: `${tooltipPosition.x}px`,
                top: `${tooltipPosition.y}px`,
                transform: 'translate(16px, -50%)',
              }}
            >
              <div className="relative rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-lg">
                {/* Tooltip arrow */}
                <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2">
                  <div className="h-2 w-2 rotate-45 border-b border-l border-gray-100 bg-white"></div>
                </div>

                <div className="flex items-start gap-2">
                  <div>
                    <p className="text-sm font-bold whitespace-nowrap text-gray-800">
                      {formatNumber(dataPoints[hoveredPoint].value)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {`${dataPoints[hoveredPoint].month} ${dataPoints[hoveredPoint].year}`}
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-gray-700">
                    Subscribers
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function generateDataPoints(data: MonthData[]): DataPoint[] {
  if (!data.length) return [];

  // Sort ascending by month key (YYYY-MM)
  const sorted = [...data].sort((a, b) => a.month.localeCompare(b.month));

  // Determine the latest month in dataset
  const latestKey = sorted[sorted.length - 1].month; // e.g. "2025-11"
  const latestDate = new Date(latestKey + '-01');

  // Generate last 6 months (oldest → newest)
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(latestDate);
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push(key);
  }

  // Map data for quick lookup
  const map = new Map<string, number>();
  for (const { month, count } of data) map.set(month, count);

  // Create the formatted data points
  const dataPoints: DataPoint[] = months.map((key, i) => {
    const d = new Date(key + '-01');
    const monthName = d.toLocaleString('default', { month: 'long' });
    const year = d.getFullYear();
    const value = map.get(key) ?? 0;

    return {
      month: monthName,
      year,
      value,
      x: i * 70, // Example positioning
      y: 100 - value * 5, // Example scaling
    };
  });

  return dataPoints;
}

const SubscriberGrowthSkeleton = () => {
  return (
    <div
      className="mx-auto w-full max-w-3xl p-4"
      role="status"
      aria-label="loading subscriber growth"
    >
      <div className="w-full animate-pulse rounded-lg bg-white p-4 shadow-sm">
        <div className="relative">
          {/* Chart skeleton */}
          <div className="h-[180px] w-full rounded bg-[#E6EFE6]" />
          {/* X-axis labels skeleton */}
          <div className="mt-3 flex items-center justify-between gap-2">
            {Array(6)
              .fill(null)
              .map((_, i) => (
                <div key={i} className="h-3 w-12 rounded bg-[#E6EFE6]" />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SubscriberGrowthError = ({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) => {
  return (
    <div
      className="mx-auto w-full max-w-3xl p-4"
      role="alert"
      aria-label="subscriber growth error"
    >
      <div className="w-full rounded-lg bg-[#FFF5F5] p-4 shadow-sm">
        <div className="relative flex flex-col items-start gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFEAEA]">
              <svg
                className="h-5 w-5 text-[#D14343]"
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
              <p className="text-sm font-semibold text-[#D14343]">
                Unable to load chart
              </p>
              <p className="text-xs text-[#6B6B6B]">
                {message ?? 'Failed to load subscriber growth data.'}
              </p>
            </div>
          </div>

          <div className="w-full">
            <div className="h-[140px] w-full rounded bg-[#FFEAEA]" />
            <div className="mt-3 flex gap-2">
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
    </div>
  );
};
