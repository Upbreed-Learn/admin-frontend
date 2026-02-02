import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import CategoriesForm from './form';
import type { CategoryType } from '@/lib/constants';

const EditCategory = (props: {
  children: React.ReactNode;
  categoryId: string;
  page: number;
  categories: CategoryType[];
}) => {
  const { children, categoryId, page, categories } = props;

  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>You can edit this category.</DialogDescription>
        </DialogHeader>
        <CategoriesForm
          categoryId={categoryId}
          page={page}
          categories={categories}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditCategory;
