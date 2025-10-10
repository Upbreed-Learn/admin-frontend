'use client';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  //   arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2Icon } from 'lucide-react';
import {
  type FieldArrayWithId,
  type UseFieldArrayMove,
  type UseFieldArrayRemove,
} from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { FormField } from '@/components/ui/form';
import UploadVideo from '@/assets/jsx-icons/upload-video';
import TextInput from '@/components/ui/custom/input';

// interface Section {
//   id: string;
//   title: string;
//   description: string;
//   isPublic: boolean;
//   video?: string | File;
// }

export function DraggableSections(props: {
  form: any;
  fields: FieldArrayWithId<
    {
      fullName: string;
      courseTitle: string;
      courseDescription: string;
      items: string[];
      image: any;
      sections: {
        title: string;
        description: string;
        isPublic: boolean;
        video?: string | File | undefined;
      }[];
    },
    'sections',
    'id'
  >[];
  move: UseFieldArrayMove;
  remove: UseFieldArrayRemove;
}) {
  const { form, fields, move, remove } = props;
  //   const form = useFormContext();
  //   const { fields, move, remove } = useFieldArray({
  //     control: form.control,
  //     name: 'sections',
  //   })

  // Sensors for drag detection
  const sensors = useSensors(useSensor(PointerSensor));

  // Handle reorder
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex(item => item.id === active.id);
      const newIndex = fields.findIndex(item => item.id === over?.id);
      move(oldIndex, newIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={fields.map(f => f.id)}
        strategy={verticalListSortingStrategy}
      >
        {fields.map((field, index) => (
          <SortableItem
            key={field.id}
            field={field}
            index={index}
            form={form}
            onDelete={() => remove(index)}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}

// --- Sortable Item ---
function SortableItem({ field, index, form, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: field.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <fieldset
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="relative flex w-full gap-5 border-b border-[#0000001A] pb-3"
    >
      {/* Drag handle */}
      <div
        {...listeners}
        className="absolute top-1/2 -left-5 flex -translate-y-1/2 cursor-grab items-center justify-center px-1 active:cursor-grabbing"
        title="Drag to reorder"
      >
        <GripVertical className="size-4 text-[#9B9B9B]" />
      </div>

      <fieldset className="flex basis-full gap-1.5">
        <span className="text-[10px]/[100%] font-medium text-[#9B9B9B]">
          {index + 1}.
        </span>
        <fieldset className="flex basis-full flex-col gap-3 rounded bg-[#D9D9D980] px-4 pt-4 pb-3 text-xs/[100%] font-medium text-[#C8C8C8]">
          <FormField
            control={form.control}
            name={`sections.${index}.title`}
            render={({ field }: any) => (
              <TextInput
                field={field}
                placeholder="Title"
                className="h-auto bg-transparent shadow-none"
                validated
              />
            )}
          />
          <Separator className="bg-[#0000001A]" />
          <FormField
            control={form.control}
            name={`sections.${index}.description`}
            render={({ field }: any) => (
              <TextInput
                field={field}
                placeholder="Description"
                className="h-auto bg-transparent shadow-none"
                validated
              />
            )}
          />
        </fieldset>
      </fieldset>

      <fieldset className="flex gap-6">
        <div
          className="flex !w-40 flex-col items-center justify-center gap-1.5 overflow-hidden rounded bg-[#D9D9D9]"
          onClick={() => {
            // trigger upload logic here
          }}
        >
          <UploadVideo />
          <p className="text-[7px]/[100%] text-[#949494]">Upload Video</p>
        </div>

        <div
          className={cn('flex items-center gap-5', index + 1 === 1 && 'hidden')}
        >
          <button type="button" onClick={onDelete}>
            <Trash2Icon className="text-[#9B9B9B]" />
          </button>

          <div className="flex flex-col items-center gap-[6px]">
            <FormField
              control={form.control}
              name={`sections.${index}.isPublic`}
              render={({ field }: any) => (
                <>
                  <Switch
                    id={`public-${index}`}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label
                    htmlFor={`public-${index}`}
                    className="text-center text-xs/[100%] font-medium text-[#9B9B9B]"
                  >
                    Make video go public
                  </Label>
                </>
              )}
            />
          </div>
        </div>
      </fieldset>
    </fieldset>
  );
}
