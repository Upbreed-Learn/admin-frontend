import z from 'zod';
import logo from '../assets/upbreed-logo.svg';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField } from '@/components/ui/form';
import TextInput from '@/components/ui/custom/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, LoaderPinwheelIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { MUTATIONS } from '@/queries';
import { Toaster } from 'sonner';
import useSendRequest from '@/lib/hooks/useSendRequest';
import { useNavigate } from 'react-router';

const formSchema = z.object({
  email: z.email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(5, {
    message: 'Password must be at least 5 characters.',
  }),
});

const Login = () => {
  const [viewPassword, setViewPassword] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { mutate, isPending } = useSendRequest<
    { email: string; password: string; deviceSignature: string },
    { data: { token: string } }
  >({
    mutationFn: (data: {
      email: string;
      password: string;
      deviceSignature: string;
    }) => MUTATIONS.authLogin(data),
    errorToast: {
      title: 'Error',
      description: 'Authentication failed',
    },
    cookie: {
      name: 'rf',
      getValue: response => response?.data?.token,
    },
    onSuccessCallback: () => {
      navigate('/');
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    // console.log(values);
    mutate({
      email: values.email,
      password: values.password,
      deviceSignature: 'a7b3c9d2-e1f0-4g5h-i6j7-k8l9m0n1o2p3',
    });
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="flex h-screen items-center justify-center">
        <div className="flex w-full max-w-96 flex-col gap-14">
          <div className="flex flex-col gap-3">
            <div className="h-[2.15rem] w-[9.5625rem]">
              <img src={logo} alt="upbreed logo" className="size-full" />
            </div>
            <h1 className="text-xs/5 font-semibold text-[#9B9B9B]">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px]/[100%] font-semibold text-[#9B9B9B] uppercase">
                WELCOME BACK
              </p>
              <p className="text-[10px]/[100%] font-semibold text-[#00230F]">
                Login to Continue
              </p>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-5"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <TextInput
                      field={field}
                      placeholder="Email"
                      validated
                      type="email"
                      className="rounded-[10px] border-1 border-[#9B9B9B] bg-[#47474700]"
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <fieldset className="relative">
                      <TextInput
                        field={field}
                        placeholder="Password"
                        validated
                        type={viewPassword ? 'text' : 'password'}
                        className="rounded-[10px] border-1 border-[#9B9B9B] bg-[#47474700]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setViewPassword(prev =>
                            prev === false ? true : false,
                          )
                        }
                        className={cn(
                          'absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer',
                          form.formState.errors.password && 'top-6',
                        )}
                      >
                        {!viewPassword ? (
                          <Eye size={16} className="text-[#BEBEBE]" />
                        ) : (
                          <EyeOff size={16} className="text-[#BEBEBE]" />
                        )}
                      </button>
                    </fieldset>
                  )}
                />

                <Button disabled={isPending} type="submit">
                  {isPending ? (
                    <LoaderPinwheelIcon className="animate-spin" />
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
