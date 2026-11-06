import { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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

const short = (n: number) => (n >= 1e9 ? `${+(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${+(n / 1e3).toFixed(1)}k` : `${n}`);

const RevenueChart = (props: { data: DataPoint[], height: number }) => {
  const { data, height=120 } = props;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        onMouseMove={(state: any) => {
          if (state.isTooltipActive) {
            setActiveIndex(state.activeTooltipIndex);
          }
        }}
        onMouseLeave={() => setActiveIndex(null)}
      >
        <CartesianGrid strokeDasharray="0" stroke="#E5E7EB" vertical={false} />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={<CustomAxisTick />}
          height={60}
        />
        {/* Naira and dollars are on their own scales, so neither line flattens the other. */}
        <YAxis
          yAxisId="usd"
          axisLine={false}
          tickLine={false}
          width={48}
          tick={{ fill: '#9CA3AF', fontSize: 10 }}
          tickFormatter={value => `$${short(value)}`}
          domain={[0, (max: number) => Math.max(10, Math.ceil(max * 1.15))]}
        />
        <YAxis
          yAxisId="naira"
          orientation="right"
          axisLine={false}
          tickLine={false}
          width={52}
          tick={{ fill: '#9CA3AF', fontSize: 10 }}
          tickFormatter={value => `₦${short(value)}`}
          domain={[0, (max: number) => Math.max(1000, Math.ceil(max * 1.15))]}
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
          yAxisId="usd"
          dataKey="usd"
          stroke="#00230F"
          strokeWidth={3}
          dot={<CustomDot dataKey="usd" />}
          activeDot={false}
        />
        <Line
          type="monotone"
          yAxisId="naira"
          dataKey="naira"
          stroke="#34A853"
          strokeWidth={3}
          dot={<CustomDot dataKey="naira" />}
          activeDot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;
