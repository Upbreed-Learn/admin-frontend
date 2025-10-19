import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import AvatarCustom from '@/components/ui/custom/avatar';
import { SearchInput } from '@/components/ui/custom/input';
import { Plus } from 'lucide-react';
import { useQueryState } from 'nuqs';
import AddNewInstructor from './add-new-instructor';
import { useQuery } from '@tanstack/react-query';
import { QUERIES } from '@/queries';
import type { InstructorType } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorState from '@/components/error';
import PaginationSection from '@/components/ui/custom/pagination';
import { useState } from 'react';
import EmptyState from '@/components/empty';

const useGetInstructors = (page?: number, limit?: number) => {
  return useQuery({
    queryKey: ['instructors', { page, limit }],
    queryFn: () => QUERIES.getInstructors(page, limit),
  });
};

const Instructors = () => {
  const [page, setPage] = useState(1);
  const [_, setAddInstructor] = useQueryState('addInstructor');

  const { data, isPending, isError } = useGetInstructors();

  const instructorsData: InstructorType[] = data?.data?.data;

  return (
    <>
      <AddNewInstructor />
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setAddInstructor('true')}
            className="cursor-pointer bg-transparent text-xs/[100%] font-bold text-[#9C9C9C] hover:bg-transparent"
          >
            <Plus />
            <span className="uppercase underline">Add New Instructor</span>
          </Button>
          <SearchInput />
        </div>
        {isError ? (
          <ErrorState />
        ) : (
          <Accordion
            type="single"
            collapsible
            className="flex h-full max-h-[33rem] flex-col gap-2 overflow-auto rounded-[10px] bg-[#00230F] px-11 py-6 text-white"
          >
            {isPending ? (
              Array(8)
                .fill(null)
                .map((_, i) => <InstructorTriggerSkeleton key={i} />)
            ) : instructorsData.length === 0 ? (
              <EmptyState
                className="bg-white"
                title="No Instructor Found"
                description="Click the button to add an instructor"
                cta="Add Instructor"
                onAdd={() => setAddInstructor('true')}
              />
            ) : (
              instructorsData.map((_, i) => (
                <div className="flex gap-7" key={i}>
                  <InstructorCard id={i} />
                  <AvatarCustom
                    alt="avatar"
                    src={'https://i.pravatar.cc/150?img=1'}
                    fallback={'U'}
                    className="size-14"
                  />
                </div>
              ))
            )}
          </Accordion>
        )}
        {instructorsData && instructorsData.length > 0 && (
          <PaginationSection
            currentPage={page}
            setCurrentPage={setPage}
            totalPages={data?.data?.metadata.lastPage}
          />
        )}
        <Button className="self-end">Export Data</Button>
      </div>
    </>
  );
};

export default Instructors;

const InstructorCard = (props: { id: number }) => {
  const { id } = props;
  return (
    <AccordionItem
      value={`item-${id}`}
      className="basis-full border-b-[0.85px] border-[#FFFFFF4D]"
    >
      <AccordionTrigger className="hover:no-underline [&>svg]:text-white">
        <span className="flex items-center gap-[10px]">
          <span className="text-xs/4 font-extrabold">Michelle Elegbe</span>
          <span className="text-[8.54px]/4 font-medium">
            michelleelegbe@gmail.com
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="text-[9.49px]/[100%] font-medium">
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard dummy text ever
        since the 1500s, when an unknown printer took a galley of type and
        scrambled it to make a type specimen book. It has survived not only five
        centuries, but also the leap into electronic typesetting, remaining
        essentially unchanged. It was popularised in the 1960s with the release
        of Letraset sheets containing Lorem Ipsum passages, and more recently
        with desktop publishing software like Aldus PageMaker including versions
        of Lorem Ipsum.
      </AccordionContent>
    </AccordionItem>
  );
};

export const InstructorTriggerSkeleton = () => {
  return (
    <div
      role="status"
      aria-label="loading instructor"
      className="flex animate-pulse items-center justify-end gap-2.5 px-3 py-4"
    >
      <div className="flex basis-full flex-col gap-2 text-end">
        {/* Title bar */}
        <Skeleton className="ml-auto h-4 w-36 rounded-lg bg-[#DFF6E6]" />
        {/* subtitle lines */}
        <div className="mt-2 flex flex-col items-end gap-1">
          <Skeleton className="h-3 w-20 rounded bg-[#E8F8EA]" />
          <Skeleton className="h-3 w-16 rounded bg-[#E8F8EA]" />
        </div>
      </div>
      {/* avatar placeholder */}
      <Skeleton className="size-14 rounded-full bg-[#E6FAE8] ring-1 ring-white/20" />
    </div>
  );
};
