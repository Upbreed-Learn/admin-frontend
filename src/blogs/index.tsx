import DeleteDialog from '@/components/delete-dialog';
import EmptyState from '@/components/empty';
import ErrorState from '@/components/error';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/custom/input';
import PaginationSection from '@/components/ui/custom/pagination';
import SelectInput from '@/components/ui/custom/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { BlogDetailsType, CategoryType } from '@/lib/constants';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { cn, formatDate } from '@/lib/utils';
import { MUTATIONS, QUERIES } from '@/queries';
import { useGetCategories } from '@/queries/hooks';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowDownAZ,
  ArrowUpAZ,
  MessageSquare,
  Plus,
  Trash2,
} from 'lucide-react';
import { useQueryState } from 'nuqs';
import { useEffect, useState, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router';

const useGetBlogs = (
  type: 'press' | 'news',
  isPublished: string | null,
  categoryId?: number,
  search?: string,
  page?: number,
  limit?: number,
) => {
  return useQuery({
    queryKey: ['blogs', { type, isPublished, categoryId, search, page, limit }],
    queryFn: () =>
      QUERIES.getBlogs(type, isPublished, categoryId, search, page, limit),
  });
};

const Blogs = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [activeList, setActiveList] = useState<BlogDetailsType[]>([]);
  const debouncedSearch = useDebounce(search.trim(), 1000);
  const [sort, setSort] = useQueryState('sort', {
    defaultValue: 'desc',
  });
  const [isPublished, setIsPublished] = useQueryState('isPublished');
  const [category, setCategory] = useQueryState('category', {
    defaultValue: 'press',
  });
  const [value, setValue] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleValueChange = (newValue: string) => {
    if (newValue === '_clear') {
      setValue('');
    } else {
      setValue(newValue);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const {
    data: categories,
    isPending: isCategoriesPending,
    isError: isCategoriesError,
  } = useGetCategories(undefined, 20);
  const {
    data: allBlogs,
    isPending: isBlogsPending,
    isError: isBlogsError,
  } = useGetBlogs(
    category as 'press' | 'news',
    isPublished,
    value === '' ? undefined : +value,
    debouncedSearch === '' ? undefined : debouncedSearch,
    page,
    9,
  );

  const categoriesData: CategoryType[] = categories?.data?.data;
  const blogsData: BlogDetailsType[] = allBlogs?.data?.data;

  useEffect(() => {
    if (debouncedSearch.length > 0) {
      setActiveList(blogsData);
    } else {
      setActiveList(blogsData);
    }
  }, [debouncedSearch, blogsData]);

  const categoryOptions = categoriesData?.map(item => ({
    label: item.name,
    value: item.id,
  }));

  return (
    <div className="flex flex-col gap-8 pb-6">
      <div className="flex flex-col gap-7 bg-[#D9D9D980] p-8">
        <SearchInput
          className="self-end"
          value={search}
          onChange={e => handleChange(e)}
        />
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
                    onClick={() => setIsPublished(null)}
                    className={cn(
                      'cursor-pointer',
                      isPublished === null
                        ? 'text-[#474747]'
                        : 'text-[#9B9B9B]',
                    )}
                  >
                    ALL
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsPublished('false')}
                    className={cn(
                      'cursor-pointer',
                      isPublished === 'false'
                        ? 'text-[#474747]'
                        : 'text-[#9B9B9B]',
                    )}
                  >
                    DRAFTS
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsPublished('true')}
                    className={cn(
                      'cursor-pointer',
                      isPublished === 'true'
                        ? 'text-[#474747]'
                        : 'text-[#9B9B9B]',
                    )}
                  >
                    PUBLISHED
                  </button>
                </li>
              </ul>
              <ul className="flex items-center gap-2 rounded bg-[#305B43] px-2 [&_button]:text-xs/[100%] [&_button]:font-semibold">
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
                  selectValue={value}
                  setChange={e => handleValueChange(e)}
                />
              )}
            </div>
          </div>
        </div>
        {isBlogsError ? (
          <ErrorState
            onRetry={() =>
              queryClient.invalidateQueries({ queryKey: ['blogs'] })
            }
          />
        ) : isBlogsPending ? (
          <div className="grid grid-cols-3 gap-6">
            {Array(9)
              .fill(null)
              .map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
          </div>
        ) : activeList?.length === 0 ? (
          <EmptyState
            className="bg-white"
            title={
              debouncedSearch.length > 0
                ? `Blog "${debouncedSearch}" not found! Kindly check your spelling and try again or...`
                : 'No Blog Found'
            }
            description="Click the button to add a blog"
            cta="Add Blog"
            onAdd={() => navigate('/blog/create')}
          />
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {activeList?.map(blog => (
              <BlogCard {...blog} key={blog.id} />
            ))}
          </div>
        )}
      </div>
      {activeList?.length > 0 && (
        <PaginationSection
          currentPage={page}
          totalPages={allBlogs?.data?.totalPages}
          setCurrentPage={setPage}
        />
      )}
    </div>
  );
};

export default Blogs;

const BlogCard = (props: BlogDetailsType) => {
  const { title, isPublished, createdAt, previewImage, categories, id } = props;
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };

  return (
    <>
      <DeleteDialog
        delete={openDeleteDialog}
        setDelete={setOpenDeleteDialog}
        whatToDelete="blog"
        id={+id!!}
        queryKey={'blogs'}
        deleteFn={() => MUTATIONS.deleteBlog(+id!!)}
      />
      <div className="relative flex flex-col gap-3.5 bg-[#D9D9D9] p-4">
        <span className="flex gap-1 self-end border-b-[0.84px] border-[#0000000A] pb-3">
          <MessageSquare size={12} className="text-[#737373]" />
          <span className="text-[5px]/[100%] font-semibold text-[#6F6F6F]">
            500
          </span>
        </span>
        <div className="flex flex-col gap-1.5">
          <Link
            to={`/blog/${id}`}
            className="text-sm/3 font-medium text-[#00230F] capitalize"
          >
            <span className="absolute inset-0 size-full"></span>
            {title}
          </Link>
          <div className="flex items-center justify-between">
            <p
              className={cn(
                'bg-[#305B43] px-3 py-0.5 text-xs/[100%] font-bold text-white uppercase',
                !isPublished && 'bg-[#D0EA50] text-black',
              )}
            >
              {isPublished ? 'Published' : 'Draft'}
            </p>
            <p className="text-xs/[100%] text-[#737373]">
              {formatDate(createdAt)}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <div className="h-16">
              <img
                src={
                  previewImage
                    ? previewImage
                    : 'https://i.pravatar.cc/150?img=1'
                }
                alt="Avatar"
                className="size-full object-cover"
              />
            </div>
            <span className="self-end text-xs/[100%] text-[#6F6F6F]">
              1:30MIN READ
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1 text-xs/[100%] font-semibold text-[#D0EA50] uppercase [&>span]:bg-[#305B43] [&>span]:px-1 [&>span]:py-0.5">
            {categories.map(category => (
              <span key={category.id}>{category.category.name}</span>
            ))}
          </div>
          <button
            onClick={handleOpenDeleteDialog}
            className="z-10 w-max cursor-pointer self-end p-1"
          >
            <Trash2 size={16} className="text-[#9C9C9C]" />
            <span className="sr-only">Delete</span>
          </button>
        </div>
      </div>
    </>
  );
};

const BlogCardSkeleton = () => {
  return (
    <div
      role="status"
      aria-label="loading blog card"
      className="flex flex-col gap-3.5 bg-[#D9D9D9] p-4"
    >
      <span className="flex gap-1 self-end border-b-[0.84px] border-[#0000000A] pb-3">
        <Skeleton className="h-3 w-3 animate-pulse rounded bg-[#9C9C9C]" />
        <Skeleton className="h-3 w-8 animate-pulse rounded bg-[#9C9C9C]" />
      </span>

      <div className="flex flex-col gap-1.5">
        {/* Title */}
        <Skeleton className="h-4 w-full max-w-[12rem] animate-pulse self-start rounded bg-[#BFCFC0]" />

        {/* status + date */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16 animate-pulse rounded bg-[#98AFA0]" />
          <Skeleton className="h-4 w-20 animate-pulse rounded bg-[#9C9C9C]" />
        </div>

        {/* image */}
        <div className="flex flex-col gap-1">
          <Skeleton className="h-16 w-full animate-pulse overflow-hidden rounded bg-[#C7DACC]" />
          <Skeleton className="h-3 w-14 animate-pulse self-end rounded bg-[#9C9C9C]" />
        </div>

        {/* tags */}
        <div className="flex items-center gap-1">
          <Skeleton className="h-5 w-12 animate-pulse rounded bg-[#8EA98A]" />
          <Skeleton className="h-5 w-10 animate-pulse rounded bg-[#8EA98A]" />
        </div>

        {/* action icon */}
        <Skeleton className="h-4 w-4 animate-pulse self-end rounded bg-[#9C9C9C]" />
      </div>
    </div>
  );
};
