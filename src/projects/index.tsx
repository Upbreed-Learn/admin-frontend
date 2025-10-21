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
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ProjectsType } from '@/lib/constants';
import PaginationSection from '@/components/ui/custom/pagination';
import { useGetCourses } from '@/queries/hooks';
import ErrorState from '@/components/error';
import EmptyState from '@/components/empty';
// import { useForm } from 'react-hook-form';
// import { https } from '@/lib/https';

// async function submitName(data: { name: string }) {
//   return await https.post('/category', data);
// }

// type FormData = {
//   name: string;
// };

const Projects = () => {
  const [page, setPage] = useState(1);
  const [_, setAddNewCourse] = useQueryState('addNewCourse');
  const [__, setFilter] = useQueryState('filter');
  const [sort, setSort] = useQueryState('sort', {
    defaultValue: 'desc',
  });
  const queryClient = useQueryClient();

  const { data, isPending, isError } = useGetCourses(page);

  const projectData: ProjectsType[] = data?.data?.data;

  // const { register, handleSubmit, reset } = useForm<FormData>();

  // const { mutate, isSuccess } = useMutation({
  //   mutationFn: (data: FormData) => submitName(data),
  //   onSuccess: () => {
  //     reset(); // clear input on success
  //   },
  // });

  // const onSubmit = (formData: FormData) => {
  //   mutate(formData);
  // };

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
        {isError ? (
          <ErrorState
            onRetry={() =>
              queryClient.invalidateQueries({ queryKey: ['courses'] })
            }
          />
        ) : (
          <div>
            <div className="grid grid-cols-3 gap-5">
              {isPending ? (
                Array(9)
                  .fill(null)
                  .map((_, i) => <ProjectCardSkeleton key={i} />)
              ) : projectData.length === 0 ? (
                <EmptyState onAdd={() => setAddNewCourse('true')} />
              ) : (
                projectData?.map((_, index) => <ProjectCard key={index} />)
              )}
            </div>
            {projectData && projectData.length > 0 && (
              <PaginationSection
                currentPage={page}
                setCurrentPage={setPage}
                totalPages={data?.data?.metadata.lastPage}
              />
            )}
          </div>
        )}
      </div>

      {/* <div className="mx-auto mt-10 max-w-sm">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 rounded-md border p-4"
        >
          <label className="text-sm font-medium">Enter your name</label>
          <input
            {...register('name', { required: true })}
            type="text"
            placeholder="John Doe"
            className="rounded border p-2"
          />

          <button
            type="submit"
            disabled={isPending}
            className="rounded bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Submitting...' : 'Submit'}
          </button>
        </form>

        {isSuccess && (
          <p className="mt-3 text-green-600">{(data as any)?.message}</p>
        )}
      </div> */}
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
