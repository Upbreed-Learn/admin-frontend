import { SearchInput } from '@/components/ui/custom/input';
import DataTable from '../components/data-table';
import {
  CourseColumns,
  CourseColumnsSkeleton,
  type CoursesType,
} from './columns';
import ExportDropdown from '@/components/ui/custom/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { useGetCourses } from '@/queries/hooks';
import ErrorState from '@/components/error';
import { useQueryClient } from '@tanstack/react-query';
import PaginationSection from '@/components/ui/custom/pagination';

const Courses = () => {
  const dataSkeleton: CoursesType[] = [];

  const [page, setPage] = useState(1);

  const { data, isPending, isError } = useGetCourses(page);

  const queryClient = useQueryClient();

  const coursesData: CoursesType[] = data?.data?.data;

  for (let i = 0; i < 10; i++) {
    dataSkeleton.push({
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
          {isError ? (
            <ErrorState
              onRetry={() =>
                queryClient.invalidateQueries({ queryKey: ['courses'] })
              }
            />
          ) : isPending ? (
            <DataTable data={dataSkeleton} columns={CourseColumnsSkeleton} />
          ) : (
            <DataTable data={coursesData} columns={CourseColumns} />
          )}
        </div>
        {coursesData && coursesData.length > 0 && (
          <PaginationSection
            currentPage={page}
            setCurrentPage={setPage}
            totalPages={data?.data?.metadata.lastPage}
          />
        )}
      </div>
    </div>
  );
};

export default Courses;
