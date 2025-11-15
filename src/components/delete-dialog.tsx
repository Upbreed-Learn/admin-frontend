import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import useSendRequest from '@/lib/hooks/useSendRequest';
import { useQueryClient } from '@tanstack/react-query';
import type { Dispatch, SetStateAction } from 'react';

const DeleteDialog = (props: {
  setDelete: Dispatch<SetStateAction<boolean>>;
  delete: boolean;
  deleteFn: (id: number) => Promise<any>;
  queryKey: string;
  id: number;
  onSuccessCallback?: () => void;
  whatToDelete: string;
}) => {
  const {
    setDelete,
    delete: deleteInstructor,
    deleteFn,
    queryKey,
    onSuccessCallback,
    id,
    whatToDelete,
  } = props;
  const queryClient = useQueryClient();

  const { mutate, isPending } = useSendRequest<{ id: number }, any>({
    mutationFn: (data: { id: number }) => deleteFn(data.id),
    errorToast: {
      title: 'Error',
      description:
        whatToDelete === 'instructor'
          ? 'Failed to deactivate instructor'
          : 'Failed to delete',
    },
    successToast: {
      title: 'Success',
      description:
        whatToDelete === 'instructor'
          ? 'Instructor Deactivated'
          : 'Deleted successfully',
    },
    onSuccessCallback: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKey],
      });
      {
        onSuccessCallback && onSuccessCallback();
      }
      setDelete(false);
    },
  });

  const sendRequest = () => {
    mutate({
      id: id,
    });
  };

  return (
    <Dialog open={deleteInstructor} onOpenChange={setDelete}>
      <DialogContent className="border-destructive flex flex-col gap-8 border">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {whatToDelete === 'instructor' ? 'Deactivate' : 'Delete'}{' '}
            {whatToDelete}
          </DialogTitle>
          <DialogDescription>
            Confirm that you want to{' '}
            {whatToDelete === 'instructor' ? 'deactivate' : 'delete'} this{' '}
            {whatToDelete}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-7">
          <p className="text-destructive text-center text-xs/4 font-semibold">
            Are you sure you want to{' '}
            {whatToDelete === 'instructor' ? 'deactivate' : 'delete'} this{' '}
            {whatToDelete}?
          </p>
          <div className="flex justify-center gap-3">
            <Button
              onClick={() => sendRequest()}
              disabled={isPending}
              className={
                'bg-destructive hover:bg-destructive/80 cursor-pointer text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50'
              }
            >
              {isPending
                ? whatToDelete === 'instructor'
                  ? 'Deactivating...'
                  : 'Deleting...'
                : whatToDelete === 'instructor'
                  ? 'Deactivate'
                  : 'Delete'}
            </Button>
            <DialogClose asChild>
              <Button className="cursor-pointer bg-transparent text-[#9C9C9C] hover:bg-transparent">
                Cancel
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialog;
