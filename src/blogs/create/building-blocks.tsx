import { useState, type DragEvent, type FC } from 'react';
import {
  ImageIcon,
  Link2,
  Link2Icon,
  Play,
  Trash2,
  TypeIcon,
} from 'lucide-react';
import GridIcon from '@/assets/jsx-icons/grid-icon';

export type ItemType = 'image' | 'text' | 'grid' | 'video' | 'link';

interface DragItem {
  type: ItemType;
  icon: FC<{
    size: number;
    className?: string;
    width?: string;
    height?: string;
  }>;
  label: string;
}

export interface CanvasComponent {
  id: number;
  type: ItemType;
}

// Constants
const ITEM_TYPES = {
  IMAGE: 'image' as const,
  TEXT: 'text' as const,
  GRID: 'grid' as const,
  VIDEO: 'video' as const,
  LINK: 'link' as const,
};

export const DRAG_ITEMS: DragItem[] = [
  { type: ITEM_TYPES.IMAGE, icon: ImageIcon, label: 'Image' },
  { type: ITEM_TYPES.TEXT, icon: TypeIcon, label: 'Text' },
  { type: ITEM_TYPES.GRID, icon: GridIcon, label: 'Photo Grid' },
  { type: ITEM_TYPES.VIDEO, icon: Play, label: 'Video / Audio' },
  { type: ITEM_TYPES.LINK, icon: Link2Icon, label: 'Hyperlink' },
];

interface CanvasProps {
  components: CanvasComponent[];
  addComponent: (type: ItemType) => void;
  removeComponent: (id: number) => void;
}

interface CanvasComponentItemProps {
  type: ItemType;
  id: number;
  remove: () => void;
}

interface DraggableItemProps {
  item: DragItem;
  onDragStart: () => void;
}

export const DraggableItem = (props: DraggableItemProps) => {
  const { item, onDragStart } = props;
  const Icon = item.icon;

  return (
    <div
      draggable
      onDragStart={(e: DragEvent<HTMLDivElement>) => {
        e.dataTransfer!.effectAllowed = 'copy';
        e.dataTransfer!.setData('text/plain', item.type);
        onDragStart();
      }}
      className="flex h-[4.1875rem] cursor-grab flex-col items-center justify-center gap-1.5 rounded-md bg-[#D9D9D9] text-[9px]/4"
      //   className="flex h-28 cursor-move flex-col items-center justify-center gap-1.5 rounded-md bg-gray-300 text-xs transition hover:bg-gray-400"
    >
      <Icon size={24} className="text-gray-600" />
      <span className="text-center">{item.label}</span>
    </div>
  );
};

export const CanvasComponentItem = (props: CanvasComponentItemProps) => {
  const { type, remove } = props;
  const [textContent, setTextContent] = useState<string>(
    'Edit your text here...',
  );

  return (
    <div className="relative mb-4 rounded border border-gray-200 bg-white p-3 shadow">
      <button
        type="button"
        onClick={remove}
        className="absolute top-2 right-2 p-1 text-gray-500 transition hover:text-red-500"
        title="Remove"
      >
        <Trash2 size={16} />
      </button>

      {type === ITEM_TYPES.IMAGE && (
        <div className="flex flex-col items-center gap-2 py-8">
          <ImageIcon size={32} className="text-gray-400" />
          <span className="text-xs text-gray-500">Image Placeholder</span>
        </div>
      )}

      {type === ITEM_TYPES.TEXT && (
        <div className="min-h-20">
          <textarea
            value={textContent}
            onChange={e => setTextContent(e.target.value)}
            className="w-full resize-none rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
            rows={4}
          />
        </div>
      )}

      {type === ITEM_TYPES.GRID && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 rounded bg-gray-300"></div>
            ))}
          </div>
          <span className="block text-center text-xs text-gray-500">
            Photo Grid
          </span>
        </div>
      )}

      {type === ITEM_TYPES.VIDEO && (
        <div className="flex flex-col items-center gap-2 py-8">
          <Play size={32} className="text-gray-400" />
          <span className="text-xs text-gray-500">Video/Audio Placeholder</span>
        </div>
      )}

      {type === ITEM_TYPES.LINK && (
        <div className="flex flex-col items-center gap-2 py-8">
          <Link2 size={32} className="text-gray-400" />
          <span className="text-xs text-gray-500">Hyperlink Placeholder</span>
        </div>
      )}
    </div>
  );
};

export const Canvas = (props: CanvasProps) => {
  const { components, addComponent, removeComponent } = props;
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#999';
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.borderColor = '#ccc';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#ccc';
    const type = e.dataTransfer?.getData('text/plain') as ItemType;
    if (type) addComponent(type);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      //   className="h-96 flex-3/4 overflow-auto rounded border-2 border-dashed border-gray-300 bg-gray-100 p-4"
      className="h-[36.5rem] flex-3/4 overflow-auto rounded bg-[#D9D9D980]"
    >
      {components.length === 0 && (
        <div className="flex items-center justify-center gap-10 pt-44 [&_span]:text-[9.84px]/4 [&>div]:flex [&>div]:flex-col [&>div]:items-center [&>div]:gap-1.5">
          <div>
            <ImageIcon size={26} className="text-[#9C9C9C]" />
            <span>Image</span>
          </div>
          <div>
            <TypeIcon size={26} className="text-[#9C9C9C]" />
            <span>Text</span>
          </div>
          <div>
            <GridIcon width="26" height="26" />
            <span>Photo Grid</span>
          </div>
          <div>
            <Play size={26} className="text-[#9C9C9C]" />
            <span>Video / Audio</span>
          </div>
          <div>
            <Link2Icon size={26} className="text-[#9C9C9C]" />
            <span>Hyperlink</span>
          </div>
        </div>
      )}
      {components.map(comp => (
        <CanvasComponentItem
          key={comp.id}
          type={comp.type}
          id={comp.id}
          remove={() => removeComponent(comp.id)}
        />
      ))}
    </div>
  );
};
