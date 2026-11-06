import { SearchInput } from '@/components/ui/custom/input';
import DataTable from '../components/data-table';
import { CourseColumns, CourseColumnsSkeleton } from './columns';
import SaveReport from '@/components/save-report';
import { useEffect, useState, type ChangeEvent } from 'react';
import { useGetCourses, useGetSearchedCourses } from '@/queries/hooks';
import ErrorState from '@/components/error';
import { useQueryClient } from '@tanstack/react-query';
import PaginationSection from '@/components/ui/custom/pagination';
import type { CourseDetailsType } from '@/lib/constants';
import { useDebounce } from '@/lib/hooks/useDebounce';

const Courses = () => {
  const dataSkeleton: CourseDetailsType[] = [];
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [activeList, setActiveList] = useState<CourseDetailsType[]>([]);
  const debouncedSearch = useDebounce(search.trim(), 1000);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const { data, isPending, isError } = useGetCourses(page);
  const {
    data: searchedCoursesData,
    isPending: isSearching,
    isError: isSearchError,
  } = useGetSearchedCourses(page, 20, debouncedSearch);
  const searchedCourses: CourseDetailsType[] = searchedCoursesData?.data?.data;

  const queryClient = useQueryClient();

  const coursesData: CourseDetailsType[] = data?.data?.data;

  useEffect(() => {
    if (debouncedSearch.length > 0) {
      setActiveList(searchedCourses);
    } else {
      setActiveList(coursesData);
    }
  }, [debouncedSearch, searchedCourses, coursesData]);

  for (let i = 0; i < 10; i++) {
    dataSkeleton.push({
      thumbnail: 'https://i.pravatar.cc/150?img=1',
      title: 'Selling Anything',
      isHomepage: false,
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl eget ultrices ultricies, nunc nulla ultricies nisi, euismod ultrices nisl.',
      instructor: {
        fname: 'Michelle',
        lname: 'Elegbe',
      },
      categories: [
        {
          id: 1,
          name: 'Art & Culture',
        },
      ],
      preview: {
        lessonCount: 10,
        durationInMinutes: 60,
      },
      tags: [],
      videos: [],
      id: '1',
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <SearchInput value={search} onChange={e => handleChange(e)} />
      <div className="flex flex-col gap-3">
        <SaveReport
          className="self-end"
          filename="upbreed-courses"
          disabled={!activeList?.length}
          rows={() => [
            ['Title', 'Instructor', 'Duration (minutes)', 'Lessons', 'On homepage', 'Views'],
            ...(activeList ?? []).map(c => [
              c.title,
              `${c.instructor?.fname ?? ''} ${c.instructor?.lname ?? ''}`.trim(),
              c.preview?.durationInMinutes ?? 0,
              c.preview?.lessonCount ?? 0,
              c.isHomepage ? 'Yes' : 'No',
              (c as { views?: number }).views ?? 0,
            ]),
          ]}
        />
        <div className="bg-[#A1A1A10F]">
          {isError || (search !== '' && isSearchError) ? (
            <ErrorState
              onRetry={() =>
                queryClient.invalidateQueries({ queryKey: ['courses'] })
              }
            />
          ) : isPending || (search !== '' && isSearching) ? (
            <DataTable data={dataSkeleton} columns={CourseColumnsSkeleton} />
          ) : (
            <DataTable data={activeList} columns={CourseColumns} />
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
