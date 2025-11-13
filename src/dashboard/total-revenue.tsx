import RevenueChart from '@/components/charts/revenue';
import { cn } from '@/lib/utils';

type DataPoint = { month: string; year: number; usd: number; naira: number };
type MonthData = { month: string; usd: number; naira: number }; // e.g. "2025-09"

export default function TotalRevenueChart(props: {
  height?: number;
  className?: string;
  revenueData?: MonthData[];
}) {
  const { height = 120, className, revenueData } = props;
  const data = generateCurrencyDataPoints(revenueData!!);

  return (
    <div
      className={cn(
        'w-full rounded-[5.5px] bg-white p-8 shadow-[0px_1.57px_1.57px_0px_#0000000A]',
        className,
      )}
    >
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-sm/[100%] font-bold text-[#464255]">
          Total Revenue
        </h2>
        <div className="flex gap-1.5">
          <div className="flex items-center gap-1">
            <div className="h-[7px] w-[7px] rounded-full bg-[#00230F]"></div>
            <span className="text-xs text-gray-500">USD</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-[7px] w-[7px] rounded-full bg-[#34A853]"></div>
            <span className="text-xs text-gray-500">NAIRA</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <RevenueChart data={data} height={height} />
    </div>
  );
}

function generateCurrencyDataPoints(data: MonthData[]): DataPoint[] {
  if (!data.length) return [];

  // Sort data ascending by month
  const sorted = [...data].sort((a, b) => a.month.localeCompare(b.month));

  // Determine the latest month in the dataset
  const latestKey = sorted[sorted.length - 1].month; // e.g. "2025-11"
  const latestDate = new Date(latestKey + '-01');

  // Generate the last 6 months (oldest → newest)
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(latestDate);
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push(key);
  }

  // Create a lookup map for easy access
  const map = new Map<string, { usd: number; naira: number }>();
  for (const { month, usd, naira } of data) {
    map.set(month, { usd, naira });
  }

  // Convert to DataPoint with month + year
  return months.map(key => {
    const d = new Date(key + '-01');
    const monthName = d.toLocaleString('default', { month: 'long' });
    const year = d.getFullYear();
    const value = map.get(key) ?? { usd: 0, naira: 0 };

    return {
      month: monthName,
      year,
      usd: value.usd,
      naira: value.naira,
    };
  });
}
