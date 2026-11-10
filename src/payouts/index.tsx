import { Card, CardTitle, Segmented, money, num } from '@/components/dash';
import MoneyInput from '@/components/money-input';
import { downloadCsv } from '@/components/save-report';
import { https } from '@/lib/https';
import { cn } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Copy, Download, Landmark, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type Balance = {
  instructor: { id: number; name: string; email: string; photo?: string | null };
  bank: { bank: string | null; accountNo: string | null; accountName: string | null };
  byCurrency: Record<string, { totalEarning: number; monthlyEarning: number; paidOut: number; pendingPayout: number }>;
  requests?: { id: number; currency: string; amount: number; requestedAt: string }[];
};
type Payout = { id: number; instructor: string; instructorId: number; currency: string; amount: number; note: string | null; paidAt: string };
type Filter = 'asked' | 'ready' | 'all';

/** Same minimums the API uses before an instructor can ask to be paid. */
const MINIMUM: Record<string, number> = { NGN: 100_000, USD: 100, GHS: 1_500, KES: 13_000, ZAR: 1_800, GBP: 80, EUR: 90 };
const errorMessage = (e: unknown) => (e as { response?: { data?: { message?: string } } })?.response?.data?.message || (e as Error)?.message || 'Something went wrong';
const initials = (n: string) =>
  n
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('');
const date = (iso: string) => new Date(iso).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' });

const Payouts = () => {
  const qc = useQueryClient();
  const [currency, setCurrency] = useState('NGN');
  const [filter, setFilter] = useState<Filter>('all');
  const balances = useQuery({
    queryKey: ['payout-balances'],
    queryFn: () => https.get('/admin/payouts/balances').then(r => r.data as { data: Balance[]; sharePercent: number }),
  });
  const history = useQuery({
    queryKey: ['payouts'],
    queryFn: () => https.get('/admin/payouts', { params: { limit: 100 } }).then(r => r.data.data as Payout[]),
  });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['payout-balances'] });
    qc.invalidateQueries({ queryKey: ['payouts'] });
    qc.invalidateQueries({ queryKey: ['admin-overview'] });
  };

  const minimum = MINIMUM[currency] ?? 100;
  const currencies = [...new Set(['NGN', 'USD', ...(balances.data?.data ?? []).flatMap(b => Object.keys(b.byCurrency)), ...(history.data ?? []).map(p => p.currency)])];
  const rows = (balances.data?.data ?? [])
    .map(b => {
      const e = b.byCurrency[currency] ?? { totalEarning: 0, monthlyEarning: 0, paidOut: 0, pendingPayout: 0 };
      const request = b.requests?.find(r => r.currency === currency);
      return { ...b, e, request, ready: e.pendingPayout >= minimum };
    })
    .filter(r => r.e.totalEarning > 0 || r.e.pendingPayout > 0)
    .sort((a, b) => Number(Boolean(b.request)) - Number(Boolean(a.request)) || Number(b.ready) - Number(a.ready) || b.e.pendingPayout - a.e.pendingPayout);
  const shown = rows.filter(r => (filter === 'asked' ? r.request : filter === 'ready' ? r.ready : true));

  const paid = (history.data ?? []).filter(p => p.currency === currency);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const owedNow = rows.reduce((n, r) => n + r.e.pendingPayout, 0);
  const asked = rows.filter(r => r.request);
  const askedTotal = asked.reduce((n, r) => n + (r.request?.amount ?? 0), 0);
  const paidThisMonth = paid.filter(p => new Date(p.paidAt) >= monthStart).reduce((n, p) => n + p.amount, 0);
  const paidAll = paid.reduce((n, p) => n + p.amount, 0);
  const loading = balances.isPending;

  const stat = (label: string, value: string, note: string, hero?: boolean) => (
    <article className={cn('flex min-w-0 flex-col gap-1.5 rounded-[18px] border p-[18px]', hero ? 'border-[#00230F] bg-[#00230F] text-white' : 'border-[#E3EAE1] bg-white')}>
      <p className={cn('text-[13px] font-medium', hero ? 'text-[#D0EA50]' : 'text-[#5E6B63]')}>{label}</p>
      {loading ? <div className={cn('h-8 w-2/3 animate-pulse rounded', hero ? 'bg-white/10' : 'bg-[#EEF2EC]')} /> : <p className="truncate text-[28px]/[1.15] font-bold tracking-tight tabular-nums">{value}</p>}
      <p className={cn('text-xs', hero ? 'text-[#B9C7BE]' : 'text-[#5E6B63]')}>{note}</p>
    </article>
  );

  return (
    <div className="flex flex-col gap-6 text-[#00230F]">
      <header className="flex flex-wrap items-center gap-4">
        <div className="mr-auto flex flex-col gap-1">
          <h1 className="text-[28px] font-bold tracking-tight">Payouts</h1>
          <p className="max-w-2xl text-sm text-[#5E6B63]">
            Instructors keep {balances.data?.sharePercent ?? 80}% of each paid 1-on-1. Send the bank transfer first, then record it here. Their dashboard shows it as paid and any request they made closes.
          </p>
        </div>
        <Segmented accent="lime" label="Currency" value={currency} options={currencies.slice(0, 5).map(c => ({ value: c, label: c }))} onChange={setCurrency} />
        <button
          type="button"
          disabled={!history.data?.length}
          onClick={() =>
            downloadCsv('upbreed-payouts', [
              ['Date', 'Instructor', 'Currency', 'Amount', 'Note'],
              ...(history.data ?? []).map(p => [p.paidAt.slice(0, 10), p.instructor, p.currency, p.amount, p.note]),
            ])
          }
          className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-[#DDE5DB] bg-white px-3.5 text-[13px] font-semibold hover:border-[#305B43] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="size-4" /> Export CSV
        </button>
      </header>

      <section aria-label="Payout totals" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stat('Owed right now', money(owedNow, currency), `to ${rows.filter(r => r.e.pendingPayout > 0).length} instructor${rows.filter(r => r.e.pendingPayout > 0).length === 1 ? '' : 's'}`, true)}
        {stat('Asked to be paid', money(askedTotal, currency), asked.length ? `${asked.length} request${asked.length === 1 ? '' : 's'} waiting` : 'No requests waiting')}
        {stat('Paid this month', money(paidThisMonth, currency), `${paid.filter(p => new Date(p.paidAt) >= monthStart).length} transfer${paid.filter(p => new Date(p.paidAt) >= monthStart).length === 1 ? '' : 's'}`)}
        {stat('Paid out in total', money(paidAll, currency), `Payouts open at ${money(minimum, currency)}`)}
      </section>

      <Card>
        <CardTitle
          title="Instructors"
          note="Requests first, then everyone who can be paid"
          right={
            <Segmented
              label="Show"
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'asked', label: `Asked (${asked.length})` },
                { value: 'ready', label: `Can be paid (${rows.filter(r => r.ready).length})` },
                { value: 'all', label: `All (${rows.length})` },
              ]}
            />
          }
        />
        {loading ? (
          <div className="flex flex-col gap-3">
            {[0, 1].map(i => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#F3F6F2]" />
            ))}
          </div>
        ) : balances.isError ? (
          <p className="text-sm text-[#A3262A]">Could not load balances. Refresh the page to try again.</p>
        ) : shown.length ? (
          <div className="flex flex-col gap-3">
            {shown.map(r => (
              <InstructorRow key={r.instructor.id} row={r} currency={currency} minimum={minimum} onDone={refresh} />
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-[#5E6B63]">
            {filter === 'asked' ? 'No one has asked to be paid.' : filter === 'ready' ? `No one has reached ${money(minimum, currency)} yet.` : `No instructor has earned anything in ${currency} yet.`}
          </p>
        )}
      </Card>

      <Card>
        <CardTitle title="Payout history" note={`Every transfer you've recorded in ${currency}`} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-[13px]">
            <thead>
              <tr className="text-left text-xs text-[#5E6B63]">
                <th scope="col" className="py-2 pr-2 font-medium">Date</th>
                <th scope="col" className="p-2 font-medium">Instructor</th>
                <th scope="col" className="p-2 font-medium">Note</th>
                <th scope="col" className="py-2 pl-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {paid.map(p => (
                <tr key={p.id} className="border-t border-[#EEF2EC]">
                  <td className="py-3 pr-2 text-[#34433A]">{date(p.paidAt)}</td>
                  <td className="p-2 font-semibold">{p.instructor}</td>
                  <td className="p-2 text-[#5E6B63]">{p.note || '—'}</td>
                  <td className="py-3 pl-2 text-right font-bold tabular-nums">{money(p.amount, p.currency)}</td>
                </tr>
              ))}
              {!history.isPending && !paid.length && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#5E6B63]">
                    No payouts recorded in {currency} yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

function InstructorRow(props: {
  row: Balance & { e: Balance['byCurrency'][string]; request?: NonNullable<Balance['requests']>[number]; ready: boolean };
  currency: string;
  minimum: number;
  onDone: () => void;
}) {
  const { row, currency, minimum, onDone } = props;
  const { instructor, bank, e, request, ready } = row;
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(e.pendingPayout));
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);
  const progress = Math.min(100, Math.round((e.pendingPayout / minimum) * 100));
  const hasBank = Boolean(bank.bank && bank.accountNo);

  const record = useMutation({
    mutationFn: () => https.post('/admin/payouts', { instructorId: instructor.id, currency, amount: Number(amount), note: note || undefined }),
    onSuccess: () => {
      toast.success('Payout recorded', { description: `${money(Number(amount), currency)} to ${instructor.name}` });
      setOpen(false);
      setNote('');
      onDone();
    },
    onError: err => toast.error('Could not record the payout', { description: errorMessage(err) }),
  });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(bank.accountNo ?? '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy');
    }
  };

  return (
    <div className={cn('rounded-2xl border p-5', request ? 'border-[#D0EA50] bg-[#FBFDF2]' : 'border-[#E3EAE1]')}>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        {/* Who */}
        <div className="flex min-w-[220px] flex-1 items-center gap-3">
          {instructor.photo ? (
            <img src={instructor.photo} alt="" className="size-12 shrink-0 rounded-xl object-cover object-top" />
          ) : (
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#305B43] text-sm font-bold text-[#D0EA50]">{initials(instructor.name)}</span>
          )}
          <div className="flex min-w-0 flex-col gap-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{instructor.name}</span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] font-bold',
                  request ? 'bg-[#D0EA50] text-[#00230F]' : ready ? 'bg-[#E3F2DC] text-[#1E5B2E]' : e.pendingPayout > 0 ? 'bg-[#F0F2EF] text-[#5E6B63]' : 'bg-[#F0F2EF] text-[#5E6B63]',
                )}
              >
                {request ? `Asked ${date(request.requestedAt)}` : ready ? 'Can be paid' : e.pendingPayout > 0 ? 'Below minimum' : 'All paid'}
              </span>
            </span>
            <span className="truncate text-xs text-[#5E6B63]">{instructor.email}</span>
          </div>
        </div>

        {/* Bank */}
        <div className="flex min-w-[200px] items-center gap-2.5 text-[13px]">
          {hasBank ? (
            <>
              <Landmark className="size-4 shrink-0 text-[#305B43]" />
              <span className="flex flex-col">
                <span className="font-semibold">{bank.bank}</span>
                <span className="flex items-center gap-1.5 text-[#5E6B63]">
                  <span className="tabular-nums">{bank.accountNo}</span>
                  <button type="button" onClick={copy} aria-label="Copy account number" className="cursor-pointer rounded p-1 hover:bg-[#EEF2EC]">
                    {copied ? <Check className="size-3.5 text-[#1E7B3A]" /> : <Copy className="size-3.5" />}
                  </button>
                </span>
                {bank.accountName && <span className="text-xs text-[#5E6B63]">{bank.accountName}</span>}
              </span>
            </>
          ) : (
            <span className="flex items-center gap-2 rounded-lg bg-[#FFF4D6] px-2.5 py-1.5 text-xs font-semibold text-[#7A4F00]">
              <TriangleAlert className="size-3.5" /> No bank details yet
            </span>
          )}
        </div>

        {/* Money */}
        <div className="flex min-w-[220px] flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-xs text-[#5E6B63]">Owed</span>
            <span className="text-2xl font-bold tabular-nums">{money(e.pendingPayout, currency)}</span>
          </div>
          <span className="h-1.5 overflow-hidden rounded-full bg-[#EEF2EC]" title={`${progress}% of the ${money(minimum, currency)} minimum`}>
            <span className="block h-full rounded-full" style={{ width: `${progress}%`, background: ready ? '#34A853' : '#B9C7BE' }} />
          </span>
          <span className="text-[11px] text-[#5E6B63]">
            Earned {money(e.totalEarning, currency)} · paid {money(e.paidOut, currency)}
          </span>
        </div>

        <button
          type="button"
          disabled={e.pendingPayout <= 0}
          onClick={() => {
            setAmount(String(e.pendingPayout));
            setOpen(o => !o);
          }}
          className={cn(
            'h-11 shrink-0 cursor-pointer rounded-xl px-4 text-[13px] font-bold disabled:cursor-not-allowed disabled:bg-[#F0F2EF] disabled:text-[#9BA59E]',
            open ? 'border border-[#DDE5DB] bg-white text-[#00230F]' : ready ? 'bg-[#D0EA50] text-[#00230F] hover:brightness-95' : 'border border-[#DDE5DB] bg-white text-[#00230F] hover:border-[#305B43]',
          )}
        >
          {open ? 'Cancel' : 'Record payout'}
        </button>
      </div>

      {open && (
        <form
          className="mt-4 flex flex-wrap items-end gap-3 rounded-xl bg-[#F3F6F2] p-4"
          onSubmit={ev => {
            ev.preventDefault();
            if (!Number(amount)) return;
            if (window.confirm(`Record that you sent ${money(Number(amount), currency)} to ${instructor.name}?`)) record.mutate();
          }}
        >
          <label className="flex flex-col gap-1 text-xs font-semibold text-[#34433A]">
            Amount sent ({currency})
            <MoneyInput
              className="h-11 w-44 rounded-xl border border-[#DDE5DB] bg-white px-3 text-sm font-semibold tabular-nums outline-none focus:border-[#305B43]"
              value={amount}
              onValue={setAmount}
              required
            />
          </label>
          <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-xs font-semibold text-[#34433A]">
            Note (optional)
            <input
              className="h-11 rounded-xl border border-[#DDE5DB] bg-white px-3 text-sm font-normal outline-none focus:border-[#305B43]"
              placeholder="e.g. GTBank transfer ref 12345"
              value={note}
              maxLength={500}
              onChange={ev => setNote(ev.target.value)}
            />
          </label>
          <button type="submit" disabled={record.isPending || !Number(amount)} className="h-11 cursor-pointer rounded-xl bg-[#305B43] px-5 text-[13px] font-bold text-white hover:bg-[#00230F] disabled:opacity-50">
            {record.isPending ? 'Saving…' : 'Confirm payout'}
          </button>
          <p className="w-full text-xs text-[#5E6B63]">
            Up to {money(e.pendingPayout, currency)} can be recorded. {num(Number(amount)) !== num(e.pendingPayout) && Number(amount) > 0 ? 'A part payment leaves the rest owed.' : ''}
          </p>
        </form>
      )}
    </div>
  );
}

export default Payouts;
