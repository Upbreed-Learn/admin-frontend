import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const EmptyState = ({
  onAdd,
  title = 'Add your first course to get started.',
  description = 'Add your first course to get started.',
  cta = 'Add New Course',
  className,
}: {
  onAdd: () => void;
  title?: string;
  description?: string;
  className?: string;
  cta?: string;
}) => {
  return (
    <div
      className={cn(
        'col-span-3 flex w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-[#D9D9D9] bg-white/30 p-8 text-center',
        className,
      )}
    >
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
      <p className="text-sm font-semibold text-[#305B43]">{title}</p>
      <p className="text-xs text-[#6B6B6B]">{description}</p>
      <Button onClick={onAdd} className="mt-2 cursor-pointer">
        <Plus />
        {cta}
      </Button>
    </div>
  );
};

export default EmptyState;
