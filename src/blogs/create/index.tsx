import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import TextInput from '@/components/ui/custom/input';
import TextAreaInput from '@/components/ui/custom/textarea';
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
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, LoaderPinwheel } from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router';
import z from 'zod';
import Tiptap from './text-editor';
import { Input } from '@/components/ui/input';
import ImageUploadIcon from '@/assets/jsx-icons/image-upload-icon';
import { useGetCategories } from '@/queries/hooks';
import type { BlogDetailsType, BlogType, CategoryType } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import useSendRequest, {
  errorToastClassName,
} from '@/lib/hooks/useSendRequest';
import { MUTATIONS, QUERIES } from '@/queries';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import EditingWarningDialog from '@/components/editing-warning';
import ErrorState from '@/components/error';
import { toast } from 'sonner';
import DeleteDialog from '@/components/delete-dialog';

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  mainContent: z.string().min(10, {
    message: 'Course Description must be at least 10 characters.',
  }),
  image: z.union([
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
  ]),
  categories: z.array(z.string()).refine(value => value.some(item => item), {
    message: 'You have to select at least one item.',
  }),
});

const useGetBlogById = (id: number) => {
  return useQuery({
    queryKey: ['blogs', { id }],
    queryFn: () => QUERIES.getBlogById(id),
    enabled: !!id,
  });
};

const CreateBlog = () => {
  const { id } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [blogData, setBlogData] = useState<z.infer<typeof formSchema>>({
    title: '',
    description: '',
    mainContent: 'Input Blog Content Here...',
    image: undefined,
    categories: [],
  });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: categories,
    isPending: isCategoriesPending,
    isError: isCategoriesError,
  } = useGetCategories(undefined, 20);
  const {
    data: blogDetails,
    isPending: isBlogPending,
    isError: isBlogError,
  } = useGetBlogById(+id!!);

  const categoriesData: CategoryType[] = categories?.data?.data;
  const blogDetailsData: BlogDetailsType = blogDetails?.data;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: blogDetailsData?.title ?? '',
      description: blogDetailsData?.description ?? '',
      mainContent: blogDetailsData?.content ?? 'Input Blog Content Here...',
      image: blogDetailsData?.previewImage ?? undefined,
      categories:
        blogDetailsData?.categories.map(category => `${category.id}`) ?? [],
    },
  });

  useEffect(() => {
    if (blogDetails) {
      form.reset({
        title: blogDetailsData?.title ?? '',
        description: blogDetailsData?.description ?? '',
        mainContent: blogDetailsData?.content ?? 'Input Blog Content Here...',
        image: blogDetailsData?.previewImage ?? undefined,
        categories:
          blogDetailsData?.categories.map(category => `${category.id}`) ?? [],
      });
    }
  }, [blogDetails, form]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setIsOpen(true);
    setBlogData(data);
  };

  if (id && isBlogPending) {
    return <BlogCreateFormSkeleton />;
  }

  if (isBlogError) {
    return (
      <ErrorState
        onRetry={() => queryClient.invalidateQueries({ queryKey: ['blogs'] })}
      />
    );
  }

  return (
    <>
      <SelectCategory
        setOpen={setIsOpen}
        open={isOpen}
        blogData={blogData}
        isPublished={isPublished}
        isDirty={form.formState.isDirty}
      />
      <DeleteDialog
        delete={openDeleteDialog}
        setDelete={setOpenDeleteDialog}
        whatToDelete="blog"
        id={+id!!}
        queryKey={'blogs'}
        deleteFn={() => MUTATIONS.deleteBlog(+id!!)}
        onSuccessCallback={() => navigate('/blog')}
      />
      <div className="flex flex-col gap-7 pb-10">
        {form.formState.isDirty ? (
          <EditingWarningDialog link="/blog">
            <Button className="w-max">
              <ArrowLeft />
              Back
            </Button>
          </EditingWarningDialog>
        ) : (
          <Button asChild className="w-max">
            <Link to={'/blog'}>
              <ArrowLeft />
              Back
            </Link>
          </Button>
        )}
        <Form {...form}>
          <form className="flex gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset className="flex flex-3/4 flex-col gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <TextInput
                    field={field}
                    placeholder="Title"
                    validated
                    className="px-6 placeholder:text-sm"
                  />
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <TextAreaInput
                    field={field}
                    placeholder="Description"
                    className="px-6 placeholder:text-sm"
                    validated
                  />
                )}
              />
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
                          <p className="font-semibold text-[#9B9B9B]">
                            UPLOAD PREVIEW IMAGE
                          </p>
                        </>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mainContent"
                render={({ field }) => <Tiptap field={field} />}
              />
            </fieldset>
            <fieldset className="flex flex-1/4 flex-col justify-between">
              <fieldset className="flex flex-col items-start gap-4">
                <FormField
                  control={form.control}
                  name="categories"
                  render={() => (
                    <FormItem>
                      <div className="flex w-full max-w-[29.3125rem] basis-full flex-wrap items-center gap-1.5">
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
                              name="categories"
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
                                            ? field.onChange([
                                                ...field.value,
                                                `${item.id}`,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  value =>
                                                    value !== `${item.id}`,
                                                ),
                                              );
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
                {id && (
                  <button
                    onClick={() => setOpenDeleteDialog(true)}
                    type="button"
                    className="cursor-pointer text-[10px] font-bold text-[#737373] uppercase underline"
                  >
                    Delete
                  </button>
                )}
              </fieldset>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => setIsPublished(false)}
                  className="bg-[#305B43] text-white hover:bg-[#305B43]/80"
                >
                  Save as draft
                </Button>
                <Button onClick={() => setIsPublished(true)}>Publish</Button>
              </div>
            </fieldset>
          </form>
        </Form>
      </div>
    </>
  );
};

export default CreateBlog;

const SelectCategory = (props: {
  setOpen: Dispatch<SetStateAction<boolean>>;
  open: boolean;
  blogData: z.infer<typeof formSchema>;
  isPublished: boolean;
  isDirty: boolean;
}) => {
  const { id } = useParams();
  const { setOpen, open, blogData, isPublished, isDirty } = props;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useSendRequest<Omit<BlogType, 'id'>, any>({
    mutationFn: (data: Omit<BlogType, 'id'>) => MUTATIONS.publishBlog(data),
    errorToast: {
      title: 'Error',
      description: 'Failed to publish blog',
    },
    successToast: {
      title: 'Success',
      description: 'Blog published successfully',
    },
    onSuccessCallback: () => {
      queryClient.invalidateQueries({
        queryKey: ['blogs'],
      });
      navigate('/blog');
    },
  });

  const { mutate: mutateBlog, isPending: isMutationPending } = useSendRequest<
    Omit<BlogType, 'id'>,
    any
  >({
    mutationFn: (data: Omit<BlogType, 'id'>) =>
      MUTATIONS.updateBlog(+id!!, data),
    errorToast: {
      title: 'Error',
      description: 'Failed to publish blog',
    },
    successToast: {
      title: 'Success',
      description: 'Blog published successfully',
    },
    onSuccessCallback: () => {
      queryClient.invalidateQueries({
        queryKey: ['blogs'],
      });
      navigate('/blog');
    },
  });

  const sendRequest = (type: 'news' | 'press') => {
    const idNumArray = blogData.categories.map(Number);

    if (id && isDirty) {
      mutateBlog({
        title: blogData.title,
        description: blogData.description,
        previewImage: blogData.image,
        content: blogData.mainContent,
        isPublished: isPublished,
        type: type,
        categoryIds: idNumArray,
      });
    } else if (id && !isDirty) {
      toast.error(`No changes made to blog`, {
        description: 'Edit blog to proceed',
        className: errorToastClassName,
      });
    }

    if (!id)
      mutate({
        title: blogData.title,
        description: blogData.description,
        previewImage: blogData.image,
        content: blogData.mainContent,
        isPublished: isPublished,
        type: type,
        categoryIds: idNumArray,
      });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex h-64 w-3xs flex-col justify-center bg-[#305B43]">
        <DialogHeader className="sr-only">
          <DialogTitle>Choose a category</DialogTitle>
          <DialogDescription>
            You can choose a category for your blog post.
          </DialogDescription>
        </DialogHeader>
        <Button onClick={() => sendRequest('press')}>PRESS</Button>
        <Button onClick={() => sendRequest('news')}>NEWS</Button>
        {isPending ||
          (isMutationPending && (
            <LoaderPinwheel className="animate-spin self-center text-white" />
          ))}
      </DialogContent>
    </Dialog>
  );
};

const BlogCreateFormSkeleton = () => {
  return (
    <div
      role="status"
      aria-label="loading blog create form"
      className="flex gap-4"
    >
      <fieldset className="flex flex-3/4 flex-col gap-6">
        {/* Title */}
        <Skeleton className="h-8 w-2/3 animate-pulse self-start rounded bg-[#E6EFE6]" />

        {/* Description */}
        <Skeleton className="h-28 w-full animate-pulse rounded bg-[#E6EFE6]" />

        {/* Image upload box */}
        <Skeleton className="h-[18.1875rem] basis-full animate-pulse rounded-[10px] bg-[#E6EFE6]" />

        {/* Rich editor area */}
        <Skeleton className="h-64 w-full animate-pulse rounded bg-[#E6EFE6]" />
      </fieldset>

      <fieldset className="flex flex-1/4 flex-col justify-between">
        <div className="flex flex-col gap-4">
          {/* Categories label */}
          <Skeleton className="h-5 w-32 animate-pulse rounded bg-[#E6EFE6]" />

          {/* Categories chips */}
          <div className="flex flex-wrap gap-2">
            {Array(8)
              .fill(null)
              .map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-5 w-16 animate-pulse rounded bg-[#E6EFE6]"
                />
              ))}
          </div>

          {/* Delete button placeholder */}
          <Skeleton className="h-6 w-20 animate-pulse rounded bg-[#E6EFE6]" />
        </div>

        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-full animate-pulse rounded bg-[#E6EFE6]" />
          <Skeleton className="h-10 w-full animate-pulse rounded bg-[#E6EFE6]" />
        </div>
      </fieldset>
    </div>
  );
};
