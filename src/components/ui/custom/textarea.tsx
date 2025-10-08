import { useEffect, type ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import type { ControllerRenderProps } from 'react-hook-form';
import { Label } from '../label';
import { FormControl, FormItem, FormLabel, FormMessage } from '../form';
import { Textarea } from '../textarea';

interface TextAreaInputProps extends ComponentProps<'textarea'> {
  field?: ControllerRenderProps<any, any>;
  validated?: boolean;
  label?: string;
  htmlFor?: string;
  containerClassName?: string;
}

const TextAreaInput = (props: TextAreaInputProps) => {
  const {
    field,
    validated,
    label,
    placeholder,
    disabled,
    id,
    htmlFor,
    className,
    containerClassName,
    onChange,
    value,
  } = props;

  useEffect(() => {
    if (validated && !field) {
      throw new Error(
        'Field and FieldState prop is required when validated is set to true',
      );
    }
  }, [validated, field]);

  if (!validated) {
    return (
      <div className={cn('', containerClassName)}>
        {label && <Label htmlFor={htmlFor}>{label}</Label>}
        <Textarea
          id={id}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(className)}
          onChange={onChange}
          value={value}
        />
      </div>
    );
  }

  return (
    <FormItem className={cn('', containerClassName)}>
      {label && <FormLabel className={cn('')}>{label}</FormLabel>}
      <FormControl>
        <Textarea
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'h-[6lh] resize-y border-none bg-[#D9D9D980] px-6 py-4 placeholder:text-xs',
            className,
          )}
          {...field}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

export default TextAreaInput;
