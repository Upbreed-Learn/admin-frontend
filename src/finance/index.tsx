import { Button } from '@/components/ui/button';
import FinanceTabs from './tabs';
import { useQueryState } from 'nuqs';
import TotalRevenueChart from '@/dashboard/total-revenue';
import { ArrowLeftRight } from 'lucide-react';
import MoreTransactionHistoryModal from './more-transaction-history-modal';

const Finance = () => {
  const [currency, setCurrency] = useQueryState('currency', {
    defaultValue: 'NGN',
  });

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
      <div className="flex items-center gap-7 rounded-lg pt-[1.625rem] pb-9 shadow-[0px_2.03px_2.03px_0px_#0000000A]">
        <div className="flex basis-full flex-col gap-0.5">
          <p className="text-5xl/[100%] font-bold">N100.8K</p>
          <p className="text-xs/[100%] font-semibold">Monthly Revenue</p>
        </div>
        <div className="flex basis-full flex-col gap-0.5 border-x border-[#9B9B9B] py-6 pr-8 pl-14">
          <p className="text-5xl/[100%] font-bold">$23.4M</p>
          <p className="text-xs/[100%] font-semibold">Yearly Revenue</p>
        </div>
        <div className="flex basis-full flex-col gap-0.5">
          <p className="text-5xl/[100%] font-bold">$1B</p>
          <p className="text-xs/[100%] font-semibold">Total Revenue</p>
        </div>
      </div>
      <div className="flex items-start gap-6">
        {/* <TotalRevenueChart height={180} className="flex-2/3" /> */}
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
