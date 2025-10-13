import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { DialogDescription } from '@radix-ui/react-dialog';
import { ArrowLeft } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import z from 'zod';
import {
  Canvas,
  DRAG_ITEMS,
  DraggableItem,
  type CanvasComponent,
  type ItemType,
} from './building-blocks';

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
});

const CreateBlog = () => {
  const [canvasComponents, setCanvasComponents] = useState<CanvasComponent[]>(
    [],
  );

  const addComponent = (type: ItemType): void => {
    setCanvasComponents(prev => [
      ...prev,
      { id: Date.now() + Math.random(), type },
    ]);
  };

  const removeComponent = (id: number): void => {
    setCanvasComponents(prev => prev.filter(comp => comp.id !== id));
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // defaultValues: {
    //   fullName: '',
    //   courseTitle: '',
    //   courseDescription: '',
    //   items: [],
    // },
  });
  return (
    <div className="flex flex-col gap-7">
      <Button asChild className="w-max">
        <Link to={'/blog'}>
          <ArrowLeft />
          Back
        </Link>
      </Button>
      <Form {...form}>
        <form
          // onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <fieldset className="flex gap-4">
            {/* <Canvas /> */}
            <Canvas
              components={canvasComponents}
              addComponent={addComponent}
              removeComponent={removeComponent}
            />
            <fieldset className="flex flex-1/4 flex-col justify-between">
              <div className="flex flex-col gap-1 rounded bg-[#D9D9D980] px-3.5 py-4">
                <p className="text-[9px]/4 font-semibold">Add Content</p>
                <div className="grid grid-cols-2 gap-1">
                  {DRAG_ITEMS.map(item => (
                    <div key={item.type}>
                      <DraggableItem item={item} onDragStart={() => {}} />
                    </div>
                  ))}
                  {/* <div className="flex h-[4.1875rem] flex-col items-center justify-center gap-1.5 rounded-md bg-[#D9D9D9] text-[9px]/4">
                    <ImageIcon size={24} className="text-[#9C9C9C]" />
                    <span>Image</span>
                  </div>
                  <div className="flex h-[4.1875rem] flex-col items-center justify-center gap-1.5 rounded-md bg-[#D9D9D9] text-[9px]/4">
                    <TypeIcon size={26} className="text-[#9C9C9C]" />
                    <span>Text</span>
                  </div>
                  <div className="flex h-[4.1875rem] flex-col items-center justify-center gap-1.5 rounded-md bg-[#D9D9D9] text-[9px]/4">
                    <GridIcon width="26" height="26" />
                    <span>Photo Grid</span>
                  </div>
                  <div className="flex h-[4.1875rem] flex-col items-center justify-center gap-1.5 rounded-md bg-[#D9D9D9] text-[9px]/4">
                    <Play size={26} className="text-[#9C9C9C]" />
                    <span>Video / Audio</span>
                  </div>
                  <div className="flex h-[4.1875rem] flex-col items-center justify-center gap-1.5 rounded-md bg-[#D9D9D9] text-[9px]/4">
                    <Link2Icon size={26} className="text-[#9C9C9C]" />
                    <span>Hyperlink</span>
                  </div> */}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <SelectCategory>
                  <Button
                    type="button"
                    className="bg-[#305B43] text-white hover:bg-[#305B43]/80"
                  >
                    Save as draft
                  </Button>
                </SelectCategory>
                <SelectCategory>
                  <Button type="button">Publish</Button>
                </SelectCategory>
              </div>
            </fieldset>
          </fieldset>
          <fieldset className="flex items-start gap-24">
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
            <button
              type="button"
              className="cursor-pointer text-[10px] font-bold text-[#737373] uppercase underline"
            >
              Delete
            </button>
          </fieldset>
        </form>
      </Form>
    </div>
  );
};

export default CreateBlog;

// const Canvas = () => {
//   return (
//     <div className="h-[36.5rem] flex-3/4 overflow-auto rounded bg-[#D9D9D980]">
//       <div className="flex items-center justify-center gap-10 pt-44 [&_span]:text-[9.84px]/4 [&>div]:flex [&>div]:flex-col [&>div]:items-center [&>div]:gap-1.5">
//         <div>
//           <ImageIcon size={26} className="text-[#9C9C9C]" />
//           <span>Image</span>
//         </div>
//         <div>
//           <TypeIcon size={26} className="text-[#9C9C9C]" />
//           <span>Text</span>
//         </div>
//         <div>
//           <GridIcon width="26" height="26" />
//           <span>Photo Grid</span>
//         </div>
//         <div>
//           <Play size={26} className="text-[#9C9C9C]" />
//           <span>Video / Audio</span>
//         </div>
//         <div>
//           <Link2Icon size={26} className="text-[#9C9C9C]" />
//           <span>Hyperlink</span>
//         </div>
//       </div>
//     </div>
//   );
// };

const SelectCategory = (props: { children: ReactNode }) => {
  const { children } = props;
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex h-64 w-3xs flex-col justify-center bg-[#305B43]">
        <DialogHeader className="sr-only">
          <DialogTitle>Choose a category</DialogTitle>
          <DialogDescription>
            You can choose a category for your blog post.
          </DialogDescription>
        </DialogHeader>
        <Button>PRESS</Button>
        <Button>NEWS</Button>
      </DialogContent>
    </Dialog>
  );
};
