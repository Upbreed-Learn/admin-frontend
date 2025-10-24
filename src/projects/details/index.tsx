import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import AddNewCourse from '../add-new-course';
import { cn } from '@/lib/utils';
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import TextInput from '@/components/ui/custom/input';
import TextAreaInput from '@/components/ui/custom/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import ImageUploadIcon from '@/assets/jsx-icons/image-upload-icon';
import { DraggableSections } from './draggable';
import { useQueryClient } from '@tanstack/react-query';
import type { CategoryType, CourseDetailsType } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorState from '@/components/error';
import EditingWarningDialog from './editing-warning';
import { useGetCategories, useGetCourse } from '@/queries/hooks';
import DeleteDialog from '@/components/delete-dialog';
import { MUTATIONS } from '@/queries';

const UpdateProject = () => {
  const [isEdited, setIsEdited] = useState(false);

  return (
    <>
      <AddNewCourse />
      <div className="flex flex-col gap-8 pb-8">
        <div className="flex flex-col gap-12">
          {/* Add Warning modal if form is edited */}
          {isEdited ? (
            <EditingWarningDialog>
              <Button className="w-max">
                <ArrowLeft />
                Back
              </Button>
            </EditingWarningDialog>
          ) : (
            <Button asChild className="w-max">
              <Link to={'/projects'}>
                <ArrowLeft />
                Back
              </Link>
            </Button>
          )}
          <InstructorDetails setIsEdited={setIsEdited} />
        </div>
      </div>
    </>
  );
};

export default UpdateProject;

const sectionSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  video: z.union([z.instanceof(File), z.url(), z.undefined()]).optional(),
  isPublic: z.boolean(),
});

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: 'Full Name must be at least 2 characters.',
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
  sections: z
    .array(sectionSchema)
    .min(1, { message: 'At least one section is required' }),
});

const InstructorDetails = (props: {
  setIsEdited: Dispatch<SetStateAction<boolean>>;
}) => {
  const [deleteProject, setDeleteProject] = useState(false);
  const { setIsEdited } = props;
  const { id } = useParams();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isPending, isError } = useGetCourse(id!!);
  const {
    data: categories,
    isPending: isCategoriesPending,
    isError: isCategoriesError,
  } = useGetCategories(undefined, 20);

  const courseData: CourseDetailsType = data?.data?.data;
  const categoriesData: CategoryType[] = categories?.data?.data;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName:
        courseData?.instructor.fname + ' ' + courseData?.instructor.lname,
      courseTitle: courseData?.title,
      courseDescription: courseData?.description,
      items: courseData?.categories.map(category => `${category.id}`),
      image: courseData?.thumbnail,
      sections: [
        { title: '', description: '', video: undefined, isPublic: false },
      ],
    },
  });

  useEffect(() => {
    if (courseData) {
      form.reset({
        fullName:
          courseData?.instructor.fname + ' ' + courseData?.instructor.lname,
        courseTitle: courseData?.title,
        courseDescription: courseData?.description,
        items: courseData?.categories.map(category => `${category.id}`),
        image: courseData?.thumbnail,
        sections: [
          { title: '', description: '', video: undefined, isPublic: false },
        ],
      });
    }
  }, [form, courseData]);

  useEffect(() => {
    setIsEdited(form.formState.isDirty);
  }, [form.formState.isDirty]);

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'sections',
  });

  const handleAddSection = () => {
    append({
      title: '',
      description: '',
      video: undefined,
      isPublic: false,
    });
  };

  // const handleDeleteSection = (index: number) => {
  //   remove(index);
  // };

  if (isPending) {
    return <ProjectDetailsFormSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        onRetry={() => queryClient.invalidateQueries({ queryKey: ['course'] })}
      />
    );
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <>
      <DeleteDialog
        delete={deleteProject}
        setDelete={setDeleteProject}
        whatToDelete="project"
        id={+id!!}
        onSuccessCallback={() => {
          navigate('/projects');
        }}
        queryKey={'courses'}
        deleteFn={() => MUTATIONS.deleteProject(+id!!)}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-7"
        >
          <fieldset className="flex flex-col gap-2 rounded-lg bg-[#A1A1A10F] px-7 py-12">
            <fieldset className="flex gap-4 border-b border-[#0000001A] pb-3">
              <fieldset className="flex flex-3/4 flex-col gap-4">
                <FormField
                  control={form.control}
                  name="courseTitle"
                  render={({ field }) => (
                    <TextInput
                      field={field}
                      placeholder="Course Title"
                      validated
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <TextInput
                      field={field}
                      disabled
                      placeholder="Instructor’s Full Name"
                      validated
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="courseDescription"
                  render={({ field }) => (
                    <TextAreaInput
                      field={field}
                      placeholder="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. "
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
                          {isCategoriesError ? (
                            <span>No categories found!</span>
                          ) : isCategoriesPending ? (
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
                </fieldset>
              </fieldset>
              <FormField
                control={form.control}
                name="image"
                render={({ field: { value, onChange } }) => (
                  <FormItem className="flex-1/4">
                    <div
                      className={cn(
                        'flex h-[18.1875rem] basis-full flex-col items-center justify-center gap-3 overflow-hidden rounded-[10px] bg-[#D9D9D9]',
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
                          className="size-full rounded object-cover"
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
            <DraggableSections
              form={form}
              fields={fields}
              move={move}
              remove={remove}
            />
            <button
              type="button"
              onClick={handleAddSection}
              className="w-max text-[10px]/[100%] font-bold text-[#6F6F6F]"
            >
              Add New
            </button>
          </fieldset>
          <div className="flex justify-between">
            <button
              onClick={() => setDeleteProject(true)}
              type="button"
              className="cursor-pointer text-[10px]/[100%] font-bold text-[#6F6F6F] underline"
            >
              DELETE COURSE
            </button>
            <Button>Update</Button>
          </div>
        </form>
      </Form>
    </>
  );
};

const ProjectDetailsFormSkeleton = () => {
  return (
    <div
      role="status"
      aria-label="loading project form"
      className="flex flex-col gap-7"
    >
      <div className="flex flex-col gap-2 rounded-lg bg-[#A1A1A10F] px-7 py-12">
        <div className="flex gap-4 border-b border-[#0000001A] pb-3">
          <div className="flex flex-3/4 flex-col gap-4">
            {/* Course title */}
            <Skeleton className="ml-auto h-6 w-3/4 animate-pulse rounded bg-[#E6EFE6]" />

            {/* Full name */}
            <Skeleton className="ml-auto h-6 w-2/3 animate-pulse rounded bg-[#E6EFE6]" />

            {/* Description */}
            <Skeleton className="h-24 w-full animate-pulse rounded bg-[#E6EFE6]" />

            {/* Items chips */}
            <div className="flex flex-wrap justify-end gap-2">
              {Array(4)
                .fill(null)
                .map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-6 w-20 animate-pulse rounded bg-[#E6EFE6]"
                  />
                ))}
            </div>
          </div>

          {/* Image box on the right */}
          <div className="flex-1/4">
            <Skeleton className="h-[18.1875rem] w-full animate-pulse rounded-[10px] bg-[#E6EFE6]" />
          </div>
        </div>

        {/* Sections skeletons */}
        <div className="mt-6 space-y-4">
          {Array(2)
            .fill(null)
            .map((_, si) => (
              <div
                key={si}
                className="flex items-start justify-between gap-4 rounded-lg bg-white/5 p-4"
              >
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/2 animate-pulse rounded bg-[#E6EFE6]" />
                  <Skeleton className="h-16 w-full animate-pulse rounded bg-[#E6EFE6]" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Skeleton className="h-8 w-10 animate-pulse rounded bg-[#E6EFE6]" />
                  <Skeleton className="h-8 w-8 animate-pulse rounded bg-[#E6EFE6]" />
                </div>
              </div>
            ))}
        </div>

        {/* Add New button skeleton */}
        <div className="mt-4 w-max">
          <Skeleton className="h-6 w-20 animate-pulse rounded bg-[#E6EFE6]" />
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex justify-between">
        <Skeleton className="h-5 w-28 animate-pulse rounded bg-[#E6EFE6]" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24 animate-pulse rounded bg-[#E6EFE6]" />
          <Skeleton className="h-10 w-24 animate-pulse rounded bg-[#E6EFE6]" />
        </div>
      </div>
    </div>
  );
};
