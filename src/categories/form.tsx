import ImageSolid from '@/assets/jsx-icons/image-solid';
import { Button } from '@/components/ui/button';
import TextInput from '@/components/ui/custom/input';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { CategoryType } from '@/lib/constants';
import useSendRequest from '@/lib/hooks/useSendRequest';
import { cn } from '@/lib/utils';
import { MUTATIONS } from '@/queries';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Full Name must be at least 1 characters.',
  }),
  image: z
    .union([
      // SVG URL
      z
        .url('Must be a valid URL')
        .refine(url => url.endsWith('.svg') || url.includes('image/svg+xml'), {
          message: 'URL must point to an SVG image.',
        }),

      // SVG File upload
      z
        .any()
        .refine(
          file =>
            !file ||
            (file instanceof File &&
              file.size <= 10 * 1024 * 1024 &&
              file.type === 'image/svg+xml'),
          {
            message: 'Please upload an SVG file not more than 10MB.',
          },
        ),
    ])
    .optional(),
});

const CategoriesForm = (props: {
  page: number;
  categoryId?: string;
  categories?: CategoryType[];
}) => {
  const { categoryId, page, categories } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const filterCategories = categories?.filter(
    category => category.id === categoryId,
  );

  const queryClient = useQueryClient();

  const { mutate: editMutate, isPending: editIsPending } = useSendRequest<
    any,
    any
  >({
    mutationFn: (data: { name: string; icon?: File[] }) =>
      MUTATIONS.editCategory(data, Number(categoryId)),
    errorToast: {
      title: 'Error',
      description: 'Failed to update category',
    },
    successToast: {
      title: 'Success',
      description: 'Category updated successfully',
    },
    onSuccessCallback: () => {
      queryClient.invalidateQueries({
        queryKey: ['categories', { page, limit: 10 }],
      });
    },
  });

  const { mutate, isPending } = useSendRequest<
    { name: string; icon?: File[] },
    any
  >({
    mutationFn: (data: { name: string; icon?: File[] }) =>
      MUTATIONS.createCategory(data),
    errorToast: {
      title: 'Error',
      description: 'Failed to create category',
    },
    successToast: {
      title: 'Success',
      description: 'Category created successfully',
    },
    onSuccessCallback: () => {
      form.reset();
      queryClient.invalidateQueries({
        queryKey: ['categories', { page, limit: 10 }],
      });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: categoryId ? filterCategories?.[0].name : '',
      image: categoryId ? filterCategories?.[0].icon : undefined,
    },
  });

  useEffect(() => {
    if (categoryId) {
      form.reset({
        name: filterCategories?.[0].name,
        image: filterCategories?.[0].icon,
      });
    }
  }, [categoryId]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (categoryId) {
      editMutate({
        name: data.name,
        icon: data.image,
      });
    } else {
      mutate({
        name: data.name,
        icon: data.image,
      });
    }
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full max-w-[34.3125rem] flex-col gap-6 py-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <TextInput field={field} validated label="Name the category" />
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field: { value, onChange } }) => (
            <FormItem>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-[3.1875rem] w-16 flex-col items-center justify-center gap-3 rounded-[10px] bg-[#D9D9D9]',
                  )}
                  onClick={() => inputRef.current?.click()}
                >
                  <Input
                    ref={inputRef}
                    type="file"
                    accept="image/svg+xml,.svg"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];

                      if (
                        file &&
                        file.size <= 10 * 1024 * 1024 &&
                        (file.type === 'image/svg+xml' ||
                          file.name.toLowerCase().endsWith('.svg'))
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
                      className="size-16 rounded object-cover"
                    />
                  ) : (
                    <ImageSolid />
                  )}
                </div>
                <p className="">click here to upload svg file</p>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="cursor-pointer self-end"
          disabled={isPending}
        >
          {categoryId
            ? editIsPending
              ? 'Updating...'
              : 'Update Category'
            : isPending
              ? 'Creating...'
              : 'Create New Category'}
        </Button>
      </form>
    </Form>
  );
};

export default CategoriesForm;
