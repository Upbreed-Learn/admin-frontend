import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import AvatarCustom from '@/components/ui/custom/avatar';
import { SearchInput } from '@/components/ui/custom/input';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useQueryState } from 'nuqs';
import { useQueries } from '@tanstack/react-query';
import { QUERIES } from '@/queries';
import type { InstructorType } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorState from '@/components/error';
import PaginationSection from '@/components/ui/custom/pagination';
import { useEffect, useState, type ChangeEvent } from 'react';
import EmptyState from '@/components/empty';
import InstructorSetupDialog from './instructor-setup-dialog';
import InstructorDeleteDialog from './delete-dialog';
import { useDebounce } from '@/lib/hooks/useDebounce';

const useGetInstructors = (page?: number, limit?: number, search?: string) => {
  return useQueries({
    queries: [
      {
        queryKey: ['instructors', { page, limit }],
        queryFn: () => QUERIES.getInstructors(page, limit),
      },
      {
        queryKey: ['instructors', { page, limit, search }],
        queryFn: () => QUERIES.getInstructors(page, limit, search),
        enabled: !!search,
      },
    ],
  });
};

const Instructors = () => {
  const [page, setPage] = useState(1);
  const [_, setAddInstructor] = useQueryState('instructorSetup');
  const [search, setSearch] = useState('');
  const [activeList, setActiveList] = useState<InstructorType[]>([]);
  const debouncedSearch = useDebounce(search.trim(), 1000);
  const [allInstructors, searchedInstructors] = useGetInstructors(
    page,
    20,
    debouncedSearch,
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const searchedInstructorsData: InstructorType[] =
    searchedInstructors?.data?.data?.data;
  const instructorsData: InstructorType[] = allInstructors?.data?.data?.data;

  // useEffect(() => {
  //   if (debouncedSearch === '') {
  //     setActiveList(instructorsData);
  //   }
  // }, [debouncedSearch, instructorsData]);

  useEffect(() => {
    if (debouncedSearch.length > 0) {
      setActiveList(searchedInstructorsData);
    } else {
      setActiveList(instructorsData);
    }
  }, [debouncedSearch, searchedInstructorsData, instructorsData]);

  return (
    <>
      <InstructorSetupDialog />
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setAddInstructor('true')}
            className="cursor-pointer bg-transparent text-xs/[100%] font-bold text-[#9C9C9C] hover:bg-transparent"
          >
            <Plus />
            <span className="uppercase underline">Add New Instructor</span>
          </Button>
          <SearchInput value={search} onChange={e => handleChange(e)} />
        </div>
        {allInstructors.isError || searchedInstructors.isError ? (
          <ErrorState />
        ) : (
          <Accordion
            type="single"
            collapsible
            className="flex h-full max-h-[33rem] flex-col gap-2 overflow-auto rounded-[10px] bg-[#00230F] px-11 py-6 text-white"
          >
            {allInstructors.isPending ? (
              Array(8)
                .fill(null)
                .map((_, i) => <InstructorTriggerSkeleton key={i} />)
            ) : activeList?.length === 0 ? (
              <EmptyState
                className="bg-white"
                title={
                  debouncedSearch.length > 0
                    ? `Instructor "${debouncedSearch}" not found! Kindly check your spelling and try again or...`
                    : 'No Instructor Found'
                }
                description="Click the button to add an instructor"
                cta="Add Instructor"
                onAdd={() => setAddInstructor('true')}
              />
            ) : (
              activeList?.map(instructor => (
                <div className="flex gap-7" key={instructor.id}>
                  <InstructorCard {...instructor} />
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
        {activeList?.length > 0 && (
          <PaginationSection
            currentPage={page}
            setCurrentPage={setPage}
            totalPages={allInstructors?.data?.data?.metadata.lastPage}
          />
        )}
        <Button className="cursor-pointer self-end">Export Data</Button>
      </div>
    </>
  );
};

export default Instructors;

const InstructorCard = (props: InstructorType) => {
  const { id, fname, lname, email, about } = props;
  const [_, setInstructor] = useQueryState('id');
  const [__, setAddInstructor] = useQueryState('instructorSetup');
  const [deleteInstructor, setDeleteInstructor] = useState(false);

  const handleEdit = () => {
    setInstructor(`${id}`);
    setAddInstructor('true');
  };

  const handledelete = () => {
    setInstructor(`${id}`);
    setDeleteInstructor(true);
  };

  return (
    <>
      <InstructorDeleteDialog
        setDelete={setDeleteInstructor}
        delete={deleteInstructor}
      />
      <AccordionItem
        value={`item-${id}`}
        className="basis-full border-b-[0.85px] border-[#FFFFFF4D]"
      >
        <AccordionTrigger className="group hover:no-underline [&>svg]:text-white">
          <div className="flex basis-full items-center justify-between">
            <span className="flex items-center gap-[10px]">
              <span className="text-sm/4 font-extrabold">{`${fname} ${lname}`}</span>
              <span className="text-xs/4 font-medium">{email}</span>
            </span>
            <span className="pointer-events-none flex gap-2 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
              <span
                role="button"
                aria-label="edit-button"
                onClick={handleEdit}
                className="cursor-pointer"
              >
                <Edit size={16} />
              </span>
              <span
                role="button"
                aria-label="delete-button"
                onClick={handledelete}
                className="cursor-pointer"
              >
                <Trash2 size={16} className="text-destructive" />
              </span>
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="text-xs/[100%] font-medium">
          {about}
        </AccordionContent>
      </AccordionItem>
    </>
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
        <Skeleton className="ml-auto h-4 w-full rounded-lg bg-[#DFF6E6]" />
        {/* subtitle lines */}
        <div className="mt-2 flex flex-col items-end gap-1">
          <Skeleton className="h-3 w-3/4 rounded bg-[#E8F8EA]" />
          <Skeleton className="h-3 w-3/4 rounded bg-[#E8F8EA]" />
        </div>
      </div>
      {/* avatar placeholder */}
      <Skeleton className="size-14 rounded-full bg-[#E6FAE8] ring-1 ring-white/20" />
    </div>
  );
};
