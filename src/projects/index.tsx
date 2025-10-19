import { Button } from '@/components/ui/button';
import AvatarCustom from '@/components/ui/custom/avatar';
import { ArrowDownAZ, ArrowUpAZ, Plus } from 'lucide-react';
import { Link } from 'react-router';
import { useQueryState } from 'nuqs';
import AddNewCourse from './add-new-course';
import { SearchInput } from '@/components/ui/custom/input';
import FilterIcon from '@/assets/jsx-icons/filter-icon';
import FilterDialog from './filter';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense, useState } from 'react';
import { QUERIES } from '@/queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import PaginationSection from '@/components/ui/custom/pagination';
import { ErrorBoundary } from 'react-error-boundary';
import type { ProjectsType } from '@/lib/constants';

const useGetCourses = (page?: number, limit?: number) => {
  return useSuspenseQuery({
    queryKey: ['courses', { page, limit }],
    queryFn: () => QUERIES.getCourses(page, limit),
  });
};

const Projects = () => {
  const [page, setPage] = useState(1);
  const [_, setAddNewCourse] = useQueryState('addNewCourse');
  const [__, setFilter] = useQueryState('filter');
  const [sort, setSort] = useQueryState('sort', {
    defaultValue: 'desc',
  });

  const { data } = useGetCourses(page);

  const projectData: ProjectsType[] = data?.data?.data;

  return (
    <>
      <FilterDialog />
      <AddNewCourse />
      <div className="flex flex-col gap-9 rounded-lg bg-[#A1A1A10F] px-7 py-5">
        <div className="flex flex-col gap-3.5">
          <SearchInput className="self-end" />
          <div className="flex items-center justify-between">
            <Button
              onClick={() => setAddNewCourse('true')}
              className="cursor-pointer"
            >
              <Plus />
              Add New Course
            </Button>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setSort(value => (value === 'desc' ? 'asc' : 'desc'))
                }
                className="rounded-lg bg-gray-300 p-2 transition-transform active:scale-95"
              >
                {sort === 'desc' ? (
                  <ArrowUpAZ className="text-[#305B43]" size={16} />
                ) : (
                  <ArrowDownAZ className="text-[#305B43]" size={16} />
                )}
                <span className="sr-only">Sort</span>
              </button>
              <Button
                onClick={() => setFilter('true')}
                className="bg-[#00230F] text-white hover:bg-[#00230F]/80"
              >
                <FilterIcon />
                Filter
              </Button>
            </div>
          </div>
        </div>
        <ErrorBoundary FallbackComponent={ProjectsErrorState}>
          <Suspense
            fallback={
              <div className="grid grid-cols-3 gap-5">
                {Array(9)
                  .fill(null)
                  .map((_, i) => (
                    <ProjectCardSkeleton key={i} />
                  ))}
              </div>
            }
          >
            {projectData.length === 0 ? (
              <ProjectsEmptyState onAdd={() => setAddNewCourse('true')} />
            ) : (
              <div className="grid grid-cols-3 gap-5">
                {projectData?.map((_, index) => (
                  <ProjectCard key={index} />
                ))}
              </div>
            )}
            {projectData && projectData.length > 0 && (
              <PaginationSection
                currentPage={page}
                setCurrentPage={setPage}
                totalPages={data.data.metadata.lastPage}
              />
            )}
          </Suspense>
        </ErrorBoundary>
      </div>
    </>
  );
};

export default Projects;

const ProjectCard = () => {
  return (
    <div className="relative rounded-lg bg-[#305B43] px-5 py-6 transition-colors hover:bg-[#00230F]">
      <div className="flex items-center justify-end gap-2.5">
        <div className="flex basis-full flex-col gap-1.5 text-end">
          <Link
            to={'/projects/1'}
            className="border-b border-[#FFFFFF4D] pb-1.5"
          >
            <span className="absolute inset-0"></span>
            <p className="text-xs font-extrabold text-white">
              Selling Anything
            </p>
          </Link>
          <div className="flex flex-col gap-1">
            <p className="text-[7.18px] text-white">1H:30:00</p>
            <p className="text-[7.18px] font-semibold text-white">10 Lessons</p>
          </div>
        </div>
        <AvatarCustom
          src={'https://i.pravatar.cc/150?img=1'}
          alt={'Avatar'}
          fallback={'U'}
          className="size-14"
        />
      </div>
      <p className="w-max rounded-md bg-[#D0EA50] px-2 py-0.5 text-[6px] font-semibold">
        MUSIC
      </p>
    </div>
  );
};

export const ProjectCardSkeleton = () => (
  <div className="relative animate-pulse rounded-lg bg-[#E6EFE6] px-5 py-6">
    <div className="flex items-center justify-end gap-2.5">
      <div className="flex basis-full flex-col gap-2 text-end">
        <Skeleton className="ml-auto h-4 w-32 rounded bg-[#DBDBDB]" />
        <div className="flex flex-col items-end gap-1">
          <Skeleton className="h-3 w-16 rounded bg-[#E0E0E0]" />
          <Skeleton className="h-3 w-20 rounded bg-[#E0E0E0]" />
        </div>
      </div>
      <Skeleton className="h-10 w-10 rounded-full bg-[#DADADA]" />
    </div>
    <Skeleton className="mt-3 h-4 w-12 rounded bg-[#DBDBDB]" />
  </div>
);

export const ProjectsEmptyState = ({ onAdd }: { onAdd?: () => void }) => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-[#D9D9D9] bg-white/30 p-8 text-center">
      <svg
        className="h-10 w-10 text-[#9B9B9B]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M3 7v13a1 1 0 001 1h16a1 1 0 001-1V7M3 7l9-4 9 4M12 3v4"
        />
      </svg>
      <p className="text-sm font-semibold text-[#305B43]">No projects yet</p>
      <p className="text-xs text-[#6B6B6B]">
        Add your first course to get started.
      </p>
      <Button onClick={onAdd} className="mt-2">
        <Plus />
        Add New Course
      </Button>
    </div>
  );
};

export const ProjectsErrorState = ({ error }: { error: Error }) => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 rounded-lg bg-[#FFF5F5] p-6">
      <svg
        className="h-10 w-10 text-[#D14343]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
        />
      </svg>
      <p className="text-sm font-semibold text-[#D14343]">
        Something went wrong
      </p>
      <p className="text-xs text-[#6B6B6B]">
        {error.message ?? 'Unable to load projects. Please try again.'}
      </p>
      <div className="flex gap-2">
        <Button asChild>
          <Link to={'/'}>Go Home</Link>
        </Button>
      </div>
    </div>
  );
};
