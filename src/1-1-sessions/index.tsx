import DataTable from '@/components/data-table';
import ErrorState from '@/components/error';
import { Button } from '@/components/ui/button';
import PaginationSection from '@/components/ui/custom/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { https } from '@/lib/https';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SessionColumns, type SessionsType } from './columns';

type Stats = { requested: number; awaitingPayment: number; upcoming: number; completed: number };
const FILTERS = [
  { value: '', label: 'All' },
  { value: 'REQUESTED', label: 'Awaiting instructor' },
  { value: 'ACCEPTED', label: 'Awaiting payment' },
  { value: 'CONFIRMED', label: 'Upcoming' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'DECLINED', label: 'Declined' },
  { value: 'EXPIRED', label: 'Expired' },
];

const errorMessage = (e: any) => e?.response?.data?.message || e?.message || 'Something went wrong';

const OneOneSessions = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const queryClient = useQueryClient();
  const { data, isPending, isError } = useQuery({
    queryKey: ['admin-sessions', { page, status }],
    queryFn: () =>
      https
        .get('/admin/sessions', { params: { page, limit: 20, ...(status ? { status } : {}) } })
        .then(r => r.data as { data: SessionsType[]; metadata: { lastPage: number }; stats: Stats }),
  });

  // Coming back from Google after connecting the calendar.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const result = p.get('calendar');
    if (!result) return;
    if (result === 'connected') toast.success('Google Calendar connected', { description: 'New sessions will get Google Meet links.' });
    else toast.error('Could not connect Google Calendar', { description: 'Please try again.' });
    window.history.replaceState({}, '', window.location.pathname);
  }, []);

  const stats = data?.stats;
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex flex-wrap gap-4">
          {[
            ['Completed Sessions', stats?.completed],
            ['Upcoming', stats?.upcoming],
            ['Awaiting payment', stats?.awaitingPayment],
            ['Awaiting instructor', stats?.requested],
          ].map(([label, value]) => (
            <div key={label as string} className="w-max min-w-36 rounded-xl bg-[#305B43] px-6 py-5">
              <p className="text-[2.5rem]/[100%] font-bold text-white">{value ?? '–'}</p>
              <p className="text-[9.05px]/[100%] text-[#D0EA50]">{label}</p>
            </div>
          ))}
        </div>
        <GoogleCalendarCard />
      </div>

      <div className="flex flex-col gap-4 rounded-[9px] bg-[#A1A1A10F] px-14 py-8">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => {
                setStatus(f.value);
                setPage(1);
              }}
              className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold ${status === f.value ? 'bg-[#305B43] text-white' : 'bg-white text-[#737373]'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {isPending ? (
          <div className="flex flex-col gap-2">
            {Array(5)
              .fill(null)
              .map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => queryClient.invalidateQueries({ queryKey: ['admin-sessions'] })} />
        ) : !data.data.length ? (
          <p className="py-10 text-center text-sm text-[#737373]">No sessions yet.</p>
        ) : (
          <DataTable
            columns={SessionColumns}
            data={data.data}
            headerClassName="text-[#737373] font-semibold text-[10px]/[100%]"
            className="h-10 border-none bg-transparent text-[10px]/[100%] font-semibold text-black even:bg-transparent hover:bg-gray-200"
          />
        )}
        <PaginationSection currentPage={page} setCurrentPage={setPage} totalPages={data?.metadata.lastPage} />
      </div>
    </div>
  );
};

function GoogleCalendarCard() {
  const queryClient = useQueryClient();
  const status = useQuery({
    queryKey: ['google-calendar'],
    queryFn: () => https.get('/admin/google-calendar').then(r => r.data as { connected: boolean; email: string | null; configured: boolean }),
  });
  const connect = useMutation({
    mutationFn: () => https.get('/admin/google-calendar/connect').then(r => r.data.url as string),
    onSuccess: url => {
      window.location.href = url;
    },
    onError: e => toast.error('Could not start Google connection', { description: errorMessage(e) }),
  });
  const disconnect = useMutation({
    mutationFn: () => https.delete('/admin/google-calendar'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['google-calendar'] }),
  });
  const s = status.data;
  return (
    <div className="flex max-w-sm flex-col gap-2 rounded-xl border border-[#D9D9D9] p-5 text-sm">
      <p className="font-semibold">Google Meet links</p>
      {status.isPending ? (
        <Skeleton className="h-4 w-48" />
      ) : s?.connected ? (
        <>
          <p className="text-[#737373]">
            Connected{s.email ? ` as ${s.email}` : ''}. Every paid session gets a Google Meet link and a calendar invite.
          </p>
          <button className="cursor-pointer self-start text-xs text-[#737373] underline" onClick={() => disconnect.mutate()}>
            Disconnect
          </button>
        </>
      ) : (
        <>
          <p className="text-[#737373]">
            Connect the Google account Upbreed sends invites from. Until then, instructors add their own meeting link.
          </p>
          <Button className="self-start" disabled={connect.isPending || s?.configured === false} onClick={() => connect.mutate()}>
            Connect Google Calendar
          </Button>
          {s?.configured === false && <p className="text-xs text-[#9B9B9B]">Google keys aren't set on the server yet.</p>}
        </>
      )}
    </div>
  );
}

export default OneOneSessions;
