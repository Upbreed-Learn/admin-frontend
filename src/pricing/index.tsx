import ErrorState from '@/components/error';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { https } from '@/lib/https';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Price = {
  id?: number;
  region: string;
  currency: string;
  amount: number | string;
  provider: 'PAYSTACK' | 'STRIPE';
};
type Plan = {
  id: number;
  name: string;
  period: 'monthly' | 'biannually' | 'annually';
  noDevices: number;
  isActive: boolean;
  allPrices?: Price[];
};
type Options = { currencies: string[]; paystackCurrencies: string[]; yourCountry: string | null };

const PERIODS = ['monthly', 'biannually', 'annually'] as const;
const PERIOD_LABEL = { monthly: 'Monthly', biannually: 'Every 6 months', annually: 'Yearly' };
const FALLBACK_OPTIONS: Options = {
  currencies: ['NGN', 'GHS', 'KES', 'ZAR', 'USD', 'GBP', 'EUR', 'CAD'],
  paystackCurrencies: ['NGN', 'GHS', 'KES', 'ZAR', 'USD'],
  yourCountry: null,
};

const errorMessage = (e: any) => {
  const m = e?.response?.data?.message;
  return Array.isArray(m) ? m.join(', ') : m || e?.message || 'Something went wrong';
};

const field = 'h-9 rounded-lg border border-[#D9D9D9] bg-white px-3 text-sm outline-none focus:border-[#305B43]';

const Pricing = () => {
  const queryClient = useQueryClient();
  const plans = useQuery({
    queryKey: ['plans'],
    queryFn: () => https.get('/subscription', { params: { limit: 50 } }).then(r => r.data.data as Plan[]),
  });
  const options = useQuery({
    queryKey: ['pricing-options'],
    queryFn: () => https.get('/subscription/pricing-options').then(r => r.data as Options),
  });
  const opts = options.data ?? FALLBACK_OPTIONS;

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-2">
        <h1>Pricing</h1>
        <p className="max-w-2xl text-sm text-[#737373]">
          Set a price for each country by hand. Visitors automatically see the price for their country
          (detected from their internet connection). Everyone else sees the <b>DEFAULT</b> price, and
          anyone can choose to pay the DEFAULT price instead. Changing a price only affects new
          subscribers — people already subscribed keep renewing at the price they signed up for.
        </p>
      </div>

      <NewPlan onCreated={() => queryClient.invalidateQueries({ queryKey: ['plans'] })} />

      {plans.isPending ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : plans.isError ? (
        <ErrorState onRetry={() => queryClient.invalidateQueries({ queryKey: ['plans'] })} />
      ) : !plans.data.length ? (
        <p className="text-sm text-[#737373]">No plans yet. Create the first one above.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {plans.data.map(plan => (
            <PlanCard key={plan.id} plan={plan} options={opts} />
          ))}
        </div>
      )}
    </div>
  );
};

function NewPlan({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', period: 'monthly', noDevices: '1', amountUsd: '', amountNaira: '' });
  const create = useMutation({
    mutationFn: () =>
      https.post('/subscription', {
        name: form.name,
        period: form.period,
        noDevices: Number(form.noDevices),
        amountUsd: Number(form.amountUsd),
        amountNaira: Number(form.amountNaira),
      }),
    onSuccess: () => {
      toast.success('Plan created', { description: 'Add more countries below.' });
      setForm({ name: '', period: 'monthly', noDevices: '1', amountUsd: '', amountNaira: '' });
      onCreated();
    },
    onError: e => toast.error('Could not create plan', { description: errorMessage(e) }),
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <form
      className="flex flex-col gap-4 rounded-xl bg-[#F4F4F4] p-6"
      onSubmit={e => {
        e.preventDefault();
        create.mutate();
      }}
    >
      <h2 className="font-semibold">New plan</h2>
      <div className="grid grid-cols-5 gap-3 text-xs text-[#737373]">
        <label className="flex flex-col gap-1">
          Name
          <input required className={field} value={form.name} onChange={set('name')} placeholder="Monthly" />
        </label>
        <label className="flex flex-col gap-1">
          Billing
          <select className={field} value={form.period} onChange={set('period')}>
            {PERIODS.map(p => (
              <option key={p} value={p}>
                {PERIOD_LABEL[p]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Devices
          <input required type="number" min={1} max={20} className={field} value={form.noDevices} onChange={set('noDevices')} />
        </label>
        <label className="flex flex-col gap-1">
          DEFAULT price (USD)
          <input required type="number" min="0.01" step="0.01" className={field} value={form.amountUsd} onChange={set('amountUsd')} />
        </label>
        <label className="flex flex-col gap-1">
          Nigeria price (NGN)
          <input required type="number" min="0.01" step="0.01" className={field} value={form.amountNaira} onChange={set('amountNaira')} />
        </label>
      </div>
      <Button type="submit" disabled={create.isPending} className="self-start">
        {create.isPending ? 'Creating…' : 'Create plan'}
      </Button>
    </form>
  );
}

function PlanCard({ plan, options }: { plan: Plan; options: Options }) {
  const queryClient = useQueryClient();
  const toRows = (p: Plan) =>
    [...(p.allPrices ?? [])].sort((a, b) => (a.region === 'DEFAULT' ? -1 : b.region === 'DEFAULT' ? 1 : a.region.localeCompare(b.region)));
  const [rows, setRows] = useState<Price[]>(toRows(plan));
  useEffect(() => setRows(toRows(plan)), [plan]);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['plans'] });

  const save = useMutation({
    mutationFn: () =>
      https.put(`/subscription/${plan.id}/prices`, {
        prices: rows.map(r => ({ region: r.region.trim().toUpperCase(), currency: r.currency, amount: Number(r.amount), provider: r.provider })),
      }),
    onSuccess: () => {
      toast.success('Prices saved', { description: plan.name });
      refresh();
    },
    onError: e => toast.error('Could not save prices', { description: errorMessage(e) }),
  });
  const toggle = useMutation({
    mutationFn: () => https.patch(`/subscription/${plan.id}`, { isActive: !plan.isActive }),
    onSuccess: refresh,
    onError: e => toast.error('Could not update plan', { description: errorMessage(e) }),
  });
  const remove = useMutation({
    mutationFn: () => https.delete(`/subscription/${plan.id}`),
    onSuccess: () => {
      toast.success('Plan deleted');
      refresh();
    },
    onError: e => toast.error('Could not delete plan', { description: errorMessage(e) }),
  });

  const update = (i: number, patch: Partial<Price>) =>
    setRows(rs =>
      rs.map((r, j) => {
        if (j !== i) return r;
        const next = { ...r, ...patch };
        // Naira defaults to Paystack; Paystack can't take every currency.
        if (patch.currency) next.provider = patch.currency === 'NGN' ? 'PAYSTACK' : 'STRIPE';
        if (next.provider === 'PAYSTACK' && !options.paystackCurrencies.includes(next.currency)) next.provider = 'STRIPE';
        return next;
      }),
    );
  const dirty = JSON.stringify(rows) !== JSON.stringify(toRows(plan));

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#D9D9D9] p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">
            {plan.name}{' '}
            {!plan.isActive && <span className="ml-2 rounded bg-[#D9D9D9] px-2 py-0.5 text-xs font-normal">Hidden</span>}
          </h2>
          <p className="text-xs text-[#737373]">
            {PERIOD_LABEL[plan.period]} · {plan.noDevices} device{plan.noDevices === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <button className="cursor-pointer font-semibold text-[#305B43]" onClick={() => toggle.mutate()} disabled={toggle.isPending}>
            {plan.isActive ? 'Hide from site' : 'Put on sale'}
          </button>
          <button
            className="cursor-pointer"
            aria-label="Delete plan"
            onClick={() => {
              if (window.confirm(`Delete "${plan.name}"? Existing subscribers keep their access.`)) remove.mutate();
            }}
          >
            <Trash className="text-destructive size-5" />
          </button>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead className="text-left text-xs text-[#737373]">
          <tr>
            <th className="pb-2 font-normal">Country code</th>
            <th className="pb-2 font-normal">Currency</th>
            <th className="pb-2 font-normal">Price</th>
            <th className="pb-2 font-normal">Paid through</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="py-1 pr-2">
                <input
                  className={`${field} w-28 uppercase`}
                  value={r.region}
                  maxLength={7}
                  disabled={r.region === 'DEFAULT' && i === 0}
                  placeholder="GH"
                  onChange={e => update(i, { region: e.target.value.toUpperCase() })}
                />
              </td>
              <td className="py-1 pr-2">
                <select className={field} value={r.currency} onChange={e => update(i, { currency: e.target.value })}>
                  {options.currencies.map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </td>
              <td className="py-1 pr-2">
                <input type="number" min="0.01" step="0.01" className={`${field} w-32`} value={r.amount} onChange={e => update(i, { amount: e.target.value })} />
              </td>
              <td className="py-1 pr-2">
                <select className={field} value={r.provider} onChange={e => update(i, { provider: e.target.value as Price['provider'] })}>
                  <option value="STRIPE">Stripe</option>
                  <option value="PAYSTACK" disabled={!options.paystackCurrencies.includes(r.currency)}>
                    Paystack
                  </option>
                </select>
              </td>
              <td className="py-1 text-right">
                {r.region !== 'DEFAULT' && (
                  <button className="cursor-pointer" aria-label="Remove country" onClick={() => setRows(rs => rs.filter((_, j) => j !== i))}>
                    <Trash className="size-4 text-[#737373]" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center gap-4">
        <button
          className="flex cursor-pointer items-center gap-1 text-sm font-semibold"
          onClick={() => setRows(rs => [...rs, { region: '', currency: 'USD', amount: '', provider: 'STRIPE' }])}
        >
          <Plus className="size-4" /> Add country
        </button>
        <Button disabled={!dirty || save.isPending} onClick={() => save.mutate()}>
          {save.isPending ? 'Saving…' : 'Save prices'}
        </Button>
        {dirty && (
          <button className="cursor-pointer text-sm text-[#737373]" onClick={() => setRows(toRows(plan))}>
            Undo changes
          </button>
        )}
      </div>
      <p className="text-xs text-[#737373]">
        Country codes are 2 letters: NG Nigeria, GH Ghana, KE Kenya, ZA South Africa, GB United Kingdom, US
        United States, CA Canada… Use DEFAULT for everyone else. Paystack only works for currencies your
        Paystack business is approved for.
      </p>
    </div>
  );
}

export default Pricing;
