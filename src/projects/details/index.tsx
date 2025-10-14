import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import AddNewCourse, { items } from '../add-new-course';
import { cn } from '@/lib/utils';
import { useRef, useState } from 'react';
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

const UpdateProject = () => {
  return (
    <>
      <AddNewCourse />
      <div className="flex flex-col gap-8 pb-8">
        <div className="flex flex-col gap-12">
          {/* Add Warning modal if form is edited */}
          <Button asChild className="w-max">
            <Link to={'/projects'}>
              <ArrowLeft />
              Back
            </Link>
          </Button>
          <InstructorDetails />
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
    .any()
    .refine(
      file =>
        !file ||
        (file instanceof File &&
          file.size <= 10 * 1024 * 1024 &&
          file.type.startsWith('image/')),
      { message: 'Please upload an image file not more than 10MB.' },
    ),
  sections: z
    .array(sectionSchema)
    .min(1, { message: 'At least one section is required' }),
});

const InstructorDetails = () => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: 'MICHELLE ELEGBE',
      courseTitle: 'BUSINESS DEVELOPMENT',
      courseDescription: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`,
      items: ['government'],
      image: 'https://i.pravatar.cc/150?img=1',
      sections: [
        { title: '', description: '', video: undefined, isPublic: false },
      ],
    },
  });

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

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
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
                                          ? field.onChange([item.id])
                                          : field.onChange([]);
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
            type="button"
            className="text-[10px]/[100%] font-bold text-[#6F6F6F] underline"
          >
            DELETE COURSE
          </button>
          <Button>Update</Button>
        </div>
      </form>
    </Form>
  );
};
