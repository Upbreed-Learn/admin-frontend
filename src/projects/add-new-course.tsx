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
import { Plus } from 'lucide-react';
import TextAreaInput from '@/components/ui/custom/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import ImageUploadIcon from '@/assets/jsx-icons/image-upload-icon';
import { Input } from '@/components/ui/input';
import { useRef, useState } from 'react';

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
  fullName: z.string().min(2, {
    message: 'Full Name must be at least 2 characters.',
  }),
  courseTitle: z.string().min(2, {
    message: 'Course Title must be at least 2 characters.',
  }),
  courseDescription: z.string().min(10, {
    message: 'Course Description must be at least 10 characters.',
  }),
  items: z.array(z.string()).refine(value => value.some(item => item), {
    message: 'You have to select at least one item.',
  }),
  image: z
    .any()
    .refine(
      file =>
        !file ||
        (file instanceof File &&
          file.size <= 10 * 1024 * 1024 &&
          file.type.startsWith('image/')),
      { message: 'Please upload an image file not more than 10MB.' },
    ),
});

const AddNewCourse = () => {
  const [addNewCourse, setAddNewCourse] = useQueryState('addNewCourse');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      courseTitle: '',
      courseDescription: '',
      items: [],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
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
            <fieldset className="relative">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <TextInput
                    field={field}
                    placeholder="Instructor’s Full Name"
                    validated
                  />
                )}
              />
              <Plus
                className={cn(
                  'absolute top-1/2 right-5 -translate-y-1/2',
                  form.formState.errors.fullName && 'top-[1.4rem]',
                )}
                size={16}
              />
            </fieldset>
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
                      {items.map(item => (
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
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={checked => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            item.id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              value => value !== item.id,
                                            ),
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel
                                  className={cn(
                                    'rounded bg-[#F1F1F1] px-1.5 py-1 text-xs/[100%] font-semibold text-[#9C9C9C] uppercase',
                                    field.value?.includes(item.id) &&
                                      'bg-[#D0EA50] text-black',
                                  )}
                                >
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
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
              Create New Course
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewCourse;
