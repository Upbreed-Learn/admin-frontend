import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Youtube from '@tiptap/extension-youtube';
import Heading from '@tiptap/extension-heading';
import FileHandler from '@tiptap/extension-file-handler';
import Link from '@tiptap/extension-link';
import { Gallery, PositionedImage } from './media-nodes';
import { Button } from '@/components/ui/button';
import { ImageIcon, Heading1, Heading2, Heading3, GalleryHorizontal } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type z from 'zod';
import type { formSchema } from '.';
import type { BlogDetailsType } from '@/lib/constants';
import { MUTATIONS } from '@/queries';
import useSendRequest from '@/lib/hooks/useSendRequest';
import { toast } from 'sonner';

/** Upload one picture and give back its web address. */
const uploadPicture = async (file: File) => {
  const res = await MUTATIONS.uploadImage({ image: file });
  return (res.data as { url?: string; data?: { url: string } }).url ?? (res.data as { data: { url: string } }).data.url;
};

interface EditorToolbarProps {
  editor: Editor | null;
}

const EditorToolbar = ({ editor }: EditorToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [galleryBusy, setGalleryBusy] = useState(false);
  const [, setUpdateTrigger] = useState(0);

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

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      setUpdateTrigger(prev => prev + 1);
    };

    editor.on('selectionUpdate', handleUpdate);
    editor.on('transaction', handleUpdate);

    return () => {
      editor.off('selectionUpdate', handleUpdate);
      editor.off('transaction', handleUpdate);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (isPending) {
      toast.success(`Upload Message`, {
        description: `Uploading image...`,
        className:
          '!bg-[#FFFCF5] !border !border-[#FEC84B] !shadow-[0px_1px_2px_0px_#1018280D] [&_div]:!text-[#B54708] [&>div>div]:last:!font-light !text-sm !leading-5',
      });
    }
  }, [isPending]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    mutate(
      { image: file },
      {
        onSuccess: data => {
          // data.url is the URL returned from your backend
          editor.chain().focus().setImage({ src: data.data.url }).run();
        },
      },
    );

    // Reset input so the same file can be selected again
    event.target.value = '';
  };

  // Several pictures at once become one slide gallery.
  const handleGalleryChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!files.length) return;
    setGalleryBusy(true);
    const id = toast.loading(`Uploading ${files.length} picture${files.length > 1 ? 's' : ''}…`);
    try {
      const urls: string[] = [];
      for (const f of files) urls.push(await uploadPicture(f));
      editor.chain().focus().insertGallery(urls.map(src => ({ src }))).run();
      toast.success('Gallery added', { id, description: 'Click it to move it, resize it or add more slides.' });
    } catch {
      toast.error('Could not upload those pictures', { id });
    } finally {
      setGalleryBusy(false);
    }
  };

  const setHeading = (level: 1 | 2 | 3) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  return (
    <div className="sticky top-0 z-30 mb-2 flex flex-wrap items-center gap-2 rounded bg-[#F1F1F1] p-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <input
        ref={galleryInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/gif,image/webp"
        onChange={handleGalleryChange}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleImageUpload}
        title="Add one picture"
        className="bg-white hover:bg-gray-100"
      >
        <ImageIcon size={16} /> Picture
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={galleryBusy}
        onClick={() => galleryInputRef.current?.click()}
        title="Add a slide gallery (pick several pictures)"
        className="bg-white hover:bg-gray-100"
      >
        <GalleryHorizontal size={16} /> Gallery
      </Button>

      <div className="h-6 w-px bg-gray-300" />

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={() => setHeading(1)}
        title="Heading 1"
        className={
          editor.isActive('heading', { level: 1 })
            ? 'bg-[#305B43] text-[#D0EA50] hover:bg-[#305B43] hover:text-[#D0EA50]'
            : 'bg-transparent text-black hover:bg-[#305B43]/80'
        }
      >
        <Heading1 size={16} />
      </Button>

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={() => setHeading(2)}
        title="Heading 2"
        className={
          editor.isActive('heading', { level: 2 })
            ? 'bg-[#305B43] text-[#D0EA50] hover:bg-[#305B43] hover:text-[#D0EA50]'
            : 'bg-transparent text-black hover:bg-[#305B43]/80'
        }
      >
        <Heading2 size={16} />
      </Button>

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={() => setHeading(3)}
        title="Heading 3"
        className={
          editor.isActive('heading', { level: 3 })
            ? 'bg-[#305B43] text-[#D0EA50] hover:bg-[#305B43] hover:text-[#D0EA50]'
            : 'bg-transparent text-black hover:bg-[#305B43]/80'
        }
      >
        <Heading3 size={16} />
      </Button>
      <p className="ml-auto text-[11px] text-[#737373]">Click a picture or gallery to place it left, centre, right or full width, resize it, or drag it.</p>
    </div>
  );
};

const Tiptap = (props: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  blogDetailsData: BlogDetailsType;
}) => {
  const { form, blogDetailsData } = props;

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

  useEffect(() => {
    if (isPending) {
      toast.success(`Upload Message`, {
        description: `Uploading image...`,
        className:
          '!bg-[#FFFCF5] !border !border-[#FEC84B] !shadow-[0px_1px_2px_0px_#1018280D] [&_div]:!text-[#B54708] [&>div>div]:last:!font-light !text-sm !leading-5',
      });
    }
  }, [isPending]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        link: false,
      }),
      PositionedImage.configure({ allowBase64: false }),
      Gallery.configure({ upload: uploadPicture }),
      Youtube.configure({
        controls: false,
        nocookie: true,
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      FileHandler.configure({
        allowedMimeTypes: [
          'image/png',
          'image/jpeg',
          'image/gif',
          'image/webp',
        ],
        onDrop: (currentEditor, files, pos) => {
          files.forEach(file => {
            mutate(
              { image: file },
              {
                onSuccess: data => {
                  // data.url is the URL returned from your backend
                  {
                    currentEditor
                      .chain()
                      .insertContentAt(pos, {
                        type: 'image',
                        attrs: {
                          src: data.data.url,
                        },
                      })
                      .focus()
                      .run();
                  }
                },
              },
            );
          });
        },

        onPaste: (currentEditor, files, htmlContent) => {
          files.forEach(file => {
            if (htmlContent) {
              // if there is htmlContent, stop manual insertion & let other extensions handle insertion via inputRule
              // you could extract the pasted file from this url string and upload it to a server for example
              console.log(htmlContent); // eslint-disable-line no-console
              return false;
            }

            mutate(
              { image: file },
              {
                onSuccess: data => {
                  // data.url is the URL returned from your backend
                  {
                    currentEditor
                      .chain()
                      .insertContentAt(currentEditor.state.selection.anchor, {
                        type: 'image',
                        attrs: {
                          src: data.data.url,
                        },
                      })
                      .focus()
                      .run();
                  }
                },
              },
            );
          });
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        protocols: ['http', 'https'],
        isAllowedUri: (url, ctx) => {
          try {
            // construct URL
            const parsedUrl = url.includes(':')
              ? new URL(url)
              : new URL(`${ctx.defaultProtocol}://${url}`);

            // use default validation
            if (!ctx.defaultValidate(parsedUrl.href)) {
              return false;
            }

            // disallowed protocols
            const disallowedProtocols = ['ftp', 'file', 'mailto'];
            const protocol = parsedUrl.protocol.replace(':', '');

            if (disallowedProtocols.includes(protocol)) {
              return false;
            }

            // only allow protocols specified in ctx.protocols
            const allowedProtocols = ctx.protocols.map(p =>
              typeof p === 'string' ? p : p.scheme,
            );

            if (!allowedProtocols.includes(protocol)) {
              return false;
            }

            // disallowed domains
            const disallowedDomains = [
              'example-phishing.com',
              'malicious-site.net',
            ];
            const domain = parsedUrl.hostname;

            if (disallowedDomains.includes(domain)) {
              return false;
            }

            // all checks have passed
            return true;
          } catch {
            return false;
          }
        },
        shouldAutoLink: url => {
          try {
            // construct URL
            const parsedUrl = url.includes(':')
              ? new URL(url)
              : new URL(`https://${url}`);

            // only auto-link if the domain is not in the disallowed list
            const disallowedDomains = [
              'example-no-autolink.com',
              'another-no-autolink.com',
            ];
            const domain = parsedUrl.hostname;

            return !disallowedDomains.includes(domain);
          } catch {
            return false;
          }
        },
      }),
    ],
    content: form.watch('mainContent') || '<p></p>',
    onUpdate: ({ editor }) => {
      form.setValue('mainContent', editor.getHTML(), { shouldDirty: true });
    },
  });

  useEffect(() => {
    if (editor && blogDetailsData?.content) {
      editor.commands.setContent(blogDetailsData.content);
    }
  }, [blogDetailsData?.content, editor]);

  return (
    <div className="flex flex-col">
      <EditorToolbar editor={editor} />
      <EditorContent
        className="ub-editor h-[36rem] overflow-auto rounded bg-[#D9D9D980] px-6 pt-14 pb-10 [&_a]:text-blue-400 [&_a]:underline [&_h1]:text-4xl [&_h1]:leading-[2.75rem] [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:text-3xl [&_h2]:leading-[2.375rem] [&_h2]:font-semibold [&_h2]:tracking-[-0.015em] [&_h3]:text-2xl [&_h3]:leading-8 [&_h3]:font-medium [&_h3]:tracking-[-0.01em]"
        editor={editor}
      />
    </div>
  );
};

export default Tiptap;
