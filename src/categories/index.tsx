import ErrorState from '@/components/error';
import PaginationSection from '@/components/ui/custom/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import type { CategoryType } from '@/lib/constants';
import { useGetCategories } from '@/queries/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { Edit, Trash } from 'lucide-react';
import { useState } from 'react';
import CategoriesForm from './form';
import EditCategory from './edit';
import DeleteCategory from './delete';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const Categories = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const {
    data: categories,
    isPending: categoriesIsPending,
    isError,
  } = useGetCategories(page, 9);
  const categoriesData: CategoryType[] = categories?.data?.data;

  return (
    <div className="flex flex-col gap-20">
      <div className="flex items-center justify-between">
        <h1>Categories</h1>
        <Dialog>
          <DialogTrigger className="cursor-pointer font-semibold">
            + Add category
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Category</DialogTitle>
              <DialogDescription>You can add a new category.</DialogDescription>
            </DialogHeader>
            <CategoriesForm page={page} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-col gap-6">
        <ul className="grid grid-cols-3 gap-2">
          {categoriesIsPending ? (
            Array(9)
              .fill(null)
              .map((_, i) => <Skeleton key={i} className="h-6 w-32" />)
          ) : isError ? (
            <ErrorState
              onRetry={() =>
                queryClient.invalidateQueries({
                  queryKey: ['categories', { page, limit: 9 }],
                })
              }
            />
          ) : (
            categoriesData?.map(category => (
              <li
                key={category.id}
                className="flex items-center justify-between rounded-xl bg-[#D9D9D9] p-4"
              >
                <span className="flex items-center gap-4">
                  {category.name}
                  {category.icon && (
                    <span>
                      <img
                        src={category.icon}
                        alt="uploaded"
                        className="size-6 rounded object-contain"
                      />
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-4">
                  <EditCategory
                    categoryId={category.id}
                    page={page}
                    categories={categoriesData}
                  >
                    <Edit className="size-4" />
                  </EditCategory>
                  <DeleteCategory categoryId={category.id}>
                    <Trash className="text-destructive size-5" />
                  </DeleteCategory>
                </span>
              </li>
            ))
          )}
        </ul>
        <PaginationSection
          currentPage={page}
          setCurrentPage={setPage}
          totalPages={categories?.data?.metadata.lastPage}
        />
      </div>
    </div>
  );
};

export default Categories;
