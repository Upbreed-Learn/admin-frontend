import { mergeAttributes, Node } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from '@tiptap/react';
import Image from '@tiptap/extension-image';
import { AlignCenter, AlignLeft, AlignRight, ChevronLeft, ChevronRight, GripVertical, Maximize2, Plus, Trash2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Images and galleries for news / press posts.
 * Each one carries where it sits (left, centre, right or full width) and how big it is, as plain
 * classes + data attributes, so the website shows the post exactly as it looked in the editor.
 */
export type Align = 'left' | 'center' | 'right' | 'full';
export type Size = 'sm' | 'md' | 'lg';

const ALIGNS: { value: Align; label: string; icon: typeof AlignLeft }[] = [
  { value: 'left', label: 'Left, text wraps', icon: AlignLeft },
  { value: 'center', label: 'Centre', icon: AlignCenter },
  { value: 'right', label: 'Right, text wraps', icon: AlignRight },
  { value: 'full', label: 'Full width', icon: Maximize2 },
];
const SIZES: { value: Size; label: string }[] = [
  { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },
  { value: 'lg', label: 'L' },
];
export const mediaClass = (align: Align, size: Size) => `ub-media ub-align-${align} ub-size-${size}`;

/** Toolbar that floats over a selected image or gallery. */
function MediaToolbar(props: {
  align: Align;
  size: Size;
  onChange: (attrs: Partial<{ align: Align; size: Size }>) => void;
  onDelete: () => void;
  children?: React.ReactNode;
}) {
  const { align, size, onChange, onDelete, children } = props;
  const btn = 'grid size-7 cursor-pointer place-items-center rounded-md text-white hover:bg-white/15';
  return (
    <div contentEditable={false} className="absolute -top-11 left-1/2 z-20 flex -translate-x-1/2 items-center gap-0.5 rounded-lg bg-[#00230F] p-1 shadow-lg">
      <span data-drag-handle className={cn(btn, 'cursor-grab')} title="Drag to move">
        <GripVertical className="size-4" />
      </span>
      <span className="mx-0.5 h-5 w-px bg-white/20" />
      {ALIGNS.map(a => (
        <button key={a.value} type="button" title={a.label} onClick={() => onChange({ align: a.value })} className={cn(btn, align === a.value && 'bg-[#D0EA50] text-[#00230F] hover:bg-[#D0EA50]')}>
          <a.icon className="size-4" />
        </button>
      ))}
      {align !== 'full' && (
        <>
          <span className="mx-0.5 h-5 w-px bg-white/20" />
          {SIZES.map(s => (
            <button
              key={s.value}
              type="button"
              title={`Size ${s.label}`}
              onClick={() => onChange({ size: s.value })}
              className={cn(btn, 'text-xs font-bold', size === s.value && 'bg-[#D0EA50] text-[#00230F] hover:bg-[#D0EA50]')}
            >
              {s.label}
            </button>
          ))}
        </>
      )}
      {children}
      <span className="mx-0.5 h-5 w-px bg-white/20" />
      <button type="button" title="Remove" onClick={onDelete} className={cn(btn, 'hover:bg-red-500')}>
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

// ---------- Single image ----------
function ImageView({ node, updateAttributes, deleteNode, selected }: ReactNodeViewProps) {
  const { src, alt, align, size, caption } = node.attrs as { src: string; alt: string; align: Align; size: Size; caption: string };
  return (
    <NodeViewWrapper as="figure" className={cn(mediaClass(align, size), 'relative', selected && 'ub-selected')} data-drag-handle>
      {selected && <MediaToolbar align={align} size={size} onChange={updateAttributes} onDelete={deleteNode} />}
      <img src={src} alt={alt ?? ''} draggable={false} />
      <input
        contentEditable={false}
        value={caption ?? ''}
        onChange={e => updateAttributes({ caption: e.target.value })}
        placeholder="Add a caption (optional)"
        className="ub-caption-input"
      />
    </NodeViewWrapper>
  );
}

export const PositionedImage = Image.extend({
  name: 'image',
  draggable: true,
  inline: false,
  group: 'block',
  addAttributes() {
    return {
      ...this.parent?.(),
      align: { default: 'center', parseHTML: el => el.closest('figure')?.getAttribute('data-align') ?? el.getAttribute('data-align') ?? 'center' },
      size: { default: 'lg', parseHTML: el => el.closest('figure')?.getAttribute('data-size') ?? el.getAttribute('data-size') ?? 'lg' },
      caption: { default: '', parseHTML: el => el.closest('figure')?.querySelector('figcaption')?.textContent ?? '' },
    };
  },
  parseHTML() {
    return [{ tag: 'figure[data-type="image"] img' }, { tag: 'img[src]' }];
  },
  renderHTML({ HTMLAttributes, node }) {
    const { align, size, caption } = node.attrs as { align: Align; size: Size; caption: string };
    const img = ['img', mergeAttributes({ src: HTMLAttributes.src, alt: HTMLAttributes.alt ?? '', loading: 'lazy' })];
    return [
      'figure',
      { 'data-type': 'image', 'data-align': align, 'data-size': size, class: mediaClass(align, size) },
      img,
      ...(caption ? [['figcaption', {}, caption]] : []),
    ] as never;
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },
});

// ---------- Gallery (slides) ----------
type Slide = { src: string; alt?: string };

function GalleryView({ node, updateAttributes, deleteNode, selected, extension }: ReactNodeViewProps) {
  const { images, align, size, caption } = node.attrs as { images: Slide[]; align: Align; size: Size; caption: string };
  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const upload = (extension.options as { upload: (f: File) => Promise<string> }).upload;
  const current = Math.min(i, Math.max(0, images.length - 1));

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) urls.push(await upload(f));
      updateAttributes({ images: [...images, ...urls.map(src => ({ src }))] });
      setI(images.length);
    } finally {
      setBusy(false);
    }
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    updateAttributes({ images: next });
    setI(to);
  };

  return (
    <NodeViewWrapper as="figure" className={cn(mediaClass(align, size), 'ub-gallery relative', selected && 'ub-selected')} data-drag-handle>
      {selected && (
        <MediaToolbar align={align} size={size} onChange={updateAttributes} onDelete={deleteNode}>
          <span className="mx-0.5 h-5 w-px bg-white/20" />
          <button type="button" title="Add slides" onClick={() => input.current?.click()} className="flex h-7 cursor-pointer items-center gap-1 rounded-md px-2 text-xs font-semibold text-[#D0EA50] hover:bg-white/15">
            <Plus className="size-3.5" /> Slides
          </button>
        </MediaToolbar>
      )}
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden onChange={e => add(e.target.files).finally(() => (e.target.value = ''))} />
      <div className="ub-gallery-stage" contentEditable={false}>
        {images.length ? (
          <img src={images[current].src} alt={images[current].alt ?? ''} draggable={false} />
        ) : (
          <button type="button" onClick={() => input.current?.click()} className="grid h-56 w-full cursor-pointer place-items-center text-sm text-[#737373]">
            Click to add slides
          </button>
        )}
        {images.length > 1 && (
          <>
            <button type="button" className="ub-gallery-nav ub-prev" onClick={() => setI((current - 1 + images.length) % images.length)} aria-label="Previous slide">
              <ChevronLeft />
            </button>
            <button type="button" className="ub-gallery-nav ub-next" onClick={() => setI((current + 1) % images.length)} aria-label="Next slide">
              <ChevronRight />
            </button>
            <span className="ub-gallery-count">
              {current + 1} / {images.length}
            </span>
          </>
        )}
        {busy && <span className="absolute inset-0 grid place-items-center bg-black/40 text-sm font-semibold text-white">Uploading…</span>}
      </div>
      {/* Thumbnails: click to view, arrows to reorder, x to remove. */}
      {selected && images.length > 0 && (
        <div contentEditable={false} className="mt-2 flex flex-wrap gap-2">
          {images.map((s, n) => (
            <div key={`${s.src}-${n}`} className={cn('group relative size-16 overflow-hidden rounded-md ring-2', n === current ? 'ring-[#305B43]' : 'ring-transparent')}>
              <img src={s.src} alt="" className="size-full cursor-pointer object-cover" onClick={() => setI(n)} />
              <div className="absolute inset-x-0 bottom-0 hidden justify-between bg-black/60 group-hover:flex">
                <button type="button" className="cursor-pointer p-0.5 text-white" onClick={() => move(n, n - 1)} aria-label="Move left">
                  <ChevronLeft className="size-3" />
                </button>
                <button type="button" className="cursor-pointer p-0.5 text-white" onClick={() => updateAttributes({ images: images.filter((_, j) => j !== n) })} aria-label="Remove slide">
                  <X className="size-3" />
                </button>
                <button type="button" className="cursor-pointer p-0.5 text-white" onClick={() => move(n, n + 1)} aria-label="Move right">
                  <ChevronRight className="size-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <input
        contentEditable={false}
        value={caption ?? ''}
        onChange={e => updateAttributes({ caption: e.target.value })}
        placeholder="Add a caption (optional)"
        className="ub-caption-input"
      />
    </NodeViewWrapper>
  );
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    gallery: { insertGallery: (images: Slide[]) => ReturnType };
  }
}

export const Gallery = Node.create<{ upload: (f: File) => Promise<string> }>({
  name: 'gallery',
  group: 'block',
  atom: true,
  draggable: true,
  addOptions() {
    return { upload: async () => '' };
  },
  addAttributes() {
    return {
      images: {
        default: [] as Slide[],
        parseHTML: el => Array.from(el.querySelectorAll('img')).map(img => ({ src: img.getAttribute('src') ?? '', alt: img.getAttribute('alt') ?? '' })),
        renderHTML: () => ({}),
      },
      align: { default: 'full', parseHTML: el => el.getAttribute('data-align') ?? 'full', renderHTML: () => ({}) },
      size: { default: 'lg', parseHTML: el => el.getAttribute('data-size') ?? 'lg', renderHTML: () => ({}) },
      caption: { default: '', parseHTML: el => el.querySelector('figcaption')?.textContent ?? '', renderHTML: () => ({}) },
    };
  },
  parseHTML() {
    return [{ tag: 'figure[data-type="gallery"]' }];
  },
  renderHTML({ node }) {
    const { images, align, size, caption } = node.attrs as { images: Slide[]; align: Align; size: Size; caption: string };
    // A plain, swipeable strip: the website adds arrows and dots on top.
    return [
      'figure',
      { 'data-type': 'gallery', 'data-align': align, 'data-size': size, class: `${mediaClass(align, size)} ub-gallery` },
      ['div', { class: 'ub-gallery-track' }, ...images.map(s => ['img', { src: s.src, alt: s.alt ?? '', loading: 'lazy' }])],
      ...(caption ? [['figcaption', {}, caption]] : []),
    ] as never;
  },
  addCommands() {
    return {
      insertGallery:
        images =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { images } }),
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(GalleryView);
  },
});
