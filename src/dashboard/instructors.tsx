import AvatarCustom from '@/components/ui/custom/avatar';
import ExportDropdown from '@/components/ui/custom/dropdown-menu';
import type { CourseDetailsType } from '@/lib/constants';
import { useGetCourses } from '@/queries/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { EyeIcon, MoreVertical } from 'lucide-react';
import { Link } from 'react-router';

const Instructors = () => {
  const { data, isPending, isError } = useGetCourses(1, 7);
  const queryClient = useQueryClient();

  const coursesData: CourseDetailsType[] = data?.data?.data;

  return (
    <div className="hide-scrollbar relative flex h-[14.09rem] basis-full flex-col gap-8 overflow-auto rounded-[10px] px-4 pt-8 pb-7 shadow-[0px_2px_4px_0px_#0000001A]">
      <ExportDropdown className="absolute top-2 right-2 self-end">
        <MoreVertical size={16} />
      </ExportDropdown>
      {isError ? (
        <InstructorListError
          onRetry={() =>
            queryClient.invalidateQueries({ queryKey: ['courses'] })
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {isPending
            ? Array(12)
                .fill(null)
                .map((_, i) => <InstructorSkeleton key={i} />)
            : coursesData.map(instructor => (
                <InstructorCard instructor={instructor} key={instructor.id} />
              ))}
        </div>
      )}
      <Link
        to={'/courses'}
        className="text-center text-[8px]/[100%] font-semibold text-[#949494] underline"
      >
        Read more...
      </Link>
    </div>
  );
};

export default Instructors;

const InstructorCard = (props: { instructor: CourseDetailsType }) => {
  const { instructor } = props;
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AvatarCustom
          src={instructor.thumbnail}
          alt={'Avatar'}
          fallback={instructor.instructor.fname[0].toUpperCase()}
          className="size-5"
        />
        <div className="flex items-center gap-4 border-b border-[#A1A1A11F] pb-[10px] text-[10px]/[100%] font-semibold text-[#474747]">
          <p className="text-center">
            {instructor.instructor.fname} {instructor.instructor.lname}
          </p>
          <p>{instructor.title}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <EyeIcon size={16} />
        <p className="text-[10px]/[100%] font-semibold text-[#474747]">
          10,456
        </p>
      </div>
    </div>
  );
};

const InstructorSkeleton = () => (
  <div className="flex animate-pulse items-center justify-between px-1 py-3">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-[#E6EFE6]" />
      <div className="flex items-center gap-4 border-b border-[#A1A1A11F] pb-[10px]">
        <div className="h-4 w-28 rounded bg-[#E6EFE6]" />
        <div className="h-3 w-20 rounded bg-[#E6EFE6]" />
      </div>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="h-4 w-4 rounded-full bg-[#E6EFE6]" />
      <div className="h-4 w-12 rounded bg-[#E6EFE6]" />
    </div>
  </div>
);

const InstructorListError = ({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) => {
  return (
    <div
      role="alert"
      className="flex h-[14.09rem] w-full flex-col items-center justify-center gap-4 rounded-[10px] bg-[#FFF5F5] px-4 pt-8 pb-7 shadow-[0px_2px_4px_0px_#0000001A]"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFEAEA]">
          <svg
            className="h-5 w-5 text-[#D14343]"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M12 9v4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 17h.01"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#D14343]">
            Unable to load instructors
          </p>
          <p className="text-xs text-[#6B6B6B]">
            {message ?? 'Failed to fetch instructor list.'}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onRetry}
          className="rounded bg-[#D14343] px-3 py-2 text-sm font-semibold text-white"
        >
          Retry
        </button>
        <button
          onClick={() => window.location.reload()}
          className="rounded border border-[#E6E6E6] bg-transparent px-3 py-2 font-semibold text-[#305B43]"
        >
          Reload
        </button>
      </div>
    </div>
  );
};
