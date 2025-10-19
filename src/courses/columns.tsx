import CourseIcon from '@/assets/jsx-icons/course-icon';
import DurationIcon from '@/assets/jsx-icons/duration-icon';
import InstructorIcon from '@/assets/jsx-icons/instructor-icon';
import LessonsIcon from '@/assets/jsx-icons/lessons-icon';
import ViewsIcon from '@/assets/jsx-icons/views-icon';
import AvatarCustom from '@/components/ui/custom/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import type { ColumnDef } from '@tanstack/react-table';

export interface CoursesType {
  instructorImage: string;
  courseTitle: string;
  courseDuration: string;
  instructorName: string;
  lessons: string;
  views: string;
}

export const CourseColumns: ColumnDef<CoursesType>[] = [
  {
    accessorKey: 'instructorImage',
    header: () => null,
    cell: ({ row }) => {
      return (
        <AvatarCustom
          src={row.original.instructorImage}
          alt="Instructor Image"
          fallback={row.original.instructorName.charAt(0).toUpperCase()}
          className="h-11 w-11"
        />
      );
    },
  },
  {
    accessorKey: 'courseTitle',
    header: () => (
      <div className="flex items-center gap-1">
        <CourseIcon />
        <span className="text-[10px] font-semibold text-[#737373]">Title</span>
      </div>
    ),
  },
  {
    accessorKey: 'instructorName',
    header: () => (
      <div className="flex items-center gap-1">
        <InstructorIcon />
        <span className="text-[10px] font-semibold text-[#737373]">
          Instructor
        </span>
      </div>
    ),
    cell: ({ row }) => {
      return (
        <p className="text-[10px] font-semibold text-[#D0EA50]">
          {row.original.instructorName}
        </p>
      );
    },
  },
  {
    accessorKey: 'courseDuration',
    header: () => (
      <div className="flex items-center gap-1">
        <DurationIcon />
        <span className="text-[10px] font-semibold text-[#737373]">
          Duration
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'lessons',
    header: () => (
      <div className="flex items-center gap-1">
        <LessonsIcon />
        <span className="text-[10px] font-semibold text-[#737373]">
          Lessons
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'views',
    header: () => (
      <div className="flex items-center gap-1">
        <ViewsIcon />
        <span className="text-[10px] font-semibold text-[#737373]">Views</span>
      </div>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2.5">
          <p>{row.original.views}</p>
          <ViewsIcon fill="white" fill2="#FFFFFF40" />
        </div>
      );
    },
  },
];

export const CourseColumnsSkeleton: ColumnDef<CoursesType>[] = [
  {
    accessorKey: 'instructorImage',
    header: () => null,
    cell: () => {
      return <Skeleton className="size-11 rounded bg-[#DBDBDB]" />;
    },
  },
  {
    accessorKey: 'courseTitle',
    header: () => (
      <div className="flex items-center gap-1">
        <CourseIcon />
        <span className="text-[10px] font-semibold text-[#737373]">Title</span>
      </div>
    ),
    cell: () => {
      return <Skeleton className="h-4 w-16 rounded bg-[#DBDBDB]" />;
    },
  },
  {
    accessorKey: 'instructorName',
    header: () => (
      <div className="flex items-center gap-1">
        <InstructorIcon />
        <span className="text-[10px] font-semibold text-[#737373]">
          Instructor
        </span>
      </div>
    ),
    cell: () => {
      return <Skeleton className="h-4 w-16 rounded bg-[#DBDBDB]" />;
    },
  },
  {
    accessorKey: 'courseDuration',
    header: () => (
      <div className="flex items-center gap-1">
        <DurationIcon />
        <span className="text-[10px] font-semibold text-[#737373]">
          Duration
        </span>
      </div>
    ),
    cell: () => {
      return <Skeleton className="h-4 w-16 rounded bg-[#DBDBDB]" />;
    },
  },
  {
    accessorKey: 'lessons',
    header: () => (
      <div className="flex items-center gap-1">
        <LessonsIcon />
        <span className="text-[10px] font-semibold text-[#737373]">
          Lessons
        </span>
      </div>
    ),
    cell: () => {
      return <Skeleton className="h-4 w-16 rounded bg-[#DBDBDB]" />;
    },
  },
  {
    accessorKey: 'views',
    header: () => (
      <div className="flex items-center gap-1">
        <ViewsIcon />
        <span className="text-[10px] font-semibold text-[#737373]">Views</span>
      </div>
    ),
    cell: () => {
      return <Skeleton className="h-4 w-16 rounded bg-[#DBDBDB]" />;
    },
  },
];
