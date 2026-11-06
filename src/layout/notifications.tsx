import { https } from '@/lib/https';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { Bell, CalendarClock, CreditCard, MessageSquare, UserPlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';

type Item = { id: string; type: 'payment' | 'session' | 'message' | 'signup'; title: string; body: string; at: string; link: string };

const SEEN_KEY = 'upbreed-admin-notifications-seen';
const ICONS = { payment: CreditCard, session: CalendarClock, message: MessageSquare, signup: UserPlus };

const readSeen = () => {
  try {
    return Number(localStorage.getItem(SEEN_KEY)) || 0;
  } catch {
    return 0;
  }
};

function ago(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

/** Bell in the top bar: recent payments, 1-1 requests, contact messages and sign-ups. */
const Notifications = () => {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(readSeen);
  const box = useRef<HTMLDivElement>(null);
  const q = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: () => https.get('/admin/notifications').then(r => r.data as { data: Item[]; unreadMessages: number }),
    refetchInterval: 60_000,
  });
  const items = q.data?.data ?? [];
  const fresh = items.filter(i => new Date(i.at).getTime() > seen).length;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => box.current && !box.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const toggle = () => {
    if (!open && items.length) {
      const newest = Math.max(...items.map(i => new Date(i.at).getTime()));
      try {
        localStorage.setItem(SEEN_KEY, String(newest));
      } catch {
        /* private mode: the badge just won't remember */
      }
      setTimeout(() => setSeen(newest), 4000); // keep "new" dots visible while the list is open
    }
    setOpen(!open);
  };

  return (
    <div ref={box} className="relative">
      <button onClick={toggle} aria-label="Notifications" className="relative grid size-9 cursor-pointer place-items-center rounded-full hover:bg-[#F5F5F5]">
        <Bell className="size-5 text-[#737373]" />
        {fresh > 0 && (
          <span className="absolute -top-0.5 -right-0.5 grid min-w-4 place-items-center rounded-full bg-[#E5484D] px-1 text-[10px] font-bold text-white">
            {fresh > 9 ? '9+' : fresh}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute top-11 right-0 z-50 flex max-h-[28rem] w-[22rem] flex-col overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-[#EEE] px-4 py-3">
            <p className="text-sm font-semibold">Notifications</p>
            <span className="text-[11px] text-[#9B9B9B]">Last 30 days</span>
          </div>
          <div className="overflow-y-auto">
            {q.isPending ? (
              <p className="p-4 text-xs text-[#9B9B9B]">Loading…</p>
            ) : q.isError ? (
              <p className="p-4 text-xs text-red-600">Could not load notifications.</p>
            ) : !items.length ? (
              <p className="p-4 text-xs text-[#9B9B9B]">Nothing new yet.</p>
            ) : (
              items.map(i => {
                const Icon = ICONS[i.type];
                const isNew = new Date(i.at).getTime() > seen;
                return (
                  <Link key={i.id} to={i.link} onClick={() => setOpen(false)} className="flex gap-3 border-b border-[#F3F3F3] px-4 py-3 hover:bg-[#FAFAFA]">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#305B43]/10">
                      <Icon className="size-4 text-[#305B43]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-xs font-semibold text-[#222]">{i.title}</span>
                        {isNew && <span className="size-1.5 shrink-0 rounded-full bg-[#E5484D]" />}
                      </span>
                      <span className="block truncate text-[11px] text-[#737373]">{i.body}</span>
                      <span className={cn('text-[10px] text-[#9B9B9B]')}>{ago(i.at)}</span>
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
