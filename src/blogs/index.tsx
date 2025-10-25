import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/custom/input';
import PaginationSection from '@/components/ui/custom/pagination';
import SelectInput from '@/components/ui/custom/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { CategoryType } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useGetCategories } from '@/queries/hooks';
// import { QUERIES } from '@/queries';
// import { useQuery } from '@tanstack/react-query';
import {
  ArrowDownAZ,
  ArrowUpAZ,
  MessageSquare,
  Plus,
  Trash2,
} from 'lucide-react';
import { useQueryState } from 'nuqs';
import { Link } from 'react-router';

// const useGetBlogs = (
//   type: 'press' | 'news',
//   isPublished: boolean,
//   categoryId: number,
//   search?: string,
//   page?: number,
//   limit?: number,
// ) => {
//   return useQuery({
//     queryKey: ['blogs', { type, isPublished, categoryId, search, page, limit }],
//     queryFn: () =>
//       QUERIES.getBlogs(type, isPublished, categoryId, search, page, limit),
//   });
// };

const Blogs = () => {
  const [sort, setSort] = useQueryState('sort', {
    defaultValue: 'desc',
  });
  const [status, setStatus] = useQueryState('status', {
    defaultValue: 'all',
  });
  const [category, setCategory] = useQueryState('category', {
    defaultValue: 'press',
  });

  const {
    data: categories,
    isPending: isCategoriesPending,
    isError: isCategoriesError,
  } = useGetCategories(undefined, 20);
  const categoriesData: CategoryType[] = categories?.data?.data;

  const categoryOptions = categoriesData?.map(item => ({
    label: item.name,
    value: item.id,
  }));

  return (
    <div className="flex flex-col gap-8 pb-6">
      <div className="flex flex-col gap-7 bg-[#D9D9D980] p-8">
        <SearchInput className="self-end" />
        <div className="flex items-center justify-between">
          <Button asChild>
            <Link to={'/blog/create'}>
              <Plus />
              Create New Blog Post
            </Link>
          </Button>
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2">
              <ul className="flex items-center gap-2 [&_button]:text-[9px]/[100%] [&_button]:font-semibold">
                <li>
                  <button
                    onClick={() => setStatus('all')}
                    className={cn(
                      'cursor-pointer',
                      status === 'all' ? 'text-[#474747]' : 'text-[#9B9B9B]',
                    )}
                  >
                    ALL
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setStatus('drafts')}
                    className={cn(
                      'cursor-pointer',
                      status === 'drafts' ? 'text-[#474747]' : 'text-[#9B9B9B]',
                    )}
                  >
                    DRAFTS
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setStatus('published')}
                    className={cn(
                      'cursor-pointer',
                      status === 'published'
                        ? 'text-[#474747]'
                        : 'text-[#9B9B9B]',
                    )}
                  >
                    PUBLISHED
                  </button>
                </li>
              </ul>
              <ul className="flex items-center gap-2 rounded bg-[#305B43] px-2 [&_button]:text-[9px]/[100%] [&_button]:font-semibold">
                <li>
                  <button
                    onClick={() => setCategory('press')}
                    className={cn(
                      'cursor-pointer',
                      category === 'press' ? 'text-[#D0EA50]' : 'text-white',
                    )}
                  >
                    PRESS
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCategory('news')}
                    className={cn(
                      'cursor-pointer',
                      category === 'news' ? 'text-[#D0EA50]' : 'text-white',
                    )}
                  >
                    NEWS
                  </button>
                </li>
              </ul>
            </div>
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
              {isCategoriesError ? (
                <span>No categories found!</span>
              ) : isCategoriesPending ? (
                <Skeleton className="h-5 w-40 animate-pulse rounded bg-[#E6EFE6]" />
              ) : (
                <SelectInput
                  isFilter
                  placeholder="Filter"
                  contentClassName="bg-[#305B43] text-[#D0EA50]"
                  className="w-40 bg-[#00230F] data-[placeholder]:text-white [*]:text-[10px]/[100%] [*]:font-medium [*]:text-white"
                  options={categoryOptions}
                />
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {Array(9)
            .fill(null)
            .map((_, i) => (
              <BlogCard key={i} />
            ))}
        </div>
      </div>
      <PaginationSection
        currentPage={1}
        totalPages={10}
        setCurrentPage={() => {}}
      />
    </div>
  );
};

export default Blogs;

const BlogCard = () => {
  return (
    <div className="flex flex-col gap-3.5 bg-[#D9D9D9] p-4">
      <span className="flex gap-1 self-end border-b-[0.84px] border-[#0000000A] pb-3">
        <MessageSquare size={12} className="text-[#737373]" />
        <span className="text-[5px]/[100%] font-semibold text-[#6F6F6F]">
          500
        </span>
      </span>
      <div className="flex flex-col gap-1.5">
        <p className="text-xs/3 font-medium text-[#00230F]">
          Kehinde Smith Teams UpbreedLearn to Unlock Humour Superpower
        </p>
        <div className="flex items-center justify-between">
          <p className="bg-[#305B43] px-3 py-0.5 text-[5px]/[100%] font-bold text-white uppercase">
            Published
          </p>
          <p className="text-[9.36px]/[100%] text-[#737373]">Oct 8, 2024</p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="h-16">
            <img
              src="https://i.pravatar.cc/150?img=1"
              alt="Avatar"
              className="size-full object-cover"
            />
          </div>
          <span className="self-end text-[4.68px]/[100%] text-[#6F6F6F]">
            1:30MIN READ
          </span>
        </div>
        <div className="flex items-center gap-1 text-[5.15px]/[100%] font-semibold text-[#D0EA50] uppercase [&>span]:bg-[#305B43] [&>span]:px-1 [&>span]:py-0.5">
          <span>FASHION</span>
          <span>BEAUTY</span>
        </div>
        <Trash2 size={16} className="self-end text-[#9C9C9C]" />
      </div>
    </div>
  );
};
