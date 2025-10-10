import AvatarCustom from '@/components/ui/custom/avatar';
import ExportDropdown from '@/components/ui/custom/dropdown-menu';
import { EyeIcon, MoreVertical } from 'lucide-react';
import { Link } from 'react-router';

const Instructors = () => {
  return (
    <div className="hide-scrollbar relative flex h-[14.09rem] basis-full flex-col gap-8 overflow-auto rounded-[10px] px-4 pt-8 pb-7 shadow-[0px_2px_4px_0px_#0000001A]">
      <ExportDropdown className="absolute top-2 right-2 self-end">
        <MoreVertical size={16} />
      </ExportDropdown>
      <div className="flex flex-col gap-2">
        {Array(12)
          .fill(null)
          .map((_, i) => (
            <InstructorCard key={i} />
          ))}
      </div>
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

const InstructorCard = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AvatarCustom
          src={'https://i.pravatar.cc/150?img=1'}
          alt={'Avatar'}
          fallback={'U'}
          className="size-5"
        />
        <div className="flex items-center gap-4 border-b border-[#A1A1A11F] pb-[10px] text-[10px]/[100%] font-semibold text-[#474747]">
          <p className="text-center">Tony Elemelu</p>
          <p>Understand Your Brand and Identity Theft Console</p>
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
