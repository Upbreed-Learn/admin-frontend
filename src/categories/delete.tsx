import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { MUTATIONS } from '@/queries';
import useSendRequest from '@/lib/hooks/useSendRequest';
import { useState } from 'react';

const DeleteCategory = (props: {
  children: React.ReactNode;
  categoryId: string;
}) => {
  const [open, setOpen] = useState(false);
  const { children, categoryId } = props;
  const queryClient = useQueryClient();

  const { mutate, isPending } = useSendRequest<{ id: number }, any>({
    mutationFn: (data: { id: number }) => MUTATIONS.deleteCategory(+data.id),
    errorToast: {
      title: 'Error',
      description: 'Failed to delete category',
    },
    successToast: {
      title: 'Success',
      description: 'Category deleted successfully',
    },
    onSuccessCallback: () => {
      queryClient.invalidateQueries({
        queryKey: ['categories'],
      });
      setOpen(false);
    },
  });

  const handleClick = () => {
    mutate({
      id: +categoryId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Category</DialogTitle>
          <DialogDescription>
            You are about to delete the category. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <Button
            variant={'destructive'}
            disabled={isPending}
            onClick={handleClick}
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCategory;
