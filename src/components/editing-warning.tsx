import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

const EditingWarningDialog = (props: { children: ReactNode; link: string }) => {
  const { children, link } = props;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="border-destructive flex flex-col gap-8 border">
        <DialogHeader className="sr-only">
          <DialogTitle>Confirm</DialogTitle>
          <DialogDescription>
            You're about to discard your changes. Are you sure you want to do
            this?
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-7">
          <p className="text-destructive text-center text-xs/4 font-semibold">
            You're about to discard your changes. Are you sure you want to do
            this?
          </p>
          <div className="flex justify-center gap-3">
            <DialogClose asChild>
              <Button
                asChild
                className={
                  'bg-destructive hover:bg-destructive/80 cursor-pointer text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50'
                }
              >
                <Link to={link}>Yes, Discard changes</Link>
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button className="cursor-pointer bg-transparent text-[#9C9C9C] hover:bg-transparent">
                No, Continue editing
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditingWarningDialog;
