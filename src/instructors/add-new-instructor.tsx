import ImageUploadIcon from '@/assets/jsx-icons/image-upload-icon';
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
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryState } from 'nuqs';
import { useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: 'First Name must be at least 2 characters.',
  }),
  lastName: z.string().min(2, {
    message: 'Last Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  aboutInstructor: z.string().min(10, {
    message: 'About Instructor must be at least 10 characters.',
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

const AddNewInstructor = () => {
  const [addInstructor, setAddInstructor] = useQueryState('addInstructor');
  const [confirm, setConfirm] = useState(false);

  return (
    <Dialog
      open={addInstructor === 'true' ? true : false}
      onOpenChange={() =>
        setAddInstructor(addInstructor === 'true' ? null : 'true')
      }
    >
      <DialogContent className="flex flex-col gap-8">
        <DialogHeader className="sr-only">
          <DialogTitle>AddNewinstructor</DialogTitle>
          <DialogDescription>
            Fill out the form below to add a new instructor.
          </DialogDescription>
        </DialogHeader>
        {!confirm ? (
          <AddInstructorForm confirm={confirm} setConfirm={setConfirm} />
        ) : (
          <Confirm confirm={confirm} setConfirm={setConfirm} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddNewInstructor;

const AddInstructorForm = (props: {
  confirm: boolean;
  setConfirm: Dispatch<SetStateAction<boolean>>;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const { confirm, setConfirm } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      aboutInstructor: '',
      image: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    setConfirm(true);
    console.log(values);
  }

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
            <FormItem className="self-center">
              <div
                className={cn(
                  'flex h-[8.4375rem] w-[8.9375rem] basis-full flex-col items-center justify-center gap-3 rounded-[10px] bg-[#D9D9D9]',
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
        <Button type="submit" className="self-end">
          Save
        </Button>
      </form>
    </Form>
  );
};

const Confirm = (props: {
  confirm: boolean;
  setConfirm: Dispatch<SetStateAction<boolean>>;
}) => {
  const [_, setAddInstructor] = useQueryState('addInstructor');
  const { confirm, setConfirm } = props;

  const handleCancel = () => {
    setAddInstructor(null);
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
        Would you like to create an account for this instructor?
        <br /> <br />
        <span className="text-[#305B43]">“tope.adenola@gmail.com”</span>
      </p>
      <div className="flex justify-center gap-3">
        <Button className="cursor-pointer bg-[#305B43] text-[#D0EA50] hover:bg-[#305B43]/80">
          Send
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
