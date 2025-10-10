import { cn } from '@/lib/utils';
// import { FormControl, FormItem, FormLabel, FormMessage } from './form';
import type { ComponentProps, ReactNode } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select';
import { FormControl, FormItem, FormLabel, FormMessage } from '../form';
import type { ControllerRenderProps } from 'react-hook-form';

export type SelectOption = {
  value: string;
  label: string;
};

interface SelectInputprops extends ComponentProps<'select'> {
  field?: ControllerRenderProps<any, any>;
  placeholder?: string | ReactNode;
  options: SelectOption[];
  className?: string;
  validated?: boolean;
  label?: string;
  setChange?: (value: string) => void;
  selectValue?: string;
  selectedDefault?: string;
  isFilter?: boolean;
  //   children?: ReactNode;
  selectClassName?: string;
  contentClassName?: string;
  isPending?: boolean;
}

const SelectInput = (props: SelectInputprops) => {
  const {
    placeholder,
    options,
    className,
    validated,
    isFilter,
    field,
    label,
    disabled,
    setChange,
    selectValue,
    selectedDefault,
    // children,
    selectClassName,
    contentClassName,
    // isPending,
  } = props;

  if (!validated) {
    return (
      <Select
        value={selectValue}
        onValueChange={setChange}
        defaultValue={selectedDefault}
      >
        <SelectTrigger
          isFilter={isFilter}
          className={cn(
            // 'border-[#E9EAEB] text-sm leading-[100%] font-light text-[#181D27] shadow-none placeholder:text-[#717680]',
            className,
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className={cn('space-y-3', contentClassName)}>
          {options.map(option => (
            <SelectItem
              key={option.value}
              value={option.value}
              className={cn('capitalize', selectClassName)}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <FormItem className={cn('flex flex-col gap-[6px]')}>
      {label && (
        <FormLabel className="text-base leading-[100%] text-[#E4E4E6]">
          {label}
        </FormLabel>
      )}
      {/* {isPending ? (
        <p className="pt-6 text-lg leading-[100%] text-[#62646C] uppercase">
          Trying to find reasons...
        </p>
      ) : !options || options.length === 0 ? (
        <p className="pt-6 text-lg leading-[100%] text-[#62646C] uppercase">
          No Reasons found!
        </p>
      ) : ( */}
      <Select
        disabled={disabled}
        onValueChange={field?.onChange}
        defaultValue={field?.value}
      >
        <FormControl>
          <SelectTrigger className={cn('', className)}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
        </FormControl>
        <SelectContent className="">
          {options?.map(option => (
            <SelectItem key={option.value} value={option.value} className="">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* )} */}

      <FormMessage />
    </FormItem>
  );
};

export default SelectInput;
