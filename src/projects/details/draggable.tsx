'use client';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
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
  type UseFormReturn,
} from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import TextInput from '@/components/ui/custom/input';
import type z from 'zod';
import type { FormSchema } from '.';
import { useRef, useState } from 'react';
import ImageUploadIcon from '@/assets/jsx-icons/image-upload-icon';
import useSendRequest from '@/lib/hooks/useSendRequest';
import { MUTATIONS } from '@/queries';
import VideoUploadButton from './video-upload';

const libraryId = '515933';

export function DraggableSections(props: {
  form: UseFormReturn<z.infer<typeof FormSchema>>;
  fields: Record<'id', string>[];
  move: UseFieldArrayMove;
  remove: UseFieldArrayRemove;
}) {
  const { form, fields, move, remove } = props;
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
function SortableItem(props: {
  field: FieldArrayWithId<z.infer<typeof FormSchema>, 'sections', 'id'>;
  index: number;
  form: UseFormReturn<z.infer<typeof FormSchema>>;
  onDelete: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate, isPending } = useSendRequest<
    { image: File },
    { data: { url: string } }
  >({
    mutationFn: (data: { image: File }) => MUTATIONS.uploadImage(data),
    errorToast: {
      title: 'Error',
      description: 'Failed to upload image',
    },
    successToast: {
      title: 'Success',
      description: 'Image uploaded successfully',
    },
  });

  const { field, index, form, onDelete } = props;
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: field.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const bunnyVideoId = form.watch(`videos.${index}.bunnyVideoId`);

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
            name={`videos.${index}.title`}
            render={({ field }) => (
              <TextInput
                field={field}
                placeholder="Title"
                className="h-auto bg-transparent text-black shadow-none"
                validated
              />
            )}
          />
          <Separator className="bg-[#0000001A]" />
          <FormField
            control={form.control}
            name={`videos.${index}.description`}
            render={({ field }) => (
              <TextInput
                field={field}
                placeholder="Description"
                className="h-auto bg-transparent text-black shadow-none"
                validated
              />
            )}
          />
          <Separator className="bg-[#0000001A]" />
          <FormField
            control={form.control}
            name={`videos.${index}.bunnyVideoId`}
            render={({ field }) => (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <TextInput
                    field={field}
                    placeholder="Bunny Video ID (or upload a file →)"
                    className="h-auto bg-transparent text-black shadow-none"
                    validated
                  />
                </div>
                <VideoUploadButton
                  title={form.watch(`videos.${index}.title`)}
                  onUploaded={videoId => form.setValue(`videos.${index}.bunnyVideoId`, videoId, { shouldValidate: true, shouldDirty: true })}
                />
              </div>
            )}
          />
          <Separator className="bg-[#0000001A]" />
          <FormField
            control={form.control}
            name={`videos.${index}.thumbnailUrl`}
            render={({ field: { value, onChange } }) => (
              <FormItem>
                <ThumbnailPicker
                  value={typeof value === 'string' ? value : ''}
                  uploading={isPending}
                  dragging={isDragging}
                  setDragging={setIsDragging}
                  inputRef={inputRef}
                  onPick={(file, done) =>
                    mutate(
                      { image: file },
                      {
                        onSuccess: data => {
                          onChange(data.data.url);
                          done(true);
                        },
                        onError: () => done(false),
                      },
                    )
                  }
                  onRemove={() => onChange('')}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>
      </fieldset>

      {bunnyVideoId && (
        <div className="relative h-[163px] w-72 overflow-hidden rounded bg-black/8">
          <iframe
            src={`https://iframe.mediadelivery.net/embed/${libraryId}/${bunnyVideoId}`}
            loading="lazy"
            className="absolute inset-0 h-full w-full border-0 object-center"
          />
        </div>
      )}

      <fieldset className="flex gap-6">
        <div
          className={cn(
            'flex flex-col-reverse items-center justify-center gap-5',
            index + 1 === 1 && 'hidden',
          )}
        >
          <button type="button" onClick={onDelete}>
            <Trash2Icon className="text-[#9B9B9B]" />
          </button>

          <div className="flex flex-col items-center gap-[6px]">
            <FormField
              control={form.control}
              name={`videos.${index}.isPublic`}
              render={({ field }) => (
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

const MAX_THUMB_BYTES = 10 * 1024 * 1024;

/** Lesson thumbnail: shows the picture straight away while it uploads, then lets you replace or remove it. */
function ThumbnailPicker({
  value,
  uploading,
  dragging,
  setDragging,
  inputRef,
  onPick,
  onRemove,
}: {
  value: string;
  uploading: boolean;
  dragging: boolean;
  setDragging: (v: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onPick: (file: File, done: (ok: boolean) => void) => void;
  onRemove: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const shown = preview ?? (value || null);

  const take = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('Choose an image (JPG, PNG or WEBP).');
    if (file.size > MAX_THUMB_BYTES) return setError('Image must be 10 MB or smaller.');
    setError(null);
    const local = URL.createObjectURL(file);
    setPreview(local);
    onPick(file, ok => {
      URL.revokeObjectURL(local);
      setPreview(null);
      if (!ok) setError('Upload failed. The previous thumbnail was kept.');
    });
  };

  return (
    <div
      className={cn('flex items-center gap-5 rounded-lg p-1 transition-colors', dragging && 'bg-[#e5e5e5] ring-2 ring-[#305B43]')}
      onDragOver={e => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={e => {
        e.preventDefault();
        setDragging(false);
      }}
      onDrop={e => {
        e.preventDefault();
        setDragging(false);
        take(e.dataTransfer.files[0]);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={e => {
          take(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex aspect-video w-40 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[10px] bg-[#D9D9D9]"
        aria-label={shown ? 'Replace thumbnail' : 'Upload thumbnail'}
      >
        {shown ? <img src={shown} alt="Thumbnail" className="size-full object-cover" /> : <ImageUploadIcon />}
        {uploading && preview && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-[10px] font-semibold text-white">Uploading…</span>
        )}
      </button>
      <div className="flex flex-1 flex-col items-start gap-2">
        <p className="text-xs font-semibold text-black">{shown ? 'THUMBNAIL' : 'UPLOAD THUMBNAIL'}</p>
        <p className="text-[11px] text-[#737373]">{shown ? (uploading && preview ? 'Uploading…' : 'This picture shows before the lesson plays.') : 'Click or drop an image here (16:9 looks best).'}</p>
        {shown && !uploading && (
          <div className="flex gap-2">
            <button type="button" onClick={() => inputRef.current?.click()} className="cursor-pointer rounded-md border border-[#305B43] px-3 py-1 text-[11px] font-semibold text-[#305B43] hover:bg-[#305B43] hover:text-white">
              Replace
            </button>
            <button type="button" onClick={onRemove} className="cursor-pointer rounded-md px-3 py-1 text-[11px] font-semibold text-[#9B9B9B] hover:text-red-600">
              Remove
            </button>
          </div>
        )}
        {error && <p className="text-[11px] text-red-600">{error}</p>}
      </div>
    </div>
  );
}
