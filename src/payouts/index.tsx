import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { https } from '@/lib/https';
import { formatMoney } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

type Balance = {
  instructor: { id: number; name: string; email: string };
  bank: { bank: string | null; accountNo: string | null; accountName: string | null };
  byCurrency: Record<string, { totalEarning: number; monthlyEarning: number; paidOut: number; pendingPayout: number }>;
};
type Payout = { id: number; instructor: string; currency: string; amount: number; note: string | null; paidAt: string };

const errorMessage = (e: any) => e?.response?.data?.message || e?.message || 'Something went wrong';
const field = 'h-9 rounded-lg border border-[#D9D9D9] bg-white px-3 text-sm outline-none focus:border-[#305B43]';

const Payouts = () => {
  const qc = useQueryClient();
  const balances = useQuery({
    queryKey: ['payout-balances'],
    queryFn: () => https.get('/admin/payouts/balances').then(r => r.data as { data: Balance[]; sharePercent: number }),
  });
  const history = useQuery({
    queryKey: ['payouts'],
    queryFn: () => https.get('/admin/payouts', { params: { limit: 50 } }).then(r => r.data.data as Payout[]),
  });

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1>Instructor payouts</h1>
        <p className="max-w-2xl text-sm text-[#737373]">
          Instructors keep {balances.data?.sharePercent ?? 80}% of each paid 1-1 session; Upbreed keeps the rest. Send the
          bank transfer first, then record it here so their dashboard shows it as paid.
        </p>
      </div>

      {balances.isPending ? (
        <Skeleton className="h-32 w-full" />
      ) : balances.isError ? (
        <p className="text-sm text-red-600">Could not load balances.</p>
      ) : !balances.data.data.length ? (
        <p className="text-sm text-[#737373]">No instructor has earned anything yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {balances.data.data.map(b => (
            <div key={b.instructor.id} className="flex flex-col gap-3 rounded-xl border border-[#D9D9D9] p-5 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-semibold">{b.instructor.name}</p>
                  <p className="text-xs text-[#737373]">{b.instructor.email}</p>
                </div>
                <p className="text-xs text-[#737373]">
                  {b.bank.bank ? `${b.bank.bank} · ${b.bank.accountNo ?? ''} · ${b.bank.accountName ?? ''}` : 'No bank details yet'}
                </p>
              </div>
              {Object.entries(b.byCurrency).map(([currency, e]) => (
                <PayoutRow key={currency} instructorId={b.instructor.id} currency={currency} e={e} onDone={() => { qc.invalidateQueries({ queryKey: ['payout-balances'] }); qc.invalidateQueries({ queryKey: ['payouts'] }); }} />
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="font-semibold">Payout history</p>
        {!history.data?.length ? (
          <p className="text-sm text-[#737373]">No payouts recorded yet.</p>
        ) : (
          <ul className="flex flex-col text-sm">
            {history.data.map(p => (
              <li key={p.id} className="flex justify-between border-b border-[#EDEDED] py-2">
                <span>
                  {p.instructor} · {new Date(p.paidAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  {p.note && <span className="text-[#737373]"> · {p.note}</span>}
                </span>
                <span className="font-semibold">{formatMoney(p.amount, p.currency)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

function PayoutRow(props: { instructorId: number; currency: string; e: Balance['byCurrency'][string]; onDone: () => void }) {
  const { instructorId, currency, e, onDone } = props;
  const [amount, setAmount] = useState(String(e.pendingPayout));
  const [note, setNote] = useState('');
  const record = useMutation({
    mutationFn: () => https.post('/admin/payouts', { instructorId, currency, amount: Number(amount), note: note || undefined }),
    onSuccess: () => {
      toast.success('Payout recorded');
      setNote('');
      onDone();
    },
    onError: err => toast.error('Could not record payout', { description: errorMessage(err) }),
  });
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg bg-[#F4F4F4] p-3">
      <div className="flex gap-6">
        <div>
          <p className="text-xs text-[#737373]">Earned</p>
          <p className="font-semibold">{formatMoney(e.totalEarning, currency)}</p>
        </div>
        <div>
          <p className="text-xs text-[#737373]">Paid</p>
          <p className="font-semibold">{formatMoney(e.paidOut, currency)}</p>
        </div>
        <div>
          <p className="text-xs text-[#737373]">Owed</p>
          <p className="font-bold text-[#305B43]">{formatMoney(e.pendingPayout, currency)}</p>
        </div>
      </div>
      {e.pendingPayout > 0 && (
        <form
          className="ml-auto flex flex-wrap items-end gap-2"
          onSubmit={ev => {
            ev.preventDefault();
            if (window.confirm(`Record a payout of ${formatMoney(Number(amount), currency)}?`)) record.mutate();
          }}
        >
          <input type="number" min="0.01" step="0.01" max={e.pendingPayout} className={`${field} w-32`} value={amount} onChange={ev => setAmount(ev.target.value)} />
          <input className={`${field} w-48`} placeholder="Note (e.g. Q4 transfer)" value={note} onChange={ev => setNote(ev.target.value)} />
          <Button type="submit" disabled={record.isPending}>
            Record payout
          </Button>
        </form>
      )}
    </div>
  );
}

export default Payouts;
