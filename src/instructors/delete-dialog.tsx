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
import { MUTATIONS } from '@/queries';
import { useQueryClient } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import type { Dispatch, SetStateAction } from 'react';

const InstructorDeleteDialog = (props: {
  setDelete: Dispatch<SetStateAction<boolean>>;
  delete: boolean;
}) => {
  const { setDelete, delete: deleteInstructor } = props;
  const [instructor, setInstructor] = useQueryState('id');
  const queryClient = useQueryClient();

  const { mutate, isPending } = useSendRequest<{ id: number }, any>({
    mutationFn: (data: { id: number }) => MUTATIONS.deleteInstructor(data.id),
    errorToast: {
      title: 'Error',
      description: 'Failed to delete instructor',
    },
    successToast: {
      title: 'Success',
      description: 'Instructor deleted successfully',
    },
    onSuccessCallback: () => {
      queryClient.invalidateQueries({
        queryKey: ['instructors'],
      });
      setInstructor(null);
      setDelete(false);
    },
  });

  const sendRequest = () => {
    mutate({
      id: +instructor!!,
    });
  };

  return (
    <Dialog open={deleteInstructor} onOpenChange={setDelete}>
      <DialogContent className="border-destructive flex flex-col gap-8 border">
        <DialogHeader className="sr-only">
          <DialogTitle>Delete Instructor</DialogTitle>
          <DialogDescription>
            Confirm that you want to delete this instructor.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-7">
          <p className="text-destructive text-center text-xs/4 font-semibold">
            Are you sure you want to delete this instructor?
          </p>
          <div className="flex justify-center gap-3">
            <Button
              onClick={() => sendRequest()}
              disabled={isPending}
              className={
                'bg-destructive hover:bg-destructive/80 cursor-pointer text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50'
              }
            >
              {isPending ? 'Deleting...' : 'Delete'}
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

export default InstructorDeleteDialog;
