import { Button } from '@/components/ui/button';
import FinanceTabs from './tabs';
import { useQueryState } from 'nuqs';
import { cn } from '@/lib/utils';
import TotalRevenueChart from '@/dashboard/total-revenue';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const Finance = () => {
  const [currency, setCurrency] = useQueryState('currency', {
    defaultValue: 'NGN',
  });
  return (
    <div className="flex flex-col gap-3">
      <FinanceTabs />
      <div className="flex flex-col gap-2 self-end">
        <Button
          disabled={currency === 'USD'}
          className={cn(
            'rounded-3xl',
            currency === 'USD' && 'hover:white bg-white',
          )}
          onClick={() => setCurrency('USD')}
        >
          Switch to USD
        </Button>
        <Button
          onClick={() => setCurrency('NGN')}
          disabled={currency === 'NGN'}
          className={cn(
            'rounded-3xl',
            currency === 'NGN' && 'hover:white bg-white',
          )}
        >
          Switch to NGN
        </Button>
      </div>
      <div className="flex items-center gap-7 rounded-lg pt-[4.625rem] pb-9 shadow-[0px_2.03px_2.03px_0px_#0000000A]">
        <div className="flex flex-col gap-0.5">
          <p className="text-[2.5rem]/[100%] font-bold">N100.8K</p>
          <p className="text-[9px]/[100%] font-semibold">Monthly Revenue</p>
        </div>
        <div className="flex flex-col gap-0.5 border-x border-[#9B9B9B] py-6 pr-8 pl-14">
          <p className="text-[2.5rem]/[100%] font-bold">$23.4M</p>
          <p className="text-[9px]/[100%] font-semibold">Yearly Revenue</p>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-[2.5rem]/[100%] font-bold">$1B</p>
          <p className="text-[9px]/[100%] font-semibold">Total Revenue</p>
        </div>
      </div>
      <div className="flex items-start gap-6">
        <TotalRevenueChart height={180} className="flex-2/3" />
        <TransactionHistory />
      </div>
    </div>
  );
};

export default Finance;

const TransactionHistory = () => {
  return (
    <div className="flex flex-1/3 flex-col gap-7 rounded bg-[#E3E3E333] p-3.5">
      <div className="flex items-center justify-between">
        <p className="text-[8px]/[100%] font-semibold">Transaction History</p>
        <div className={cn('relative w-full max-w-20')}>
          <Input
            type="search"
            placeholder="Search"
            className="h-3.5 rounded-[1.25rem] pl-4 text-[5px]/[100%] placeholder:text-[5px]/[100%]"
          />
          <Search
            className="absolute top-3.5 left-1.5 -translate-y-1/2"
            size={6}
          />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {Array(7)
          .fill(null)
          .map((_, i) => (
            <HistoryCard key={i} />
          ))}
      </div>
    </div>
  );
};

const HistoryCard = () => {
  return (
    <div className="flex justify-between border-b border-[#00000026] pb-0.5">
      <div>
        <p className="text-[9px]/[100%] font-medium">Chinedu Asake</p>
        <p className="text-[7.5px]/[100%] font-medium text-[#9B9B9B]">
          16 - Nov - 2024
        </p>
      </div>
      <p className="text-[8px]/[100%] font-medium">Bank Transfer</p>
      <p className="text-[9px]/[100%] font-medium">$120</p>
    </div>
  );
};
