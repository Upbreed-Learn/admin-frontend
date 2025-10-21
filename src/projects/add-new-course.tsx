import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useQueryState } from 'nuqs';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import TextInput from '@/components/ui/custom/input';
import TextAreaInput from '@/components/ui/custom/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import ImageUploadIcon from '@/assets/jsx-icons/image-upload-icon';
import { Input } from '@/components/ui/input';
import { useRef, useState } from 'react';
import type { CategoryType, CourseType, InstructorType } from '@/lib/constants';
import SelectInput from '@/components/ui/custom/select';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { MUTATIONS, QUERIES } from '@/queries';
import { Skeleton } from '@/components/ui/skeleton';
import useSendRequest from '@/lib/hooks/useSendRequest';

export const items = [
  {
    id: 'food',
    label: 'Food',
  },
  {
    id: 'art & culture',
    label: 'Art & Culture',
  },
  {
    id: 'government',
    label: 'Government',
  },
  {
    id: 'photography',
    label: 'Photography',
  },
  {
    id: 'illustration',
    label: 'Illustration',
  },
  {
    id: 'film',
    label: 'Film',
  },
  {
    id: 'writing',
    label: 'Writing',
  },
  {
    id: 'design',
    label: 'Design',
  },
  {
    id: 'marketing',
    label: 'Marketing',
  },
  {
    id: '3d',
    label: '3D',
  },
  {
    id: 'architecture',
    label: 'Architecture',
  },
  {
    id: 'music',
    label: 'Music',
  },
  {
    id: 'audio',
    label: 'Audio',
  },
] as const;

const formSchema = z.object({
  fullName: z.string().min(1, {
    message: 'Full Name must be at least 1 characters.',
  }),
  courseTitle: z.string().min(2, {
    message: 'Course Title must be at least 2 characters.',
  }),
  courseDescription: z.string().min(10, {
    message: 'Course Description must be at least 10 characters.',
  }),
  items: z.array(z.string()).refine(value => value.length === 1, {
    message: 'You must select exactly one item.',
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

const useGetInstructorsAndCategories = (page?: number, limit?: number) => {
  return useQueries({
    queries: [
      {
        queryKey: ['instructors', { page, limit }],
        queryFn: () => QUERIES.getInstructors(page, limit),
      },
      {
        queryKey: ['categories', { page, limit }],
        queryFn: () => QUERIES.getCategories(),
      },
    ],
  });
};

const AddNewCourse = () => {
  const [addNewCourse, setAddNewCourse] = useQueryState('addNewCourse');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const [allInstructors, categories] = useGetInstructorsAndCategories(
    undefined,
    20,
  );

  const areAnyPending = [allInstructors, categories].some(
    query => query.status === 'pending',
  );

  const instructorsData: InstructorType[] = allInstructors?.data?.data?.data;
  const categoriesData: CategoryType[] = categories?.data?.data?.data;

  const instructorsOptions = instructorsData?.map(instructor => ({
    label: instructor.fname + ' ' + instructor.lname,
    value: instructor.id,
  }));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      courseTitle: '',
      courseDescription: '',
      items: [],
      image: undefined,
    },
  });

  console.log(form.watch('items'));

  const { mutate, isPending } = useSendRequest<CourseType, any>({
    mutationFn: (data: CourseType) => MUTATIONS.course(data),
    errorToast: {
      title: 'Error',
      description: 'Failed to add course',
    },
    successToast: {
      title: 'Success',
      description: 'Course added successfully',
    },
    onSuccessCallback: () => {
      queryClient.invalidateQueries({
        queryKey: ['courses'],
      });
      form.reset();
      setAddNewCourse(null);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutate({
      instructor: +values.fullName,
      title: values.courseTitle,
      description: values.courseDescription,
      image: values.image,
      categories: [Number(values.items)],
    });
    // console.log(
    //   +values.fullName,
    //   values.courseTitle,
    //   values.courseDescription,
    //   values.image,
    //   [Number(values.items)],
    // );
  }

  return (
    <Dialog
      open={addNewCourse === 'true' ? true : false}
      onOpenChange={() =>
        setAddNewCourse(addNewCourse === 'true' ? null : 'true')
      }
    >
      <DialogContent>
        <DialogHeader className="sr-only">
          <DialogTitle>Add New Course</DialogTitle>
          <DialogDescription>
            You can add a new course by filling out the form below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6 py-6"
          >
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <SelectInput
                  field={field}
                  className="w-full"
                  placeholder="Select an instructor"
                  validated
                  isPending={areAnyPending}
                  options={instructorsOptions}
                />
              )}
            />
            <FormField
              control={form.control}
              name="courseTitle"
              render={({ field }) => (
                <TextInput field={field} placeholder="Course Title" validated />
              )}
            />
            <FormField
              control={form.control}
              name="courseDescription"
              render={({ field }) => (
                <TextAreaInput
                  field={field}
                  placeholder="What is this course about?"
                  validated
                />
              )}
            />
            <fieldset className="flex items-start gap-7">
              <FormField
                control={form.control}
                name="items"
                render={() => (
                  <FormItem>
                    <div className="flex basis-full flex-wrap items-center gap-1.5">
                      {categories.isError ? (
                        <span>No categories found!</span>
                      ) : areAnyPending ? (
                        <div className="flex flex-wrap gap-1.5">
                          {Array(10)
                            .fill(null)
                            .map((_, i) => (
                              <Skeleton
                                key={i}
                                className="h-5 w-16 animate-pulse rounded bg-[#E6EFE6]"
                              />
                            ))}
                        </div>
                      ) : (
                        categoriesData.map(item => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="items"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-center"
                                >
                                  <FormControl>
                                    <Checkbox
                                      className="hidden"
                                      checked={field.value?.includes(
                                        `${item.id}`,
                                      )}
                                      onCheckedChange={checked => {
                                        return checked
                                          ? field.onChange([`${item.id}`])
                                          : field.onChange([]);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel
                                    className={cn(
                                      'rounded bg-[#F1F1F1] px-1.5 py-1 text-xs/[100%] font-semibold text-[#9C9C9C] uppercase',
                                      field.value?.includes(`${item.id}`) &&
                                        'bg-[#D0EA50] text-black',
                                    )}
                                  >
                                    {item.name}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field: { value, onChange } }) => (
                  <FormItem>
                    <div
                      className={cn(
                        'flex h-[14.0625rem] w-[8.9375rem] basis-full flex-col items-center justify-center gap-3 rounded-[10px] bg-[#D9D9D9]',
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
                          src={URL.createObjectURL(value)}
                          alt="uploaded"
                          className="h-32 w-32 rounded object-contain"
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
            </fieldset>
            <Button type="submit" className="self-end">
              {isPending ? 'Creating...' : 'Create New Course'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewCourse;
