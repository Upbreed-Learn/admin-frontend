import DataTable from '@/components/data-table';
import { SessionColumns } from './columns';

const OneOneSessions = () => {
  const data = [
    {
      instructorName: 'Michelle Elegbe',
      category: 'Business',
      date: '2023-05-01',
      notification: 'tope.adenola@yahoo.com',
    },
    {
      instructorName: 'Michelle Elegbe',
      category: 'Business',
      date: '2023-05-01',
      notification: 'tope.adenola@yahoo.com',
    },
    {
      instructorName: 'Michelle Elegbe',
      category: 'Finance',
      date: '2023-04-01',
      notification: 'tope.adenola@yahoo.com',
    },
  ];

  return (
    <div className="flex flex-col gap-16">
      <div className="w-max rounded-xl bg-[#305B43] px-6 py-5">
        <p className="text-[2.5rem]/[100%] font-bold text-white">400</p>
        <p className="text-[9.05px]/[100%] text-[#D0EA50]">
          Completed Sessions
        </p>
      </div>
      <div className="hide-scrollbar h-[29.5625rem] overflow-auto rounded-[9px] bg-[#A1A1A10F] px-14 py-8">
        <DataTable
          columns={SessionColumns}
          data={data}
          headerClassName="text-[#737373] font-semibold text-[10px]/[100%]"
          className="h-10 border-none bg-transparent text-[10px]/[100%] font-semibold text-black even:bg-transparent hover:bg-gray-200"
        />
      </div>
    </div>
  );
};

export default OneOneSessions;
