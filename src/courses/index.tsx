import { SearchInput } from '@/components/ui/custom/input';
import DataTable from '../components/data-table';
import { CourseColumns, type CoursesType } from './columns';
import ExportDropdown from '@/components/ui/custom/dropdown-menu';
import { MoreVertical } from 'lucide-react';

const Courses = () => {
  const data: CoursesType[] = [];

  for (let i = 0; i < 10; i++) {
    data.push({
      instructorImage: 'https://i.pravatar.cc/150?img=1',
      courseTitle: 'Selling Anything',
      courseDuration: '1h 30m',
      instructorName: 'Michelle Elegbe',
      lessons: '10 Lessons',
      views: '1,000,000',
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <SearchInput />
      <div className="flex flex-col gap-3">
        <ExportDropdown className="self-end">
          <MoreVertical />
        </ExportDropdown>
        <div className="bg-[#A1A1A10F]">
          <DataTable data={data} columns={CourseColumns} />
        </div>
      </div>
    </div>
  );
};

export default Courses;
