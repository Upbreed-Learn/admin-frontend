import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2Icon } from 'lucide-react';
import { Link } from 'react-router';
import AddNewCourse, { items } from '../add-new-course';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useQueryState } from 'nuqs';

const UpdateProject = () => {
  const [_, setAddNewCourse] = useQueryState('addNewCourse');

  return (
    <>
      <AddNewCourse />
      <div className="flex flex-col gap-8 pb-8">
        <div className="flex flex-col gap-12">
          <Button asChild className="w-max">
            <Link to={'/projects'}>
              <ArrowLeft />
              Back
            </Link>
          </Button>
          <div className="flex flex-col gap-2 rounded-lg bg-[#A1A1A10F] px-7 py-12">
            <InstructorDetails />
            {Array(3)
              .fill(null)
              .map((_, i) => (
                <ProjectSections key={i} />
              ))}
            <button className="w-max text-[10px]/[100%] font-bold text-[#6F6F6F]">
              Add New
            </button>
          </div>
        </div>
        <div className="flex justify-between">
          <button className="text-[10px]/[100%] font-bold text-[#6F6F6F] underline">
            DELETE COURSE
          </button>
          <Button onClick={() => setAddNewCourse('true')}>Update</Button>
        </div>
      </div>
    </>
  );
};

export default UpdateProject;

const InstructorDetails = () => {
  return (
    <div className="flex gap-4 border-b border-[#0000001A] pb-3">
      <div className="flex flex-3/4 flex-col gap-4 [&>p]:rounded-[10px] [&>p]:bg-[#D9D9D980] [&>p]:px-7 [&>p]:py-3 [&>p]:text-xs/[100%] [&>p]:font-medium [&>p]:text-[#767676]">
        <p className="">BUSINESS DEVELOPMENT</p>
        <p>MICHELLE ELEGBE</p>
        <p className="h-[8.1875rem] overflow-auto !text-black">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum.
        </p>
        <div className="flex w-full max-w-[29.3125rem] flex-wrap gap-1.5">
          {items.map(item => (
            <p
              key={item.id}
              className={cn(
                'rounded bg-[#F1F1F1] px-1.5 py-1 text-[7px]/[100%] font-semibold text-[#9C9C9C] uppercase',
                item.label === 'Government' && 'bg-[#949494] text-white',
              )}
            >
              {item.label}
            </p>
          ))}
        </div>
      </div>
      <div className="h-[18.1875rem] flex-1/4 overflow-hidden rounded-[10px]">
        <img
          src="https://i.pravatar.cc/150?img=1"
          alt="Avatar"
          className="size-full object-cover"
        />
      </div>
    </div>
  );
};

const ProjectSections = () => {
  return (
    <div>
      <div className="flex w-full gap-5 border-b border-[#0000001A] pb-3">
        <div className="flex w-full gap-1.5">
          <span className="text-[10px]/[100%] font-medium text-[#9B9B9B]">
            1.
          </span>
          <div className="flex w-full flex-col gap-3 rounded bg-[#D9D9D980] px-4 pt-4 pb-3 text-xs/[100%] font-medium text-[#C8C8C8]">
            <p className="border-b border-[#0000001A] pb-3">Title</p>
            <p>Description</p>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="h-20 w-[10rem] overflow-hidden rounded">
            <img
              src="https://i.pravatar.cc/150?img=1"
              alt="Avatar"
              className="size-full object-cover"
            />
          </div>
          <div className="flex items-center gap-5">
            <button className="">
              <Trash2Icon className="text-[#9B9B9B]" />
            </button>
            <div className="flex flex-col items-center gap-[6px]">
              <Switch id="airplane-mode" />
              <Label
                htmlFor="airplane-mode"
                className="text-center text-xs/[100%] font-medium text-[#9B9B9B]"
              >
                Make video go public
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
