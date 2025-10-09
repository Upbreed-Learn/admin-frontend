import ExportIcon from '@/assets/jsx-icons/export-icon';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/custom/input';
import DataTable from './data-table';
import { CourseColumns, type CoursesType } from './columns';

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
        <Button className="cursor-pointer self-end border-[0.5px] border-[#6F6F6F] bg-white text-[8px]/3 font-bold text-[#6F6F6F] hover:bg-white">
          <ExportIcon />
          Save Report
        </Button>
        <div className="bg-[#A1A1A10F]">
          <DataTable data={data} columns={CourseColumns} />
        </div>
      </div>
    </div>
  );
};

export default Courses;
