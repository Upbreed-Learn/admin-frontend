import { https } from '@/lib/https';
import { Upload as UploadIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { useParams } from 'react-router';
import { toast } from 'sonner';
import * as tus from 'tus-js-client';

/**
 * "Upload video" button: the API creates the video on Bunny Stream and signs the upload;
 * the file then goes straight from this browser to Bunny (resumable, with progress).
 * When done, the new Bunny video id is put into the form.
 */
export default function VideoUploadButton(props: { title: string; onUploaded: (videoId: string) => void }) {
  const { id: courseId } = useParams();
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const upload = useRef<tus.Upload | null>(null);

  const start = async (file: File) => {
    if (!courseId) {
      toast.error('Save the course first, then upload videos.');
      return;
    }
    try {
      setProgress(0);
      const { data } = await https.post(`/course/${courseId}/videos/upload`, { title: props.title || file.name });
      upload.current = new tus.Upload(file, {
        endpoint: data.endpoint,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        chunkSize: 50 * 1024 * 1024,
        headers: {
          AuthorizationSignature: data.signature,
          AuthorizationExpire: String(data.expires),
          VideoId: data.videoId,
          LibraryId: String(data.libraryId),
        },
        metadata: { filetype: file.type, title: props.title || file.name },
        onProgress: (sent, total) => setProgress(Math.round((sent / total) * 100)),
        onError: err => {
          setProgress(null);
          toast.error('Video upload failed', { description: err.message });
        },
        onSuccess: () => {
          setProgress(null);
          props.onUploaded(data.videoId);
          toast.success('Video uploaded', { description: 'Bunny is processing it; it will be playable in a few minutes. Save the course to keep it.' });
        },
      });
      upload.current.start();
    } catch (e: any) {
      setProgress(null);
      toast.error('Could not start the upload', { description: e?.response?.data?.message ?? e?.message });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={input}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) start(f);
          e.target.value = '';
        }}
      />
      {progress === null ? (
        <button type="button" onClick={() => input.current?.click()} className="flex cursor-pointer items-center gap-1 rounded-md bg-[#305B43] px-3 py-1.5 text-xs font-semibold text-white">
          <UploadIcon className="size-3.5" /> Upload video
        </button>
      ) : (
        <div className="flex items-center gap-2 text-xs">
          <div className="h-2 w-32 overflow-hidden rounded bg-[#E3E3E3]">
            <div className="h-full bg-[#305B43] transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span>{progress}%</span>
          <button
            type="button"
            className="cursor-pointer text-[#737373] underline"
            onClick={() => {
              upload.current?.abort();
              setProgress(null);
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
