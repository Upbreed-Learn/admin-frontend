import SelectInput from '@/components/ui/custom/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormField } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryState } from 'nuqs';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { items } from './add-new-course';
import { Button } from '@/components/ui/button';

const FormSchema = z.object({
  duration: z.string().min(1, { message: 'Duration is required' }),
  tag: z.string().min(1, { message: 'Tag is required' }),
});

const FilterDialog = () => {
  const [filter, setFilter] = useQueryState('filter');

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      duration: '',
      tag: '',
    },
  });

  const tagsOptions = items.map(item => ({
    label: item.label,
    value: item.id,
  }));

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);
  }

  return (
    <Dialog
      open={filter === 'true' ? true : false}
      onOpenChange={() => setFilter(filter === 'true' ? null : 'true')}
    >
      <DialogContent className="w-[380px] px-5 pt-10 pb-7">
        <DialogHeader className="sr-only">
          <DialogTitle>Filter results</DialogTitle>
          <DialogDescription>
            You can filter the results by selecting the filters below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <SelectInput
                  field={field}
                  validated
                  className="w-full"
                  placeholder="Select Duration"
                  options={[
                    { label: 'Less than 1hr', value: '<1hr' },
                    { label: 'Between 1hr and 2hr', value: '1hr-2hr' },
                    { label: 'Between 2hr and 3hr', value: '2hr-3hr' },
                    { label: 'More than 3hr', value: '>3hr' },
                  ]}
                />
              )}
            />
            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => (
                <SelectInput
                  field={field}
                  validated
                  className="w-full"
                  placeholder="Select Tag"
                  options={tagsOptions}
                />
              )}
            />
            <DialogFooter>
              <Button type="button" className="bg-gray-300 hover:bg-gray-300">
                Reset
              </Button>
              <Button type="submit">Apply Filters</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;
