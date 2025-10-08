import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  month: string;
  usd: number;
  naira: number;
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: DataPoint;
  dataKey?: string;
  index?: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
  }>;
}

export default function TotalRevenueChart() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const data: DataPoint[] = [
    { month: 'Jan', usd: 25000, naira: 72000 },
    { month: 'Feb', usd: 35000, naira: 110000 },
    { month: 'Mar', usd: 32000, naira: 22000 },
    { month: 'Apr', usd: 28000, naira: 48000 },
    { month: 'May', usd: 38000, naira: 180000 },
    { month: 'Jun', usd: 430567, naira: 52000 },
    { month: 'Jul', usd: 42000, naira: 130000 },
    { month: 'Aug', usd: 35000, naira: 210000 },
    { month: 'Sept', usd: 48000, naira: 35000 },
    { month: 'Oct', usd: 52000, naira: 45657 },
    { month: 'Nov', usd: 50000, naira: 250000 },
    { month: 'Des', usd: 55000, naira: 270000 },
  ];

  const CustomDot = (props: CustomDotProps) => {
    const { cx, cy, index, dataKey } = props;
    const isHighlighted = activeIndex === index;

    if (!isHighlighted) return null;

    const color = dataKey === 'usd' ? '#2C5F4F' : '#4CAF50';

    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="white"
          stroke={color}
          strokeWidth={3}
        />
        <circle cx={cx} cy={cy} r={3} fill={color} />
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="flex flex-col gap-2">
        {payload.map((entry, index) => (
          <div
            key={index}
            className="rounded bg-[#C8E882] px-3 py-1 text-sm font-semibold whitespace-nowrap"
          >
            {entry.dataKey === 'usd'
              ? `$ ${entry.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : `N ${entry.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
        ))}
      </div>
    );
  };

  const CustomAxisTick = (props: any) => {
    const { x, y, payload, index } = props;
    const isHighlighted = activeIndex === index;

    return (
      <g>
        <circle
          cx={x}
          cy={y - 15}
          r={5}
          fill={isHighlighted ? '#4CAF50' : '#D1D5DB'}
        />
        <text
          x={x}
          y={y + 5}
          textAnchor="middle"
          className="fill-gray-400 text-xs"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full rounded-[5.5px] bg-white p-8 shadow-[0px_1.57px_1.57px_0px_#0000000A]">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-[9.44px]/[100%] font-bold text-[#464255]">
          Total Revenue
        </h2>
        <div className="flex gap-1.5">
          <div className="flex items-center gap-1">
            <div className="h-[7px] w-[7px] rounded-full bg-[#00230F]"></div>
            <span className="text-[5.5px] text-gray-500">USD</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-[7px] w-[7px] rounded-full bg-[#34A853]"></div>
            <span className="text-[5.5px] text-gray-500">NAIRA</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={120}>
        <LineChart
          data={data}
          onMouseMove={(state: any) => {
            if (state.isTooltipActive) {
              setActiveIndex(state.activeTooltipIndex);
            }
          }}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <CartesianGrid
            strokeDasharray="0"
            stroke="#E5E7EB"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={<CustomAxisTick />}
            height={60}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickFormatter={value => `$${value / 1000}k`}
            domain={[0, 500000]}
            ticks={[20000, 50000, 100000, 500000]}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: '#60A5FA',
              strokeWidth: 2,
              strokeDasharray: '4 4',
            }}
            position={{ y: 0 }}
            offset={15}
          />
          <Line
            type="monotone"
            dataKey="usd"
            stroke="#00230F"
            strokeWidth={3}
            dot={<CustomDot dataKey="usd" />}
            activeDot={false}
          />
          <Line
            type="monotone"
            dataKey="naira"
            stroke="#34A853"
            strokeWidth={3}
            dot={<CustomDot dataKey="naira" />}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
