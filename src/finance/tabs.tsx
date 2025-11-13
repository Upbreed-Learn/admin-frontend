import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQueryState } from 'nuqs';

const FinanceTabs = () => {
  const [duration, setDuration] = useQueryState('duration', {
    defaultValue: '12m',
  });


  return (
    <Tabs
      defaultValue="12m"
      onValueChange={value => setDuration(value)}
      value={duration}
      className="w-[400px]"
    >
      <TabsList>
        <TabsTrigger value="12m">12 Months</TabsTrigger>
        <TabsTrigger value="30d">30 Days</TabsTrigger>
        <TabsTrigger value="7d">7 Days</TabsTrigger>
        <TabsTrigger value="24h">24 Hours</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default FinanceTabs;
