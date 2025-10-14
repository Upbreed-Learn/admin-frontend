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
import { items } from '@/projects/add-new-course';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import z from 'zod';
import Tiptap from './text-editor';

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
  items: z.array(z.string()).refine(value => value.some(item => item), {
    message: 'You have to select at least one item.',
  }),
});

const CreateBlog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [blogData, setBlogData] = useState<z.infer<typeof formSchema>>({
    title: '',
    description: '',
    mainContent: '',
    items: [],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      mainContent: '',
      items: [],
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setIsOpen(true);
    setBlogData(data);
  };

  return (
    <>
      <SelectCategory setOpen={setIsOpen} open={isOpen} blogData={blogData} />
      <div className="flex flex-col gap-7">
        <Button asChild className="w-max">
          <Link to={'/blog'}>
            <ArrowLeft />
            Back
          </Link>
        </Button>
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
                name="mainContent"
                render={({ field }) => <Tiptap field={field} />}
              />
            </fieldset>
            <fieldset className="flex flex-1/4 flex-col justify-between">
              <fieldset className="flex flex-col items-start gap-4">
                <FormField
                  control={form.control}
                  name="items"
                  render={() => (
                    <FormItem>
                      <div className="flex w-full max-w-[29.3125rem] basis-full flex-wrap items-center gap-1.5">
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
                <button
                  type="button"
                  className="cursor-pointer text-[10px] font-bold text-[#737373] uppercase underline"
                >
                  Delete
                </button>
              </fieldset>
              <div className="flex flex-col gap-3">
                <Button className="bg-[#305B43] text-white hover:bg-[#305B43]/80">
                  Save as draft
                </Button>
                <Button>Publish</Button>
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
}) => {
  const { setOpen, open, blogData } = props;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex h-64 w-3xs flex-col justify-center bg-[#305B43]">
        <DialogHeader className="sr-only">
          <DialogTitle>Choose a category</DialogTitle>
          <DialogDescription>
            You can choose a category for your blog post.
          </DialogDescription>
        </DialogHeader>
        <Button onClick={() => console.log('PRESS', blogData)}>PRESS</Button>
        <Button onClick={() => console.log('NEWS', blogData)}>NEWS</Button>
      </DialogContent>
    </Dialog>
  );
};
