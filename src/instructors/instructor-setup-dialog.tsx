import ImageUploadIcon from '@/assets/jsx-icons/image-upload-icon';
import ErrorState from '@/components/error';
import { Button } from '@/components/ui/button';
import TextInput from '@/components/ui/custom/input';
import TextAreaInput from '@/components/ui/custom/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type { InstructorDetailsType, InstructorType } from '@/lib/constants';
import useSendRequest from '@/lib/hooks/useSendRequest';
import { cn } from '@/lib/utils';
import { MUTATIONS, QUERIES } from '@/queries';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: 'First Name must be at least 2 characters.',
  }),
  lastName: z.string().min(2, {
    message: 'Last Name must be at least 2 characters.',
  }),
  email: z.email({
    message: 'Please enter a valid email address.',
  }),
  aboutInstructor: z.string().min(10, {
    message: 'About Instructor must be at least 10 characters.',
  }),
  image: z
    .union([
      z.url('Must be a valid URL'),
      z
        .any()
        .refine(
          file =>
            !file ||
            (file instanceof File &&
              file.size <= 10 * 1024 * 1024 &&
              file.type.startsWith('image/')),
          { message: 'Please upload an image file not more than 10MB.' },
        ),
    ])
    .optional(),
});

const useGetInstructor = (id: string) => {
  return useQuery({
    queryKey: ['instructor', { id }],
    queryFn: () => QUERIES.getInstructor(+id),
    enabled: !!id,
  });
};

const InstructorSetupDialog = () => {
  const [addInstructor, setAddInstructor] = useQueryState('instructorSetup');
  const [instructor, setInstructor] = useQueryState('id');
  const [confirm, setConfirm] = useState(false);
  const [values, setValues] = useState<z.infer<typeof formSchema>>({
    firstName: '',
    lastName: '',
    email: '',
    aboutInstructor: '',
    image: undefined,
  });

  const handleOpenChange = () => {
    setAddInstructor(addInstructor === 'true' ? null : 'true');
    setInstructor(typeof instructor === 'string' ? null : instructor);
  };

  return (
    <Dialog
      open={addInstructor === 'true' ? true : false}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="flex flex-col gap-8">
        <DialogHeader className="sr-only">
          <DialogTitle>AddNewinstructor</DialogTitle>
          <DialogDescription>
            Fill out the form below to add a new instructor.
          </DialogDescription>
        </DialogHeader>
        {!confirm ? (
          <AddInstructorForm
            confirm={confirm}
            setConfirm={setConfirm}
            setValues={setValues}
            values={values}
          />
        ) : (
          <Confirm
            confirm={confirm}
            setConfirm={setConfirm}
            values={values}
            setValues={setValues}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InstructorSetupDialog;

const AddInstructorForm = (props: {
  confirm: boolean;
  setConfirm: Dispatch<SetStateAction<boolean>>;
  setValues: Dispatch<SetStateAction<z.infer<typeof formSchema>>>;
  values: z.infer<typeof formSchema>;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [instructor, _] = useQueryState('id');
  const { data, isPending, isError } = useGetInstructor(instructor!!);
  const { confirm, setConfirm, setValues, values } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const instructorData: InstructorDetailsType = data?.data?.data;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: instructor ? instructorData?.fname!! : values.firstName,
      lastName: instructor ? instructorData?.lname!! : values.lastName,
      email: instructor ? instructorData?.email!! : values.email,
      aboutInstructor: instructor
        ? instructorData?.instructorProfile.about!!
        : values.aboutInstructor,
      image: instructor
        ? instructorData?.instructorProfile.profilePictureUrl!!
        : values.image,
    },
  });

  useEffect(() => {
    if (instructor && instructorData) {
      form.reset({
        firstName: instructorData.fname,
        lastName: instructorData.lname,
        email: instructorData.email,
        aboutInstructor: instructorData.instructorProfile.about,
        image: instructorData.instructorProfile.profilePictureUrl,
      });
    }
  }, [instructor, instructorData, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    setValues(values);
    setConfirm(true);
  }

  if (isError && instructor)
    return (
      <ErrorState
        onRetry={() =>
          queryClient.invalidateQueries({
            queryKey: ['instructor', { id: instructor }],
          })
        }
      />
    );

  if (isPending && instructor) return <AddInstructorFormSkeleton />;

  return (
    <Form {...form}>
      <form
        style={{
          backdropFilter: confirm ? 'blur(2px)' : 'blur(0px)',
          WebkitBackdropFilter: confirm ? 'blur(2px)' : 'blur(0px)',
          filter: confirm ? 'blur(2px)' : 'blur(0px)',
        }}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 py-6"
      >
        <FormField
          control={form.control}
          name="image"
          render={({ field: { value, onChange } }) => (
            <FormItem className="flex flex-col items-center self-center">
              <div
                className={cn(
                  'flex h-[8.4375rem] w-[8.9375rem] flex-col items-center justify-center gap-3 overflow-hidden rounded-[10px] bg-[#D9D9D9]',
                  isDragging && 'border-[#305B43] bg-[#e5e5e5]',
                )}
                onDragOver={e => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={e => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={e => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (
                    file &&
                    file.type.startsWith('image/') &&
                    file.size <= 10 * 1024 * 1024
                  ) {
                    onChange(file);
                  }
                }}
                onClick={() => inputRef.current?.click()}
              >
                <Input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (
                      file &&
                      file.type.startsWith('image/') &&
                      file.size <= 10 * 1024 * 1024
                    ) {
                      onChange(file);
                    }
                  }}
                />
                {value ? (
                  <img
                    src={
                      typeof value === 'string'
                        ? value
                        : URL.createObjectURL(value)
                    }
                    alt="uploaded"
                    className="size-full object-cover"
                  />
                ) : (
                  <>
                    <ImageUploadIcon />
                    <p className="text-[7px]/[100%] font-semibold text-[#9B9B9B]">
                      UPLOAD IMAGE
                    </p>
                  </>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <fieldset className="flex flex-col gap-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <TextInput field={field} placeholder="First Name" validated />
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <TextInput field={field} placeholder="Last Name" validated />
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <TextInput field={field} placeholder="Email" validated />
            )}
          />
          <FormField
            control={form.control}
            name="aboutInstructor"
            render={({ field }) => (
              <TextAreaInput
                field={field}
                placeholder="About Instructor"
                validated
              />
            )}
          />
        </fieldset>
        <Button
          disabled={typeof instructor === 'string' && !form.formState.isDirty}
          type="submit"
          className="self-end disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
        >
          Save
        </Button>
      </form>
    </Form>
  );
};

const Confirm = (props: {
  confirm: boolean;
  setConfirm: Dispatch<SetStateAction<boolean>>;
  values: z.infer<typeof formSchema>;
  setValues: Dispatch<SetStateAction<z.infer<typeof formSchema>>>;
}) => {
  const [_, setAddInstructor] = useQueryState('instructorSetup');
  const [instructor, setInstructor] = useQueryState('id');
  const { confirm, setConfirm, values, setValues } = props;
  const queryClient = useQueryClient();

  const { mutate, isPending } = useSendRequest<
    Omit<InstructorType, 'id' | 'createdAt'>,
    any
  >({
    mutationFn: (data: Omit<InstructorType, 'id' | 'createdAt'>) =>
      MUTATIONS.instructor(data),
    errorToast: {
      title: 'Error',
      description: 'Failed to add instructor',
    },
    successToast: {
      title: 'Success',
      description: 'Instructor added successfully',
    },
    onSuccessCallback: () => {
      setValues({
        firstName: '',
        lastName: '',
        email: '',
        aboutInstructor: '',
        image: undefined,
      });
      queryClient.invalidateQueries({
        queryKey: ['instructors'],
      });
      instructor && setInstructor(null);
      setConfirm(false);
      setAddInstructor(null);
    },
  });

  const { mutate: editMutate, isPending: isEditPending } = useSendRequest<
    Omit<InstructorType, 'id' | 'createdAt'>,
    any
  >({
    mutationFn: (data: Omit<InstructorType, 'id' | 'createdAt'>) =>
      MUTATIONS.editInstructor(+instructor!!, data),
    errorToast: {
      title: 'Error',
      description: 'Failed to update instructor',
    },
    successToast: {
      title: 'Success',
      description: 'Instructor updated successfully',
    },
    onSuccessCallback: () => {
      queryClient.invalidateQueries({
        queryKey: ['instructors'],
      });
      instructor && setInstructor(null);
      setConfirm(false);
      setAddInstructor(null);
    },
  });

  const sendRequest = () => {
    if (instructor) {
      editMutate({
        fname: values.firstName,
        lname: values.lastName,
        email: values.email,
        about: values.aboutInstructor,
        profilePicture: values.image,
      });
    } else {
      mutate({
        fname: values.firstName,
        lname: values.lastName,
        email: values.email,
        about: values.aboutInstructor,
        profilePicture: values.image,
      });
    }
  };

  const handleCancel = () => {
    setConfirm(false);
  };

  return (
    <div
      style={{
        backdropFilter: !confirm ? 'blur(2px)' : 'blur(0px)',
        WebkitBackdropFilter: !confirm ? 'blur(2px)' : 'blur(0px)',
        filter: !confirm ? 'blur(2px)' : 'blur(0px)',
      }}
      className="flex flex-col gap-7"
    >
      <p className="text-center text-xs/4 font-semibold text-[#9C9C9C]">
        {instructor
          ? 'Would you like to update this instructor?'
          : 'Would you like to create an account for this instructor?'}
        <br /> <br />
        <span className={cn('text-[#305B43]')}>“{values.email}”</span>
      </p>
      <div className="flex justify-center gap-3">
        <Button
          onClick={() => sendRequest()}
          disabled={isPending || isEditPending}
          className={cn(
            'cursor-pointer bg-[#305B43] text-[#D0EA50] hover:bg-[#305B43]/80 disabled:cursor-not-allowed',
          )}
        >
          {isPending || isEditPending ? 'Sending...' : 'Send'}
        </Button>
        <Button
          onClick={() => handleCancel()}
          className="cursor-pointer bg-transparent text-[#9C9C9C] hover:bg-transparent"
        >
          Don't Send
        </Button>
      </div>
    </div>
  );
};

const AddInstructorFormSkeleton = () => {
  return (
    <div
      className="flex flex-col gap-6 py-6"
      role="status"
      aria-label="loading form"
    >
      {/* Image */}
      <div className="self-center">
        <Skeleton className="h-[8.4375rem] w-[8.9375rem] animate-pulse rounded-[10px] bg-[#E6EFE6]" />
      </div>

      {/* Inputs */}
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 animate-pulse rounded bg-[#E6EFE6]" />
        <Skeleton className="h-10 animate-pulse rounded bg-[#E6EFE6]" />
        <Skeleton className="h-10 animate-pulse rounded bg-[#E6EFE6]" />
        <Skeleton className="h-24 animate-pulse rounded bg-[#E6EFE6]" />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <Skeleton className="h-9 w-24 animate-pulse rounded bg-[#E6EFE6]" />
        <Skeleton className="h-9 w-20 animate-pulse rounded bg-[#E6EFE6]" />
      </div>
    </div>
  );
};
