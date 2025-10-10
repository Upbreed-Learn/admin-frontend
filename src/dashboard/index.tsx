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
import { cn } from '@/lib/utils';
import { ArrowLeftRight, MoreVertical } from 'lucide-react';
import { useQueryState } from 'nuqs';
import ExportDropdown from '@/components/ui/custom/dropdown-menu';

const Dashboard = () => {
  const [currency, setCurrency] = useQueryState('currency', {
    defaultValue: 'NGN',
  });

  return (
    <div className="flex flex-col gap-1.5 pb-6">
      <ExportDropdown className="self-end">
        <MoreVertical />
      </ExportDropdown>
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center gap-10">
          <SummaryCard title="Total Reports" value={'15K'}>
            <FileIcon />
          </SummaryCard>
          <SummaryCard title="Instructors" value={'10K'}>
            <UsersMore size={'10'} stroke="white" />
          </SummaryCard>
          <SummaryCard title="Subscribers" value={'10.7M'}>
            <PeopleAlt />
          </SummaryCard>
          <SummaryCard
            title="Total Revenue"
            value={'$1.5B'}
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
        </div>
        <div className="flex gap-5">
          <Subscriber />
          <SubscriberGrowth />
        </div>
        <div className="flex gap-5">
          <div className="flex basis-full flex-col gap-2">
            <TotalRevenueChart />
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
