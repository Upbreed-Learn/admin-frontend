import { Button } from '@/components/ui/button';
import AvatarCustom from '@/components/ui/custom/avatar';
import SelectInput from '@/components/ui/custom/select';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Plus, Search } from 'lucide-react';
import { Link } from 'react-router';
import { useQueryState } from 'nuqs';
import AddNewCourse from './add-new-course';

const Projects = () => {
  const [_, setAddNewCourse] = useQueryState('addNewCourse');

  return (
    <>
      <AddNewCourse />
      <div className="flex flex-col gap-9 rounded-lg bg-[#A1A1A10F] px-7 py-5">
        <div className="flex flex-col gap-3.5">
          <div className="relative w-full max-w-[27.875rem] self-end">
            <Input type="search" placeholder="Search" className="pl-9" />
            <Search
              className="absolute top-1/2 left-3 -translate-y-1/2"
              size={16}
            />
          </div>
          <div className="flex items-center justify-between">
            <Button
              onClick={() => setAddNewCourse('true')}
              className="cursor-pointer"
            >
              <Plus />
              Add New Course
            </Button>
            <div className="flex items-center gap-3">
              <ArrowUpDown className="text-[#305B43]" size={16} />
              <SelectInput
                placeholder="Filter"
                className="w-24 bg-[#00230F] data-[placeholder]:text-white"
                isFilter
                options={[
                  {
                    value: 'All',
                    label: 'All',
                  },
                  {
                    value: 'Courses',
                    label: 'Courses',
                  },
                  {
                    value: 'Projects',
                    label: 'Projects',
                  },
                ]}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-5">
          {Array(9)
            .fill(null)
            .map((_, i) => (
              <ProjectCard key={i} />
            ))}
        </div>
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
